import { afterEach, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

const apps: ReturnType<typeof buildApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map(async (app) => app.close()));
});

describe('GET /health', () => {
  it('returns a valid liveness response', async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/health' });
    const payload = response.json<Record<string, unknown>>();

    expect(response.statusCode).toBe(200);
    expect(payload).toMatchObject({ service: 'supplai-api', status: 'ok' });
    expect(payload.timestamp).toEqual(expect.any(String));
  });
});
