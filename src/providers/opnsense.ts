import type { ProviderCtx, ProviderResult } from '../types.js';
import { fetchJson } from './http.js';

interface OpnsenseState {
  states?: unknown[];
  active?: number;
  pending?: number;
}

interface DiagnosticResponse {
  states?: OpnsenseState;
  ifstates?: {
    [name: string]: {
      status?: string;
      inMb?: number;
      outMb?: number;
    };
  };
}

/**
 * OPNsense Core API v2 (REST). Se autentica con Basic auth: usuario=API key,
 * password=API secret. Endpoints a validar con la instancia; los principales
 * para resumen son los de diagnostico de firewall/estados e interfaces.
 */
async function callApi(url: string, key: string, secret: string): Promise<DiagnosticResponse> {
  const base = url.replace(/\/$/, '');
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };
  const errors: string[] = [];
  const candidates = [
    () => fetchJson<DiagnosticResponse>(`${base}/api/diagnostics/firewall/states`, { headers }),
    () => fetchJson<DiagnosticResponse>(`${base}/api/diagnostics/ifstates`, { headers }),
    () => fetchJson<DiagnosticResponse>(`${base}/api/diagnostics/firewall`, { headers }),
  ];
  for (const attempt of candidates) {
    try {
      const data = await attempt();
      if (data) return data;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }
  throw new Error(
    `OPNsense: no se pudo autenticar o leer diagnostico (${errors[0] ?? 'sin respuesta'}). ` +
      'Verificar plugin API y credenciales.',
  );
}

export async function check(ctx: ProviderCtx): Promise<ProviderResult> {  const { url } = ctx.service;
  const key = ctx.credentials.opnsenseApiKey;
  const secret = ctx.credentials.opnsenseApiSecret;
  if (!key || !secret) {
    return {
      status: 'unknown',
      health: 'Faltan credenciales OPNsense (api_key / api_secret)',
    };
  }
  try {
    const data = await callApi(url, key, secret);
    const statesObj: OpnsenseState | undefined =
      data.states ?? (data as unknown as { results?: { states?: OpnsenseState } }).results?.states;

    const interfaces: Record<string, { status?: string; inMb?: number; outMb?: number }> =
      data.ifstates ?? (data as unknown as { ifstates?: Record<string, { status?: string; inMb?: number; outMb?: number }> }).ifstates ?? {};

    const ifList = Object.entries(interfaces).map(([name, itf]) => ({
      name,
      status: (itf?.status === 'up' ? 'up' : itf?.status === 'DOWN' ? 'down' : 'down') as 'up' | 'down',
      inMb: itf?.inMb ?? 0,
      outMb: itf?.outMb ?? 0,
    }));

    const statesArr = Array.isArray(statesObj?.states) ? statesObj?.states : [];
    const active = statesObj?.active ?? statesArr.length;
    const pending = statesObj?.pending ?? 0;
    const blocking = pending > 0 || ifList.some((i) => i.status === 'down');
    const health = `${active} estados de firewall · ${pending} pendientes`;
    return {
      status: blocking ? 'degraded' : 'up',
      health,
      metrics: {
        kind: 'opnsense',
        states: active,
        activeStates: active,
        pendingStates: pending,
        interfaces: ifList,
        loadOne: null,
        memUsedPct: null,
      },
    };
  } catch (err) {
    return {
      status: 'down',
      health: err instanceof Error ? err.message : 'Error al consultar OPNsense',
    };
  }
}
