export type ServiceStatus = 'up' | 'down' | 'degraded' | 'unknown';
export type AlertLevel = 'info' | 'warning' | 'critical';
export type AlertState = 'unread' | 'read' | 'resolved';
export type OverallStatus = 'ok' | 'warning' | 'critical';

export interface Alert {
  id: string;
  level: AlertLevel;
  source: string;
  message: string;
  time: number;
  state?: AlertState;
}

export interface ResolvedAlertRecord {
  id: string;
  level: AlertLevel;
  source: string;
  message: string;
  time: number;
}

export interface BeszelSystemMetric {
  name: string;
  status: string;
  cpu: number | null;
  mem: number | null;
  disk: number | null;
  temp: number | null;
  uptime: number | null;
  load: number[] | null;
}

export interface BeszelMetrics {
  kind: 'beszel';
  systems: BeszelSystemMetric[];
  worstCpu: number;
  worstMem: number;
}

export interface UptimeKumaMetrics {
  kind: 'uptimekuma';
  monitors: Array<{
    name: string;
    status: 'up' | 'down' | 'pending' | 'maintenance' | 'unknown';
    uptime24h: number | null;
    latency: number | null;
    url?: string;
    urls?: Array<{ label: string; url: string }>;
  }>;
}

export interface GotifyMessage {
  id: number;
  appId: number;
  appName: string;
  title: string;
  message: string;
  priority: number;
  date: number;
}

export interface GotifyApp {
  id: number;
  name: string;
  count: number;
  critical: number;
}

export interface GotifyMetrics {
  kind: 'gotify';
  totalMessages: number;
  apps: GotifyApp[];
  messages: GotifyMessage[];
  lastMessage: GotifyMessage | null;
}

export interface OpnsenseMetrics {
  kind: 'opnsense';
  states: number;
  activeStates: number;
  pendingStates: number;
  interfaces: Array<{
    name: string;
    status: 'up' | 'down';
    inMb: number;
    outMb: number;
  }>;
  loadOne: number | null;
  memUsedPct: number | null;
}

export type ServiceMetrics =
  | BeszelMetrics
  | UptimeKumaMetrics
  | GotifyMetrics
  | OpnsenseMetrics;

export interface ServiceSummary {
  id: string;
  name: string;
  icon: string;
  status: ServiceStatus;
  url: string;
  health: string;
  checkTime: number;
  metrics?: ServiceMetrics;
  /** Si el servicio dejo de responder, instante de la ultima lectura buena. */
  metricsStaleSince?: number;
  alerts?: Alert[];
}

export interface SummaryResponse {
  generatedAt: number;
  overallStatus: OverallStatus;
  services: ServiceSummary[];
  alerts: Alert[];
  resolvedAlerts: ResolvedAlertRecord[];
}

export interface ProviderResult {
  status: ServiceStatus;
  health: string;
  metrics?: ServiceMetrics;
  alerts?: Alert[];
}

export interface ProviderCtx {
  service: ServiceConfig;
  credentials: Record<string, string | undefined>;
}

export interface ServiceConfig {
  id: string;
  name: string;
  icon: string;
  url: string;
}
