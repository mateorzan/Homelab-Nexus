import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import { loadConfig, missingRequiredSettings } from './config.js';
import { Aggregator } from './aggregator.js';
import { AlertsStore } from './alerts-store.js';
import type { AlertState, ResolvedAlertRecord, ServiceConfig } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(__dirname, '../data');
const BG_CONFIG_PATH = path.join(CONFIG_DIR, 'bg-config.json');
const MONITOR_URLS_PATH = path.join(CONFIG_DIR, 'monitor-urls.json');
const BOOKMARKS_PATH = path.join(CONFIG_DIR, 'bookmarks.json');
const ALERTS_STATE_PATH = path.join(CONFIG_DIR, 'alerts-state.json');

/** Origenes extra permitidos (env ALLOWED_ORIGINS, separados por coma). */
const EXTRA_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

/**
 * CORS: solo el propio host (hostname o IP, con su puerto) y los origenes
 * extra de la env ALLOWED_ORIGINS. Antes se reflejaba cualquier origen
 * (CSRF: cualquier web visitada podia reescribir fondo, links o marcar
 * alertas).
 */
function isAllowedOrigin(origin: string, hostHeader?: string): boolean {
  const clean = origin.replace(/\/$/, '');
  if (EXTRA_ORIGINS.includes(clean)) return true;
  if (!hostHeader) return false;
  try {
    return new URL(clean).host === hostHeader;
  } catch {
    return false;
  }
}

const SERVICE_ID_SCHEMA = {
  type: 'object',
  properties: { id: { type: 'string', minLength: 1 } },
  required: ['id'],
} as const;

const ALERT_STATE_SCHEMA = {
  type: 'object',
  properties: { id: { type: 'string', minLength: 1 } },
  required: ['id'],
  additionalProperties: false,
} as const;

const ALERT_STATE_BODY_SCHEMA = {
  type: 'object',
  properties: { state: { type: 'string', enum: ['read', 'unread', 'resolved'] } },
  required: ['state'],
  additionalProperties: false,
} as const;

// Las imagenes de fondo viajan en base64: con el limite por defecto de
// Fastify (1MB) cualquier foto real fallaba con 413 en silencio.
const MAX_BODY_BYTES = 8 * 1024 * 1024;

const URL_CHARS = '[^\\s"\'<>\\\\]+';
const HTTP_URL_PATTERN = `^https?://${URL_CHARS}$`;
const BG_IMAGE_PATTERN = `^(https?://${URL_CHARS}|data:image/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+)$`;
const OPTIONAL_HTTP_URL_PATTERN = `^(https?://${URL_CHARS})?$`;
const ICON_PATTERN = `^(https?://${URL_CHARS}|data:image/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+|[^<>\\s]{1,16})$`;

const BG_CONFIG_BODY_SCHEMA = {
  type: 'object',
  properties: {
    bgImage: { anyOf: [{ type: 'string', maxLength: 7_000_000, pattern: BG_IMAGE_PATTERN }, { type: 'null' }] },
    bgBlur: { type: 'number', minimum: 0, maximum: 100 },
    bgPresets: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string', minLength: 1, maxLength: 80 }, url: { type: 'string', maxLength: 7_000_000, pattern: BG_IMAGE_PATTERN } },
        required: ['name', 'url'],
      },
    },
  },
  additionalProperties: false,
} as const;

const BOOKMARKS_BODY_SCHEMA = {
  type: 'object',
  properties: {
    bookmarks: {
      type: 'array',
      maxItems: 200,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', maxLength: 64 },
          title: { type: 'string', maxLength: 120 },
          url: { type: 'string', maxLength: 2048, pattern: OPTIONAL_HTTP_URL_PATTERN },
          icon: { type: 'string', pattern: ICON_PATTERN },
        },
        additionalProperties: false,
      },
    },
  },
  required: ['bookmarks'],
  additionalProperties: false,
} as const;

const MONITOR_URLS_BODY_SCHEMA = {
  type: 'object',
  properties: {
    urls: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        maxItems: 20,
        items: {
          type: 'object',
          properties: {
            label: { type: 'string', maxLength: 80 },
            url: { type: 'string', maxLength: 2048, pattern: HTTP_URL_PATTERN },
          },
          required: ['url'],
          additionalProperties: false,
        },
      },
    },
  },
  required: ['urls'],
  additionalProperties: false,
} as const;

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob: https: http:",
  "connect-src 'self'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ');

export interface AppContext {
  aggregator: Aggregator;
  raw: { port: number; host: string; pollIntervalMs: number };
  services: ServiceConfig[];
  credentials?: Record<string, string | undefined>;
  alertsStore?: AlertsStore;
}

export async function buildApp(ctx?: Partial<AppContext>): Promise<FastifyInstance> {
  let aggregator: Aggregator;
  let raw: AppContext['raw'];
  let services: ServiceConfig[];
  let credentials: Record<string, string | undefined>;

  if (ctx?.aggregator) {
    aggregator = ctx.aggregator;
    raw = ctx.raw!;
    services = ctx.services!;
    credentials = ctx.credentials ?? {};
  } else {
    const config = await loadConfig();
    raw = config.raw;
    services = config.services;
    credentials = config.credentials;
    aggregator = new Aggregator(services, credentials, raw.pollIntervalMs);
  }

  const app = Fastify({ logger: false, bodyLimit: MAX_BODY_BYTES });

  const alertsStore = ctx?.alertsStore ?? new AlertsStore(ALERTS_STATE_PATH);
  aggregator.setAlertStateStore(alertsStore);

  // CORS a mano: reflejamos el origen solo si es el propio host o uno de
  // ALLOWED_ORIGINS; el resto de webs no reciben cabecera (el navegador
  // bloquea la respuesta). Los preflight se contestan con 204.
  app.addHook('onRequest', (req, reply, done) => {
    const origin = req.headers.origin;
    if (!origin) return done();
    const allowed = isAllowedOrigin(origin, req.headers.host);
    reply.header('vary', 'Origin');
    if (req.method === 'OPTIONS') {
      if (allowed) {
        reply.header('access-control-allow-origin', origin);
        reply.header('access-control-allow-methods', 'GET, POST, OPTIONS');
        reply.header('access-control-allow-headers', 'Content-Type');
        reply.header('access-control-max-age', '86400');
      }
      reply.code(204).send();
      return;
    }
    if (allowed) reply.header('access-control-allow-origin', origin);
    done();
  });

  app.addHook('onSend', (_req, reply, payload, done) => {
    reply.header('content-security-policy', CSP);
    reply.header('x-content-type-options', 'nosniff');
    reply.header('referrer-policy', 'no-referrer');
    reply.header('x-frame-options', 'DENY');
    done(null, payload);
  });

  app.get('/api/summary', async () => {
    return aggregator.getSummary();
  });

  app.get('/api/services/:id', {
    schema: { params: SERVICE_ID_SCHEMA },
  }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const snapshot = aggregator.getSummary();
    const svc = snapshot.services.find((s) => s.id === id);
    if (!svc) {
      reply.code(404);
      return { error: `Servicio '${id}' no encontrado` };
    }
    return svc;
  });

  app.get('/api/health', async () => {
    const uptime = process.uptime();
    const mem = process.memoryUsage();
    return {
      status: 'ok',
      time: Date.now(),
      uptime: Math.round(uptime),
      services: services.length,
      pollIntervalMs: raw.pollIntervalMs,
      memoryMb: Math.round(mem.rss / 1024 / 1024),
      version: process.env.APP_VERSION || 'dev',
    };
  });

  app.get('/api/config', async () => {
    let bgImage = process.env.BG_IMAGE || null;
    let bgBlur = 20;
    let bgPresets: Array<{ name: string; url: string }> = [];
    try {
      if (fs.existsSync(BG_CONFIG_PATH)) {
        const cfg = JSON.parse(fs.readFileSync(BG_CONFIG_PATH, 'utf-8'));
        if (cfg.bgImage) bgImage = cfg.bgImage;
        if (typeof cfg.bgBlur === 'number') bgBlur = cfg.bgBlur;
        if (Array.isArray(cfg.bgPresets)) bgPresets = cfg.bgPresets;
      }
    } catch {
      // Ignore config file errors, use env default
    }
    const beszelUrl = services.find((s) => s.id === 'beszel')?.url || null;
    return { bgImage, bgBlur, bgPresets, beszelUrl };
  });

  app.post('/api/config/bg', {
    schema: { body: BG_CONFIG_BODY_SCHEMA },
  }, async (request) => {
    const { bgImage, bgBlur, bgPresets } = request.body as { bgImage?: string | null; bgBlur?: number; bgPresets?: Array<{ name: string; url: string }> };
    const existing: Record<string, unknown> = {};
    try {
      if (fs.existsSync(BG_CONFIG_PATH)) {
        Object.assign(existing, JSON.parse(fs.readFileSync(BG_CONFIG_PATH, 'utf-8')));
      }
    } catch {
      // Ignore config file read errors
    }
    const patch: Record<string, unknown> = { ...existing };
    if (bgImage !== undefined) patch.bgImage = bgImage || null;
    if (bgBlur !== undefined) patch.bgBlur = bgBlur;
    if (bgPresets !== undefined) patch.bgPresets = bgPresets;
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(BG_CONFIG_PATH, JSON.stringify(patch, null, 2));
    return { ok: true };
  });

  app.get('/api/monitor-urls', async () => {
    const defaultUrls = credentials.uptimekumaMonitorUrls || '{}';
    let urls = defaultUrls;
    try {
      if (fs.existsSync(MONITOR_URLS_PATH)) {
        urls = fs.readFileSync(MONITOR_URLS_PATH, 'utf-8');
      }
    } catch { /* use default */ }
    try {
      return { urls: JSON.parse(urls) };
    } catch {
      return { urls: {} };
    }
  });

  app.post('/api/monitor-urls', {
    schema: { body: MONITOR_URLS_BODY_SCHEMA },
  }, async (request) => {
    const { urls } = request.body as { urls: Record<string, unknown> };
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(MONITOR_URLS_PATH, JSON.stringify(urls, null, 2));
    aggregator.updateCredential('uptimekumaMonitorUrls', JSON.stringify(urls));
    return { ok: true };
  });

  app.get('/api/bookmarks', async () => {
    try {
      if (fs.existsSync(BOOKMARKS_PATH)) {
        return { bookmarks: JSON.parse(fs.readFileSync(BOOKMARKS_PATH, 'utf-8')) };
      }
    } catch { /* use default */ }
    return { bookmarks: [] };
  });

  app.post('/api/bookmarks', {
    schema: { body: BOOKMARKS_BODY_SCHEMA },
  }, async (request) => {
    const { bookmarks } = request.body as { bookmarks: unknown[] };
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(BOOKMARKS_PATH, JSON.stringify(bookmarks, null, 2));
    return { ok: true };
  });

  app.post('/api/alerts/:id/state', {
    schema: { params: ALERT_STATE_SCHEMA, body: ALERT_STATE_BODY_SCHEMA },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { state } = request.body as { state: AlertState };
    const summary = aggregator.getSummary();
    const known =
      summary.alerts.find((a) => a.id === id) ??
      summary.resolvedAlerts.find((a) => a.id === id);
    if (!known && !alertsStore.get(id)) {
      reply.code(404);
      return { error: `Alerta '${id}' no encontrada` };
    }
    // Guardamos el snapshot siempre que la alerta sea conocida (no solo al
    // resolverla): si despues sale de la ventana del provider, pasar de
    // 'read' a 'resolved' conserva el texto en vez de perderla.
    const snapshot = known
      ? { id: known.id, level: known.level, source: known.source, message: known.message, time: known.time }
      : undefined;
    alertsStore.set(id, state, snapshot);
    aggregator.refresh();
    return { ok: true, id, state };
  });

  app.post('/api/alerts/read-all', async () => {
    const summary = aggregator.getSummary();
    const toRead = summary.alerts.filter((a) => a.state !== 'read');
    const snapshots: Record<string, ResolvedAlertRecord> = {};
    for (const a of toRead) {
      snapshots[a.id] = { id: a.id, level: a.level, source: a.source, message: a.message, time: a.time };
    }
    alertsStore.setMany(toRead.map((a) => a.id), 'read', snapshots);
    aggregator.refresh();
    return { ok: true, count: toRead.length };
  });

  app.post('/api/alerts/clear-resolved', async () => {
    alertsStore.clearResolved();
    aggregator.refresh();
    return { ok: true };
  });

  app.get('/api/stream', async (request, reply) => {
    reply.hijack();
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Content-Security-Policy': CSP,
      'X-Content-Type-Options': 'nosniff',
    });
    reply.raw.write('retry: 3000\n\n');
    const send = (summary: unknown) => reply.raw.write(`data: ${JSON.stringify(summary)}\n\n`);
    aggregator.on('update', send);
    request.raw.on('close', () => aggregator.off('update', send));
    send(aggregator.getSummary());
  });

  const publicDir = path.resolve(__dirname, '../public');
  await app.register(fastifyStatic, {
    root: publicDir,
    prefix: '/',
    setHeaders(reply, filePath) {
      if (filePath.endsWith('.html')) {
        reply.header('Cache-Control', 'no-store');
      }
    },
  });

  app.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith('/api/')) {
      reply.code(404);
      return { error: 'Ruta no encontrada' };
    }
    reply.type('text/html');
    return reply.sendFile('index.html');
  });

  return app;
}

async function main() {
  const { raw, services, credentials } = await loadConfig();
  const missing = missingRequiredSettings(services, credentials);
  if (missing.length) {
    console.warn(
      `[config] Beszel, Uptime Kuma and Gotify are required for the dashboard to show data. Missing: ${missing.join(', ')}`,
    );
  }
  const aggregator = new Aggregator(services, credentials, raw.pollIntervalMs);

  const app = await buildApp({ aggregator, raw, services, credentials });

  aggregator.start();

  const close = async () => {
    aggregator.stop();
    await app.close();
  };
  process.on('SIGTERM', () => void close().then(() => process.exit(0)));
  process.on('SIGINT', () => void close().then(() => process.exit(0)));

  await app.listen({ port: raw.port, host: raw.host });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
