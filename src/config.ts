import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ServiceConfig } from './types.js';

/**
 * Configuracion de los servicios que este dashboard agrega.
 * Cada servicio solo se habilita si su URL esta definida (Docker secret o env).
 * Los secretos (tokens / API keys / credenciales) se resuelven con esta prioridad:
 *   1. Archivo Docker secret en /run/secrets/<name>  (si existe)
 *   2. Variable de entorno  (fallback para desarrollo local)
 * El valor se devuelve recortado/limpio.
 */

export interface RawConfig {
  port: number;
  host: string;
  pollIntervalMs: number;
}

const SECRETS_DIR = '/run/secrets';

/** Devuelve un valor por prioridad: Docker secret -> enviro var. Nunca lanza. */
async function optionalValue(
  secretName: string,
  envName: string,
): Promise<string | undefined> {
  const secretPath = path.join(SECRETS_DIR, secretName);
  try {
    const raw = await fs.readFile(secretPath, 'utf8');
    const value = raw.trim();
    if (value) return value;
  } catch {
    // El archivo no existe: seguimos con la variable de entorno.
  }
  const envValue = process.env[envName];
  return envValue && envValue.trim() ? envValue.trim() : undefined;
}

/** Var como optionalValue pero lanza si falta (claves obligatorias). */
async function requiredValue(secretName: string, envName: string): Promise<string> {
  const value = await optionalValue(secretName, envName);
  if (value) return value;
  throw new Error(
    `Falta configuracion/secret: '${secretName}' (Docker secret) o '${envName}' (env).`,
  );
}

function toInt(value: string | undefined, fallback: number): number {
  const parsed = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function loadConfig(): Promise<{
  raw: RawConfig;
  services: ServiceConfig[];
  credentials: Record<string, string | undefined>;
}> {
  const port = toInt(process.env.PORT, 3000);
  const host = process.env.HOST || '0.0.0.0';
  const pollIntervalMs = toInt(process.env.POLL_INTERVAL_MS, 5000);

  // URLs opcionales: cada servicio se habilita solo si su URL existe.
  const beszelUrl = await optionalValue('beszel_url', 'BESZEL_URL');
  const uptimeKumaUrl = await optionalValue('uptimekuma_url', 'UPTIMEKUMA_URL');
  const gotifyUrl = await optionalValue('gotify_url', 'GOTIFY_URL');
  const opnsenseUrl = await optionalValue('opnsense_url', 'OPNSENSE_URL');

  const services: ServiceConfig[] = [];
  if (beszelUrl) services.push({ id: 'beszel', name: 'Beszel', icon: '📊', url: beszelUrl });
  if (uptimeKumaUrl) services.push({ id: 'uptimekuma', name: 'Uptime Kuma', icon: '📈', url: uptimeKumaUrl });
  if (gotifyUrl) services.push({ id: 'gotify', name: 'Gotify', icon: '🔔', url: gotifyUrl });
  if (opnsenseUrl) services.push({ id: 'opnsense', name: 'OPNsense', icon: '🛡️', url: opnsenseUrl });

  const credentials: Record<string, string | undefined> = {};
  credentials.beszelUserEmail = await optionalValue('beszel_user_email', 'BESZEL_USER_EMAIL');
  credentials.beszelUserPassword = await optionalValue('beszel_user_password', 'BESZEL_USER_PASSWORD');
  credentials.uptimekumaStatusPage = await optionalValue('uptimekuma_status_page', 'UPTIMEKUMA_STATUS_PAGE');
  credentials.uptimekumaMonitorUrls = await optionalValue('uptimekuma_monitor_urls', 'UPTIMEKUMA_MONITOR_URLS');
  credentials.gotifyToken = await optionalValue('gotify_token', 'GOTIFY_TOKEN');
  credentials.opnsenseApiKey = await optionalValue('opnsense_api_key', 'OPNSENSE_API_KEY');
  credentials.opnsenseApiSecret = await optionalValue('opnsense_api_secret', 'OPNSENSE_API_SECRET');

  return {
    raw: { port, host, pollIntervalMs },
    services,
    credentials,
  };
}

/**
 * Beszel, Uptime Kuma y Gotify son imprescindibles: sin ellos el dashboard no
 * tiene datos que mostrar. Devuelve que falta (URL o credenciales) de cada uno.
 */
export function missingRequiredSettings(
  services: ServiceConfig[],
  credentials: Record<string, string | undefined>,
): string[] {
  const has = (id: string) => services.some((s) => s.id === id);
  const missing: string[] = [];
  if (!has('beszel')) missing.push('BESZEL_URL');
  else {
    if (!credentials.beszelUserEmail) missing.push('BESZEL_USER_EMAIL');
    if (!credentials.beszelUserPassword) missing.push('BESZEL_USER_PASSWORD');
  }
  if (!has('uptimekuma')) missing.push('UPTIMEKUMA_URL');
  if (!has('gotify')) missing.push('GOTIFY_URL');
  else if (!credentials.gotifyToken) missing.push('GOTIFY_TOKEN');
  return missing;
}

export { requiredValue as resolveRequired };
export { optionalValue as resolveOptional };
