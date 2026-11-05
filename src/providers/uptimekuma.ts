import type { ProviderCtx, ProviderResult } from '../types.js';
import { fetchJson } from './http.js';

interface UptimeKumaMonitor {
  id: number;
  name: string;
  status: string;
  uptime?: number;
  uptime24h?: number;
}

interface UptimeKumaService {
  monitors?: UptimeKumaMonitor[];
}

interface UptimeKumaGroup {
  monitorList?: UptimeKumaMonitor[];
}

interface StatusPageResponse {
  services?: UptimeKumaService[];
  publicGroupList?: UptimeKumaGroup[];
  config?: { title?: string };
}

interface HeartbeatEntry {
  status: number;
  time: string;
  msg: string;
  ping: number | null;
}

interface HeartbeatResponse {
  heartbeatList?: Record<string, HeartbeatEntry[]>;
  uptimeList?: Record<string, string>;
}

function normalizeSlug(input?: string): string | undefined {
  if (!input) return input;
  const s = input.trim().replace(/^\/?status\/?/, '').replace(/\/$/, '');
  return s || undefined;
}

interface StatusPageLookup {
  page: StatusPageResponse;
  /** Slug que devolvio una status page con monitores (para el heartbeat). */
  slug: string;
}

async function fetchStatusPage(url: string, slug?: string): Promise<StatusPageLookup> {
  const base = url.replace(/\/$/, '');
  const normalized = normalizeSlug(slug);
  const candidateSlugs = normalized ? [normalized] : ['status', 'dashboard', 'public'];
  let lastError = '';
  for (const s of candidateSlugs) {
    try {
      const data = await fetchJson<StatusPageResponse>(`${base}/api/status-page/${s}`);
      if (data && (data.services?.length || data.publicGroupList?.length)) return { page: data, slug: s };
      lastError = 'status page sin monitores';
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  throw new Error(`Uptime Kuma: no se encontro status page. ${lastError}`);
}

async function fetchHeartbeats(url: string, slug: string): Promise<HeartbeatResponse> {
  const base = url.replace(/\/$/, '');
  try {
    return await fetchJson<HeartbeatResponse>(`${base}/api/status-page/heartbeat/${slug}`);
  } catch {
    return {};
  }
}

type MonitorUrlEntry = { label: string; url: string };
type MonitorUrlMap = Record<string, MonitorUrlEntry[]>;

function normalizeMonitorUrls(raw: string | undefined): MonitorUrlMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    const result: MonitorUrlMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') {
        result[key] = [{ label: 'Abrir', url: value }];
      } else if (Array.isArray(value)) {
        result[key] = value as MonitorUrlEntry[];
      }
    }
    return result;
  } catch {
    return {};
  }
}

export async function check(ctx: ProviderCtx): Promise<ProviderResult> {
  const { url } = ctx.service;
  const slug = ctx.credentials.uptimekumaStatusPage;
  const monitorUrls = normalizeMonitorUrls(ctx.credentials.uptimekumaMonitorUrls);
  try {
    const { page: data, slug: resolvedSlug } = await fetchStatusPage(url, slug);
    const monitors: UptimeKumaMonitor[] = [];
    for (const svc of data.services ?? []) {
      monitors.push(...(svc.monitors ?? []));
    }
    for (const grp of data.publicGroupList ?? []) {
      monitors.push(...(grp.monitorList ?? []));
    }
    if (monitors.length === 0) {
      return { status: 'unknown', health: 'Uptime Kuma accesible pero sin monitores' };
    }

    const heartbeatData = await fetchHeartbeats(url, resolvedSlug);
    const heartbeatList = heartbeatData.heartbeatList ?? {};
    const uptimeList = heartbeatData.uptimeList ?? {};

    const hasHeartbeatData = Object.keys(heartbeatList).length > 0;

    const enriched = monitors
      .filter((m) => m.name && m.name.trim() !== '')
      .map((m) => {
        if (hasHeartbeatData) {
          const heartbeats = heartbeatList[String(m.id)];
          const latest = heartbeats?.[heartbeats.length - 1];
          const uptimeKey = `${m.id}_24`;
          const uptimeRaw = uptimeList[uptimeKey];
          const uptime24h = uptimeRaw != null ? parseFloat(uptimeRaw) * 100 : null;
          const status: 'up' | 'down' | 'pending' | 'maintenance' | 'unknown' =
            latest?.status === 1 ? 'up' :
            latest?.status === 0 ? 'down' :
            'pending';
          return {
            name: m.name,
            status,
            uptime24h,
            latency: latest?.ping ?? null,
            urls: monitorUrls[m.name],
          };
        }
        const status = (['up', 'down', 'pending', 'maintenance'].includes(m.status)
          ? m.status
          : 'unknown') as 'up' | 'down' | 'pending' | 'maintenance' | 'unknown';
        return {
          name: m.name,
          status,
          uptime24h: m.uptime ?? null,
          latency: null,
          urls: monitorUrls[m.name],
        };
      });

    if (enriched.length === 0) {
      return {
        status: 'unknown',
        health: `${monitors.length} monitores (sin datos de estado)`,
        metrics: { kind: 'uptimekuma', monitors: [] },
      };
    }
    const down = enriched.filter((m) => m.status === 'down').length;
    const anyUp = enriched.some((m) => m.status === 'up');
    let status: 'up' | 'down' | 'degraded' | 'unknown';
    if (down > 0 && !anyUp) status = 'down';
    else if (down > 0) status = 'degraded';
    else if (anyUp) status = enriched.some((m) => m.status === 'pending') ? 'degraded' : 'up';
    else status = 'unknown';
    const health = `${enriched.length} monitores${down ? ` · ${down} down` : ''}`;
    return {
      status,
      health,
      metrics: { kind: 'uptimekuma', monitors: enriched },
    };
  } catch (err) {
    return {
      status: 'down',
      health: err instanceof Error ? err.message : 'Error al consultar Uptime Kuma',
    };
  }
}
