import { afterEach, describe, expect, it } from 'vitest';
import type { ScenarioDefinition, ScenarioRun } from '@supplai/contracts';
import { buildApp } from '../src/app.js';

const apps: ReturnType<typeof buildApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map(async (app) => app.close()));
});

describe('Scenario Lab Endpoints & Resilience', () => {
  it('lists all 7 deterministic scenarios in the catalog', async () => {
    const app = buildApp();
    apps.push(app);

    const res = await app.inject({ method: 'GET', url: '/demo/scenarios' });
    expect(res.statusCode).toBe(200);

    const scenarios = res.json<ScenarioDefinition[]>();
    expect(scenarios).toHaveLength(7);

    const ids = scenarios.map((s) => s.id);
    expect(ids).toEqual([
      'authorised-ambient-transfer',
      'source-safety-floor-breach',
      'shelf-batch-mismatch',
      'fefo-priority-reroute',
      'delayed-rider-eta-adjustment',
      'refusal-at-receipt-tamper-seal',
      'demand-shock-lga-buffer',
    ]);
  });

  it('reads scenario run state and validates schema', async () => {
    const app = buildApp();
    apps.push(app);

    const res = await app.inject({
      method: 'GET',
      url: '/demo/scenarios/refusal-at-receipt-tamper-seal',
    });
    expect(res.statusCode).toBe(200);

    const run = res.json<ScenarioRun>();
    expect(run.scenarioId).toBe('refusal-at-receipt-tamper-seal');
    expect(run.state).toBe('ready');
    expect(run.cursor).toBe(0);
    expect(run.outcome).toBeNull();
    expect(run.events).toHaveLength(0);
  });

  it('steps through all events of a scenario to completion', async () => {
    const app = buildApp();
    apps.push(app);

    // Start
    const startRes = await app.inject({
      method: 'POST',
      url: '/demo/scenarios/refusal-at-receipt-tamper-seal/start',
    });
    expect(startRes.statusCode).toBe(200);
    expect(startRes.json<ScenarioRun>().state).toBe('running');

    // Tick through 5 events
    let latestRun: ScenarioRun | null = null;
    for (let i = 0; i < 5; i++) {
      const tickRes = await app.inject({
        method: 'POST',
        url: '/demo/scenarios/refusal-at-receipt-tamper-seal/tick',
      });
      expect(tickRes.statusCode).toBe(200);
      latestRun = tickRes.json<ScenarioRun>();
      expect(latestRun.cursor).toBe(i + 1);
    }

    expect(latestRun).not.toBeNull();
    expect(latestRun!.state).toBe('completed');
    expect(latestRun!.outcome).toBe('refused_tamper_seal_broken');
    expect(latestRun!.events).toHaveLength(5);
  });

  it('replays and resets a scenario cleanly', async () => {
    const app = buildApp();
    apps.push(app);

    const replayRes = await app.inject({
      method: 'POST',
      url: '/demo/scenarios/shelf-batch-mismatch/replay',
    });
    expect(replayRes.statusCode).toBe(200);
    const replayRun = replayRes.json<ScenarioRun>();
    expect(replayRun.cursor).toBe(1);
    expect(replayRun.state).toBe('running');

    const resetRes = await app.inject({
      method: 'POST',
      url: '/demo/scenarios/shelf-batch-mismatch/reset',
    });
    expect(resetRes.statusCode).toBe(200);
    const resetRun = resetRes.json<ScenarioRun>();
    expect(resetRun.cursor).toBe(0);
    expect(resetRun.state).toBe('ready');
  });

  it('resets entire demo state via POST /api/demo/reset', async () => {
    const app = buildApp();
    apps.push(app);

    // Mutate state by advancing a scenario
    await app.inject({
      method: 'POST',
      url: '/demo/scenarios/demand-shock-lga-buffer/start',
    });
    await app.inject({
      method: 'POST',
      url: '/demo/scenarios/demand-shock-lga-buffer/tick',
    });

    // Call demo reset
    const resetRes = await app.inject({
      method: 'POST',
      url: '/api/demo/reset',
    });
    expect(resetRes.statusCode).toBe(200);
    const body = resetRes.json<{
      ok: boolean;
      timestamp: string;
      message: string;
    }>();
    expect(body.ok).toBe(true);
    expect(body.message).toContain('reset to baseline');

    // Verify scenario is back to ready
    const readRes = await app.inject({
      method: 'GET',
      url: '/demo/scenarios/demand-shock-lga-buffer',
    });
    const run = readRes.json<ScenarioRun>();
    expect(run.cursor).toBe(0);
    expect(run.state).toBe('ready');
  });

  it('returns 404 for unknown scenario ID', async () => {
    const app = buildApp();
    apps.push(app);

    const res = await app.inject({
      method: 'GET',
      url: '/demo/scenarios/non-existent-scenario',
    });
    expect(res.statusCode).toBe(404);
  });

  it('enforces scenarioControlSecret when configured', async () => {
    const app = buildApp({ scenarioControlSecret: 'top-secret-salt-99' });
    apps.push(app);

    const unauthRes = await app.inject({
      method: 'GET',
      url: '/demo/scenarios',
    });
    expect(unauthRes.statusCode).toBe(401);

    const authRes = await app.inject({
      method: 'GET',
      url: '/demo/scenarios',
      headers: { 'x-demo-control-secret': 'top-secret-salt-99' },
    });
    expect(authRes.statusCode).toBe(200);
  });
});
