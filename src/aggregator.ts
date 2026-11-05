import type {
  Alert,
  OverallStatus,
  ProviderCtx,
  ProviderResult,
  ServiceSummary,
  SummaryResponse,
} from './types.js';
import { EventEmitter } from 'node:events';
import * as beszel from './providers/beszel.js';
import * as uptimekuma from './providers/uptimekuma.js';
import * as gotify from './providers/gotify.js';
import * as opnsense from './providers/opnsense.js';
import type { ServiceConfig } from './types.js';
import type { AlertsStore } from './alerts-store.js';

type ProviderCheck = (ctx: ProviderCtx) => Promise<ProviderResult>;

const PROVIDERS: Record<string, ProviderCheck> = {
  beszel: beszel.check,
  uptimekuma: uptimekuma.check,
  gotify: gotify.check,
  opnsense: opnsense.check,
};

export function overallFrom(statuses: ServiceSummary[]): OverallStatus {
  // A service outage changes the dashboard to warning; critical details are
  // shown in the alerts panel rather than turning the overall status red.
  if (statuses.some((s) => s.status === 'degraded' || s.status === 'down')) return 'warning';
  return 'ok';
}

export class Aggregator extends EventEmitter {
  private lastSummaries: Map<string, ServiceSummary> = new Map();
  private lastSummary: SummaryResponse | null = null;
  private generatedAt = 0;
  private timer?: NodeJS.Timeout;
  private alertStore?: AlertsStore;
  // Un solo poll en vuelo: si uno tarda mas que el intervalo (servicio que
  // cuelga), los siguientes ticks reutilizan esa promesa en vez de apilar
  // peticiones y sobrescribir el resumen con datos mas antiguos.
  private pollInFlight: Promise<SummaryResponse> | null = null;
  // Alertas de infraestructura vivas, generadas por transicion. Los ids son
  // estables, asi que el estado (leida/resuelta) persiste en el store.
  private infraAlerts = new Map<string, Alert>();

  constructor(
    private services: ServiceConfig[],
    private credentials: Record<string, string | undefined>,
    private intervalMs: number,
  ) {
    super();
  }

  private async pollOne(service: ServiceConfig): Promise<ServiceSummary> {
    const provider = PROVIDERS[service.id];
    const ctx: ProviderCtx = { service, credentials: this.credentials };
    let result: ProviderResult;
    if (provider) {
      result = await provider(ctx);
    } else {
      result = { status: 'unknown', health: `Proveedor '${service.id}' no implementado` };
    }
    return {
      id: service.id,
      name: service.name,
      icon: service.icon,
      status: result.status,
      url: service.url,
      health: result.health,
      checkTime: Date.now(),
      metrics: result.metrics,
      alerts: result.alerts,
    };
  }

  pollAll(): Promise<SummaryResponse> {
    if (this.pollInFlight) return this.pollInFlight;
    this.pollInFlight = this.doPollAll().finally(() => {
      this.pollInFlight = null;
    });
    return this.pollInFlight;
  }

  private async doPollAll(): Promise<SummaryResponse> {
    const results = await Promise.all(
      this.services.map((s) => this.pollOne(s).catch((err): ServiceSummary => ({
        id: s.id,
        name: s.name,
        icon: s.icon,
        status: 'unknown',
        url: s.url,
        health: err instanceof Error ? err.message : 'Error desconocido',
        checkTime: Date.now(),
      }))),
    );
    for (const r of results) {
      const prev = this.lastSummaries.get(r.id);
      // Si el servicio dejo de responder conservamos sus ultimas metricas
      // buenas, marcadas como caducas: la UI las apaga en vez de pintarlas
      // como si estuvieran vivas.
      if (!r.metrics && prev?.metrics) {
        r.metrics = prev.metrics;
        r.metricsStaleSince = prev.checkTime;
      }
    }
    const infraAlerts = this.updateInfraAlerts(results);
    for (const r of results) {
      const extra = infraAlerts.get(r.id);
      if (extra?.length) r.alerts = [...(r.alerts ?? []), ...extra];
      this.lastSummaries.set(r.id, r);
    }
    this.generatedAt = Date.now();
    const summary = this.buildSummary(results);
    this.lastSummary = summary;
    this.emit('update', summary);
    return summary;
  }

  getSummary(): SummaryResponse {
    if (this.lastSummary) return this.lastSummary;
    // Sin snapshot aun: dispara un poll en segundo plano y devuelve un stub.
    // Solo si no hay ya uno en vuelo, para que N requests simultaneos no
    // disparen N polls.
    if (!this.pollInFlight) void this.pollAll().catch(() => undefined);
    return {
      generatedAt: this.generatedAt,
      overallStatus: 'ok',
      services: this.services.map((s) => ({
        id: s.id,
        name: s.name,
        icon: s.icon,
        status: 'unknown',
        url: s.url,
        health: 'Cargando…',
        checkTime: Date.now(),
      })),
      alerts: [],
      resolvedAlerts: [],
    };
  }

  private buildSummary(services: ServiceSummary[]): SummaryResponse {
    const alerts: Alert[] = [];
    const liveResolved: Alert[] = [];
    // Alertas de los proveedores (p.ej. Gotify criticos) = estado actual.
    for (const svc of services) {
      for (const alert of svc.alerts ?? []) {
        const state = this.alertStore?.get(alert.id) ?? 'unread';
        const annotated: Alert = { ...alert, state };
        if (state === 'resolved') liveResolved.push(annotated);
        else alerts.push(annotated);
      }
    }
    alerts.sort((a, b) => b.time - a.time);

    const resolvedMap = new Map<string, Alert>();
    for (const rec of this.alertStore?.resolvedRecords() ?? []) {
      resolvedMap.set(rec.id, { ...rec, state: 'resolved' });
    }
    for (const rec of liveResolved) resolvedMap.set(rec.id, rec);
    const resolvedAlerts = [...resolvedMap.values()]
      .sort((a, b) => b.time - a.time)
      .slice(0, 50);

    return {
      generatedAt: this.generatedAt,
      overallStatus: overallFrom(services),
      services,
      alerts: alerts.slice(0, 100),
      resolvedAlerts: resolvedAlerts.slice(0, 100),
    };
  }

  /** Servicios cuya caida genera alerta propia (Gotify no: emite las suyas). */
  private static readonly INFRA_ALERT_SERVICES = new Set(['beszel', 'uptimekuma', 'opnsense']);

  private slug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  /**
   * Alertas de infraestructura por transicion: solo aparecen cuando algo
   * pasa de arriba a caido (una sola vez, no una por poll) y se resuelven
   * solas al volver. Cubre servicios caidos (Beszel/Kuma/OPNsense) y cada
   * nodo de Beszel por separado.
   */
  private updateInfraAlerts(services: ServiceSummary[]): Map<string, Alert[]> {
    const now = Date.now();
    const byService = new Map<string, Alert[]>();
    const downIds = new Set<string>();

    const markDown = (serviceId: string, id: string, source: string, message: string): void => {
      downIds.add(id);
      let alert = this.infraAlerts.get(id);
      if (!alert) {
        alert = { id, level: 'critical', source, message: message.slice(0, 160), time: now };
        this.infraAlerts.set(id, alert);
        // Caida nueva (o reincidencia): vuelve a aparecer como no leida
        // aunque la anterior este resuelta.
        this.alertStore?.set(id, 'unread');
      }
      const list = byService.get(serviceId) ?? [];
      list.push(alert);
      byService.set(serviceId, list);
    };

    for (const svc of services) {
      if (Aggregator.INFRA_ALERT_SERVICES.has(svc.id) && svc.status === 'down') {
        markDown(
          svc.id,
          `svc-down-${svc.id}`,
          `Infraestructura · ${svc.name}`,
          `${svc.name} no responde (${svc.health})`,
        );
      }
      // Nodo de Beszel caido: alerta por nodo (ids estables por nombre).
      if (svc.id === 'beszel' && svc.metrics?.kind === 'beszel') {
        for (const node of svc.metrics.systems) {
          if (!node.name || node.status !== 'down') continue;
          markDown(
            'beszel',
            `beszel-down-${this.slug(node.name)}`,
            `Infraestructura · Beszel · ${node.name}`,
            `El nodo ${node.name} de Beszel esta caido`,
          );
        }
      }
    }

    // Lo que ya no esta caido se resuelve solo y queda en "Resueltas".
    for (const [id, alert] of this.infraAlerts) {
      if (downIds.has(id)) continue;
      this.infraAlerts.delete(id);
      this.alertStore?.set(id, 'resolved', alert);
    }

    return byService;
  }

  setAlertStateStore(store: AlertsStore): void {
    this.alertStore = store;
  }

  refresh(): void {
    if (!this.lastSummary) return;
    const summary = this.buildSummary([...this.lastSummaries.values()]);
    this.lastSummary = summary;
    this.emit('update', summary);
  }

  start(): void {
    if (this.timer) return;
    // Polling inicial no bloqueante.
    void this.pollAll().catch(() => undefined);
    this.timer = setInterval(() => {
      void this.pollAll().catch(() => undefined);
    }, this.intervalMs);
    if (process.env.NODE_ENV !== 'test') this.timer.unref();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  updateCredential(key: string, value: string | undefined): void {
    this.credentials[key] = value;
  }
}
