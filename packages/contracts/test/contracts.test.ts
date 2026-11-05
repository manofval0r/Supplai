import { describe, expect, it } from 'vitest';

import {
  dashboardDirectorySchema,
  facilityFixtureSchema,
  healthResponseSchema,
  lgaOverviewSchema,
  medicineFixtureSchema,
  riderFixtureSchema,
  scenarioRunSchema,
  stockEvidenceSchema,
  stockFixtureSchema,
  transferableSurplus,
  transferSummarySchema,
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

  it('validates the shared dashboard fixture domain', () => {
    const facility = facilityFixtureSchema.parse({
      id: 'PHC-A',
      name: 'Aiyetoro Central PHC',
      ward: 'Aiyetoro',
      phone: '+2348010000001',
      coordinates: { x: 18, y: 42 },
      publicLedger: true,
    });
    const medicine = medicineFixtureSchema.parse({
      id: 'MED-ORS',
      name: 'ORS sachets',
      unit: 'sachets',
      aliases: ['ors', 'oral rehydration salts'],
    });
    const rider = riderFixtureSchema.parse({
      id: 'RIDER-01',
      name: 'Tunde Adebayo',
      phone: '+2348020000001',
    });
    const stock = stockFixtureSchema.parse({
      facilityId: facility.id,
      medicineId: medicine.id,
      onHand: 80,
      minimum: 20,
    });
    const directory = dashboardDirectorySchema.parse({
      lgaCode: 'DEMO-LGA',
      facilities: [facility],
      medicines: [medicine],
      riders: [rider],
      stock: [stock],
    });
    expect(directory.facilities).toHaveLength(1);
    expect(transferableSurplus(stock)).toBe(60);
    expect(transferableSurplus({ ...stock, onHand: 5 })).toBe(0);
  });

  it('rejects a malformed facility phone in the fixture domain', () => {
    expect(() =>
      facilityFixtureSchema.parse({
        id: 'PHC-A',
        name: 'Aiyetoro Central PHC',
        ward: 'Aiyetoro',
        phone: '08010000001',
        coordinates: { x: 18, y: 42 },
        publicLedger: true,
      }),
    ).toThrow();
  });

  it('accepts lifecycle detail on a transfer summary and rejects bad timestamps', () => {
    const summary = {
      id: '00000000-0000-4000-8000-000000000001',
      reference: 'TRF-0042',
      fromFacility: 'Idera PHC',
      toFacility: 'Aiyetoro Central PHC',
      drug: 'Oral Rehydration Salts',
      quantity: 20,
      status: 'in_transit' as const,
      createdAt: '2026-11-04T07:51:00.000Z',
      fromFacilityId: '00000000-0000-4000-8000-000000000010',
      toFacilityId: '00000000-0000-4000-8000-000000000011',
      riderName: 'Tunde Adebayo',
      dispatchedAt: '2026-11-04T08:01:00.000Z',
    };
    expect(transferSummarySchema.parse(summary)).toBeDefined();
    expect(() =>
      transferSummarySchema.parse({ ...summary, dispatchedAt: 'yesterday' }),
    ).toThrow();
  });
});
