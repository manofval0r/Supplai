import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const PUBLIC_KEYS = ['NEXT_PUBLIC_API_URL', 'EXPO_PUBLIC_API_URL'] as const;

async function resolveApiBase() {
  vi.resetModules();
  const module = await import('../lib/api');
  return module.API_BASE;
}

function clearPublicEnv() {
  for (const key of PUBLIC_KEYS) delete process.env[key];
}

beforeEach(clearPublicEnv);

afterEach(() => {
  vi.unstubAllEnvs();
  clearPublicEnv();
  vi.resetModules();
});

describe('API base resolution', () => {
  it('uses NEXT_PUBLIC_API_URL first', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.test');
    vi.stubEnv('EXPO_PUBLIC_API_URL', 'https://expo.example.test');
    await expect(resolveApiBase()).resolves.toBe('https://api.example.test');
  });

  it('falls back to EXPO_PUBLIC_API_URL', async () => {
    vi.stubEnv('EXPO_PUBLIC_API_URL', 'https://expo.example.test');
    await expect(resolveApiBase()).resolves.toBe('https://expo.example.test');
  });

  it('defaults to the local API when nothing is configured', async () => {
    await expect(resolveApiBase()).resolves.toBe('http://localhost:3000');
  });
});
