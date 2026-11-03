import { describe, expect, it } from 'vitest';

import { healthResponseSchema, lgaOverviewSchema } from '../src/index.js';

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
});
