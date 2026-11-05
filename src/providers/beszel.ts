import type { ProviderCtx, ProviderResult } from '../types.js';
import { fetchJson } from './http.js';

/**
 * Beszel esta construido sobre PocketBase. Para leer el estado y las metricas
 * de cada nodo:
 *   1. POST {url}/api/collections/users/auth-with-password  { identity, password }
 *      -> { token }
 *   2. GET  {url}/api/collections/systems/records?perPage=100
 *      -> { items: [{ id, name, status, info: { u, cpu, mp, dp, bb, la, ... } }] }
 * La credencial es el login de un usuario de Beszel (solo lectura recomendado).
 */

interface PbAuthResponse {
  token?: string;
  record?: { id?: string; email?: string };
}

interface SystemInfo {
  u?: number;   // uptime (segundos)
  cpu?: number; // % cpu
  mp?: number;  // % memoria
  dp?: number;  // % disco
  bb?: number;  // bytes de red (acumulado)
  la?: number[]; // load average [1,5,15]
}

interface SystemRecord {
  id: string;
  name: string;
  status?: 'up' | 'down' | 'paused' | 'pending' | string;
  info?: SystemInfo & { dt?: number };
  temp?: number | null;
}

interface PbRecordsResponse {
  items?: SystemRecord[];
}

interface SystemStatsRecord {
  stats?: { t?: Record<string, number> };
}

interface PbStatsResponse {
  items?: SystemStatsRecord[];
}

// Cache del token de autenticacion (PocketBase) para no loguear en cada poll.
let cachedToken: string | null = null;
let tokenExpiry = 0;
const TOKEN_TTL_MS = 45 * 60 * 1000;

async function authenticate(url: string, ctx: ProviderCtx): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const email = ctx.credentials.beszelUserEmail;
  const password = ctx.credentials.beszelUserPassword;
  if (!email || !password) {
    throw new Error('Faltan credenciales de Beszel (beszel_user_email / beszel_user_password)');
  }
  const base = url.replace(/\/$/, '');
  const data = await fetchJson<PbAuthResponse & { error?: string }>(
    `${base}/api/collections/users/auth-with-password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: email, password }),
    },
  );
  if (!data.token) {
    throw new Error(data.error ?? 'Autenticacion a Beszel fallida');
  }
  cachedToken = data.token;
  tokenExpiry = Date.now() + TOKEN_TTL_MS;
  return data.token;
}

/** Devuelve la temperatura (max de sensores) del sistema via system_stats, o null. */
async function fetchTemp(base: string, token: string, systemId: string): Promise<number | null> {
  try {
    const filter = encodeURIComponent(`(system='${systemId}')`);
    const url = `${base}/api/collections/system_stats/records?filter=${filter}&sort=-created&perPage=1`;
    const data = await fetchJson<PbStatsResponse>(url, { headers: { Authorization: token } });
    const t = data.items?.[0]?.stats?.t;
    if (t && typeof t === 'object') {
      const vals = Object.values(t).map((v) => Number(v)).filter((v) => Number.isFinite(v));
      if (vals.length) return Math.max(...vals);
    }
    return null;
  } catch {
    return null;
  }
}

async function listSystems(url: string, token: string): Promise<SystemRecord[]> {
  const base = url.replace(/\/$/, '');
  const data = await fetchJson<PbRecordsResponse>(
    `${base}/api/collections/systems/records?perPage=100&sort=-updated`,
    { headers: { Authorization: token } },
  );
  const items = data.items ?? [];
  // Temperatura por sistema (paralelo, tolerante a fallos).
  const withTemp = await Promise.all(
    items.map(async (s) => ({ ...s, temp: await fetchTemp(base, token, s.id) })),
  );
  return withTemp;
}

export async function check(ctx: ProviderCtx): Promise<ProviderResult> {
  const { url } = ctx.service;
  try {
    const token = await authenticate(url, ctx);
    const systems = await listSystems(url, token);
    if (systems.length === 0) {
      return { status: 'unknown', health: 'Beszel accesible pero sin sistemas' };
    }

    const down = systems.filter((s) => s.status === 'down').length;
    const degraded = systems.some((s) => s.status === 'down' || s.status === 'paused' || s.status === 'pending');
    // El servicio (hub) esta arriba si lo pudimos leer; un nodo apagado se
    // refleja como 'degraded' (no derrumba el estado global del homelab).
    const status = degraded ? 'degraded' : 'up';
    const health = `${systems.length} sistemas · ${down} caidos`;

    const systemsMetrics = systems.map((s) => ({
      name: s.name,
      status: s.status ?? 'unknown',
      cpu: s.info?.cpu ?? null,
      mem: s.info?.mp ?? null,
      disk: s.info?.dp ?? null,
      temp: s.temp ?? null,
      uptime: s.info?.u ?? null,
      load: s.info?.la ?? null,
    }));
    // Orden estable por nombre para que no cambie de sitio entre refrescos.
    systemsMetrics.sort((a, b) => a.name.localeCompare(b.name));
    const worstCpu = Math.max(0, ...systemsMetrics.map((m) => m.cpu ?? 0));
    const worstMem = Math.max(0, ...systemsMetrics.map((m) => m.mem ?? 0));

    return {
      status,
      health,
      metrics: { kind: 'beszel', systems: systemsMetrics, worstCpu, worstMem },
    };
  } catch (err) {
    // Error de red/auth = el hub esta caido (los demas providers hacen lo
    // mismo): 'unknown' se reserva para "accesible pero sin nada que mostrar".
    return {
      status: 'down',
      health: err instanceof Error ? err.message : 'Error al consultar Beszel',
    };
  }
}
