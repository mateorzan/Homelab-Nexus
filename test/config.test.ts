import { describe, it, expect } from 'vitest';
import { missingRequiredSettings } from '../src/config.js';
import type { ServiceConfig } from '../src/types.js';

const svc = (id: string): ServiceConfig => ({ id, name: id, icon: '', url: 'http://x.example' });

describe('missingRequiredSettings', () => {
  it('reports every required setting when nothing is configured', () => {
    expect(missingRequiredSettings([], {})).toEqual(['BESZEL_URL', 'UPTIMEKUMA_URL', 'GOTIFY_URL']);
  });

  it('reports missing credentials for configured services', () => {
    const services = [svc('beszel'), svc('uptimekuma'), svc('gotify')];
    expect(missingRequiredSettings(services, {})).toEqual([
      'BESZEL_USER_EMAIL', 'BESZEL_USER_PASSWORD', 'GOTIFY_TOKEN',
    ]);
  });

  it('returns nothing when the three services are fully configured', () => {
    const services = [svc('beszel'), svc('uptimekuma'), svc('gotify')];
    const credentials = { beszelUserEmail: 'a', beszelUserPassword: 'b', gotifyToken: 'c' };
    expect(missingRequiredSettings(services, credentials)).toEqual([]);
  });
});
