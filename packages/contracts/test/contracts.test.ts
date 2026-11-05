import { describe, expect, it } from 'vitest';

import {
  healthResponseSchema,
  lgaOverviewSchema,
  scenarioRunSchema,
  stockEvidenceSchema,
} from '../src/index.js';

describe('shared contracts', () => {
  it('accepts the API health payload', () => {
    expect(
      healthResponseSchema.parse({
        service: 'supplai-api',
        status: 'ok',
        timestamp: '2026-11-03T12:00:00.000Z',
      }),
    ).toBeDefined();
  });

  it('rejects an invalid response rate', () => {
    expect(() =>
      lgaOverviewSchema.parse({
        lgaCode: 'DEMO-LGA',
        generatedAt: '2026-11-03T12:00:00.000Z',
        metrics: {
          openStockouts: 0,
          transfersInFlight: 0,
          completedTransfers: 0,
          unmetRequests: 0,
          responseRate: 1.2,
        },
        transfers: [],
      }),
    ).toThrow();
  });

  it('rejects stock evidence that is expired, damaged, or below its safety floor', () => {
    const base = {
      commodity: 'ors' as const,
      batchNumber: 'ORS-DEMO-01',
      expiresOn: '2027-06-30',
      inspectedAt: '2026-11-04T09:00:00.000Z',
      condition: 'usable' as const,
      ambientOnly: true as const,
      quantityOnHand: 80,
      safetyFloor: 20,
      quantityRequested: 20,
    };
    expect(stockEvidenceSchema.parse(base)).toBeDefined();
    expect(() =>
      stockEvidenceSchema.parse({ ...base, quantityRequested: 70 }),
    ).toThrow();
    expect(() =>
      stockEvidenceSchema.parse({ ...base, condition: 'damaged' }),
    ).toThrow();
    expect(() =>
      stockEvidenceSchema.parse({ ...base, expiresOn: '2026-01-01' }),
    ).toThrow();
  });

  it('accepts a versioned deterministic scenario run', () => {
    expect(
      scenarioRunSchema.parse({
        scenarioId: 'authorised-ambient-transfer',
        fixtureVersion: '1.0.0',
        runId: 'run-0001',
        cursor: 0,
        state: 'ready',
        outcome: null,
        events: [],
      }),
    ).toBeDefined();
  });
});
