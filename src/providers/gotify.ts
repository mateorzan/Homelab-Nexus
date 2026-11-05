import type { Alert, GotifyApp, GotifyMessage, ProviderCtx, ProviderResult } from '../types.js';
import { fetchJson } from './http.js';

interface RawMessage {
  id: number;
  appid: number;
  message: string;
  title: string;
  priority: number;
  date: string | number;
}

interface MessagesResponse {
  messages?: RawMessage[];
}

interface RawApp {
  id: number;
  name: string;
  description: string;
}

/**
 * Gotify REST API.
 *   GET {url}/application?token=...  ->  [ { id, name, description, ... } ]
 *   GET {url}/message?token=...&limit=..  ->  { messages: [ { id, appid, title, message, priority, date } ] }
 */
async function fetchApps(url: string, token?: string): Promise<RawApp[]> {
  const base = url.replace(/\/$/, '');
  const params = new URLSearchParams();
  if (token) params.set('token', token);
  return fetchJson<RawApp[]>(`${base}/application?${params.toString()}`);
}

async function fetchMessages(url: string, token?: string, limit = 100): Promise<RawMessage[]> {
  const base = url.replace(/\/$/, '');
  const params = new URLSearchParams({ limit: String(limit) });
  if (token) params.set('token', token);
  const data = await fetchJson<MessagesResponse>(`${base}/message?${params.toString()}`);
  return data.messages ?? [];
}

function levelFromPriority(priority: number): 'info' | 'warning' | 'critical' {
  if (priority >= 8) return 'critical';
  if (priority >= 5) return 'warning';
  return 'info';
}

// Ventana que decide el estado del servicio: Gotify es de bajo trafico, asi
// que un critico de hace meses sigue dentro de los ultimos 100 mensajes y no
// debe dejar el servicio en 'down' para siempre.
const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;

function toDate(value: string | number): number {
  const t = typeof value === 'number' ? value : Date.parse(value);
  return Number.isFinite(t) ? t : Date.now();
}

export async function check(ctx: ProviderCtx): Promise<ProviderResult> {
  const { url } = ctx.service;
  const token = ctx.credentials.gotifyToken;
  try {
    const [apps, raw] = await Promise.all([
      fetchApps(url, token),
      fetchMessages(url, token),
    ]);

    const appNames = new Map<number, string>();
    for (const a of apps) appNames.set(a.id, a.name);

    const messages: GotifyMessage[] = raw
      .map((m) => ({
        id: m.id,
        appId: m.appid,
        appName: appNames.get(m.appid) ?? `App ${m.appid}`,
        title: m.title,
        message: m.message,
        priority: m.priority,
        date: toDate(m.date),
      }))
      .sort((a, b) => b.date - a.date);

    const appSummaries = new Map<number, GotifyApp>();
    for (const a of apps) {
      appSummaries.set(a.id, { id: a.id, name: a.name, count: 0, critical: 0 });
    }
    for (const m of messages) {
      const existing = appSummaries.get(m.appId);
      if (existing) {
        existing.count += 1;
        if (levelFromPriority(m.priority) === 'critical') existing.critical += 1;
      }
    }

    // Solo alertas criticas (>=8). Los avisos informativos (up/down) se ven en el feed.
    const alerts: Alert[] = messages
      .filter((m) => m.priority >= 8)
      .slice(0, 20)
      .map((m) => ({
        id: `gotify-${m.id}`,
        level: 'critical' as const,
        source: `Gotify · ${m.appName}`,
        message: `${m.title || 'Sin titulo'}: ${m.message}`.slice(0, 160),
        time: m.date,
      }));

    const recent = messages.filter((m) => Date.now() - m.date <= RECENT_WINDOW_MS);
    const recentCritical = recent.filter((m) => levelFromPriority(m.priority) === 'critical').length;
    const recentWarnings = recent.filter((m) => levelFromPriority(m.priority) === 'warning').length;
    const health = `${raw.length} mensajes · ${recentCritical} criticos`;
    const status = recentCritical > 0 ? 'down' : recentWarnings > 0 ? 'degraded' : 'up';

    return {
      status,
      health,
      alerts,
      metrics: {
        kind: 'gotify',
        totalMessages: raw.length,
        apps: [...appSummaries.values()],
        messages,
        lastMessage: messages[0] ?? null,
      },
    };
  } catch (err) {
    return {
      status: 'down',
      health: err instanceof Error ? err.message : 'Error al consultar Gotify',
    };
  }
}
