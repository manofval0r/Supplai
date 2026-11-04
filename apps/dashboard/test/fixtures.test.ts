import { describe, expect, it } from 'vitest';

import {
  fixtureFacilities,
  fixtureFailures,
  fixtureMedicines,
  fixtureOverview,
  fixtureStock,
} from '../src/data/fixtures.js';

describe('dashboard fixtures', () => {
  it('uses stable unique public identifiers and valid references', () => {
    const ids = fixtureFacilities.map((facility) => facility.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(fixtureFacilities).toHaveLength(8);
    expect(fixtureFacilities.every((facility) => facility.publicLedger)).toBe(true);
    expect(fixtureStock.every((row) => ids.includes(row.facilityId))).toBe(true);
    expect(
      fixtureStock.every((row) => fixtureMedicines.some((medicine) => medicine.id === row.medicineId)),
    ).toBe(true);
  });

  it('supports the demo stock movement and matches overview metrics', () => {
    const orsAtRequester = fixtureStock.find(
      (row) => row.facilityId === 'PHC-A' && row.medicineId === 'MED-ORS',
    );
    const orsAtSupplier = fixtureStock.find(
      (row) => row.facilityId === 'PHC-B' && row.medicineId === 'MED-ORS',
    );
    expect(orsAtRequester?.onHand).toBe(0);
    expect((orsAtSupplier?.onHand ?? 0) - (orsAtSupplier?.minimum ?? 0)).toBeGreaterThanOrEqual(20);
    expect(fixtureOverview.metrics.transfersInFlight).toBe(
      fixtureOverview.transfers.filter((transfer) => transfer.status === 'in_transit').length,
    );
  });

  it('covers every operational failure kind without patient terms', () => {
    expect(new Set(fixtureFailures.map((failure) => failure.category))).toEqual(
      new Set(['unmatched', 'expired', 'dispatch', 'proof_locked']),
    );
    const serialized = JSON.stringify({ fixtureFacilities, fixtureFailures }).toLowerCase();
    expect(serialized).not.toMatch(/patient|diagnosis|proof.?code/);
  });
});
