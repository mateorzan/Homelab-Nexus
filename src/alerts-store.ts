import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AlertState, ResolvedAlertRecord } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_STATE_PATH = path.resolve(__dirname, '../data/alerts-state.json');
const MAX_ENTRIES = 500;
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

export type PersistedAlertState = Exclude<AlertState, 'unread'>;

interface StoreEntry {
  state: PersistedAlertState;
  time: number;
  alert?: ResolvedAlertRecord;
}

interface StoreFile {
  version: 1;
  updatedAt: number;
  entries: Record<string, StoreEntry>;
}

export class AlertsStore {
  private readonly filePath: string;
  private readonly entries = new Map<string, StoreEntry>();

  constructor(filePath: string = DEFAULT_STATE_PATH) {
    this.filePath = filePath;
    this.load();
  }

  private load(): void {
    try {
      if (!fs.existsSync(this.filePath)) return;
      const raw = JSON.parse(fs.readFileSync(this.filePath, 'utf-8')) as StoreFile;
      const cutoff = Date.now() - MAX_AGE_MS;
      for (const [id, entry] of Object.entries(raw.entries ?? {})) {
        if (!entry || (entry.state !== 'read' && entry.state !== 'resolved')) continue;
        if (typeof entry.time !== 'number' || entry.time < cutoff) continue;
        this.entries.set(id, { state: entry.state, time: entry.time, alert: entry.alert });
      }
      this.prune();
    } catch {
      // Archivo corrupto o ilegible: empezar vacío, no tirar el server abajo.
    }
  }

  private prune(): void {
    if (this.entries.size <= MAX_ENTRIES) return;
    const sorted = [...this.entries.entries()].sort((a, b) => b[1].time - a[1].time);
    this.entries.clear();
    for (const [id, entry] of sorted.slice(0, MAX_ENTRIES)) this.entries.set(id, entry);
  }

  private save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const file: StoreFile = {
        version: 1,
        updatedAt: Date.now(),
        entries: Object.fromEntries(this.entries),
      };
      fs.writeFileSync(this.filePath, JSON.stringify(file, null, 2));
    } catch {
      // Si no se puede persistir, el estado sigue vivo en memoria.
    }
  }

  get(id: string): PersistedAlertState | undefined {
    return this.entries.get(id)?.state;
  }

  getRecord(id: string): ResolvedAlertRecord | undefined {
    return this.entries.get(id)?.alert;
  }

  set(id: string, state: AlertState, alert?: ResolvedAlertRecord): void {
    if (state === 'unread') {
      this.entries.delete(id);
    } else {
      const existing = this.entries.get(id);
      this.entries.set(id, {
        state,
        time: Date.now(),
        alert: alert ?? existing?.alert,
      });
    }
    this.prune();
    this.save();
  }

  setMany(ids: string[], state: AlertState, alerts?: Record<string, ResolvedAlertRecord>): void {
    for (const id of ids) {
      if (state === 'unread') {
        this.entries.delete(id);
      } else {
        const existing = this.entries.get(id);
        this.entries.set(id, { state, time: Date.now(), alert: alerts?.[id] ?? existing?.alert });
      }
    }
    this.prune();
    this.save();
  }

  resolvedRecords(): ResolvedAlertRecord[] {
    const out: ResolvedAlertRecord[] = [];
    for (const entry of this.entries.values()) {
      if (entry.state === 'resolved' && entry.alert) out.push(entry.alert);
    }
    return out.sort((a, b) => b.time - a.time);
  }

  clearResolved(): void {
    for (const [id, entry] of this.entries) {
      if (entry.state === 'resolved') this.entries.delete(id);
    }
    this.save();
  }
}
