import { defineConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 3210;
const DATA_DIR = '.e2e-data';

fs.rmSync(path.resolve(DATA_DIR), { recursive: true, force: true });

const serverEnv: Record<string, string> = {
  ...(process.env as Record<string, string>),
  PORT: String(PORT),
  GOTIFY_URL: 'http://127.0.0.1:9999',
  GOTIFY_TOKEN: 'e2e',
  POLL_INTERVAL_MS: '1000',
  DATA_DIR,
};

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    channel: 'chrome',
  },
  webServer: [
    {
      command: 'node e2e/mock-gotify.mjs',
      url: 'http://127.0.0.1:9999/application',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npx tsx src/server.ts',
      url: `http://127.0.0.1:${PORT}/api/health`,
      env: serverEnv,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
