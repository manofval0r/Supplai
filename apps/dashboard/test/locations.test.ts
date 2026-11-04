import { describe, expect, it } from 'vitest';

import {
  getWardLocations,
  locationLgas,
  locationStates,
  wardLocations,
} from '../src/data/locations.js';

describe('Nigeria location data', () => {
  it('loads all states and references valid LGA lists', () => {
    expect(locationStates).toHaveLength(37);
    expect(new Set(locationStates).size).toBe(locationStates.length);
    expect(Object.keys(locationLgas).sort()).toEqual(
      [...locationStates].sort(),
    );
    expect(
      locationStates.every((state) => (locationLgas[state] ?? []).length > 0),
    ).toBe(true);
  });

  it('loads ward coordinates and filters them by state and LGA', () => {
    expect(wardLocations.length).toBeGreaterThan(8000);
    expect(
      wardLocations.every(
        (ward) =>
          Number.isFinite(ward.Latitude) &&
          Number.isFinite(ward.Longitude) &&
          locationStates.includes(ward.State) &&
          (locationLgas[ward.State] ?? []).includes(ward.LGA),
      ),
    ).toBe(true);
    expect(getWardLocations('Lagos', 'Ikeja').length).toBeGreaterThan(0);
  });
});
