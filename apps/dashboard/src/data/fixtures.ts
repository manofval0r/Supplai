import dashboard from '../../../../fixtures/dashboard.json' with { type: 'json' };
import failures from '../../../../fixtures/failures.json' with { type: 'json' };
import facilities from '../../../../fixtures/facilities.json' with { type: 'json' };
import medicines from '../../../../fixtures/medicines.json' with { type: 'json' };
import riders from '../../../../fixtures/riders.json' with { type: 'json' };
import stock from '../../../../fixtures/stock.json' with { type: 'json' };

import {
  facilityFixtureSchema,
  lgaOverviewSchema,
  medicineFixtureSchema,
  operationalFailureSchema,
  riderFixtureSchema,
  stockFixtureSchema,
  type LgaOverview,
  type OperationalFailure,
} from '@supplai/contracts';

export const fixtureFacilities = facilities.map((facility) =>
  facilityFixtureSchema.parse(facility),
);
export const fixtureMedicines = medicines.map((medicine) =>
  medicineFixtureSchema.parse(medicine),
);
export const fixtureStock = stock.map((row) => stockFixtureSchema.parse(row));
export const fixtureRiders = riders.map((rider) =>
  riderFixtureSchema.parse(rider),
);
export const fixtureOverview: LgaOverview = lgaOverviewSchema.parse(dashboard);
export const fixtureFailures: OperationalFailure[] = failures.map((failure) =>
  operationalFailureSchema.parse(failure),
);

export function getStockPosition(facilityId: string, medicineId: string) {
  return fixtureStock.find(
    (item) => item.facilityId === facilityId && item.medicineId === medicineId,
  );
}
