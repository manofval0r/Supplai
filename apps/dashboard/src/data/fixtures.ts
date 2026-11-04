import dashboard from '../../../../fixtures/dashboard.json' with { type: 'json' };
import failures from '../../../../fixtures/failures.json' with { type: 'json' };
import facilities from '../../../../fixtures/facilities.json' with { type: 'json' };
import medicines from '../../../../fixtures/medicines.json' with { type: 'json' };
import riders from '../../../../fixtures/riders.json' with { type: 'json' };
import stock from '../../../../fixtures/stock.json' with { type: 'json' };

import {
  lgaOverviewSchema,
  operationalFailureSchema,
  type LgaOverview,
  type OperationalFailure,
} from '@supplai/contracts';

export interface FacilityFixture {
  id: string;
  name: string;
  ward: string;
  phone: string;
  coordinates: { x: number; y: number };
  publicLedger: boolean;
}

export interface MedicineFixture {
  id: string;
  name: string;
  unit: string;
  aliases: string[];
}

export interface StockFixture {
  facilityId: string;
  medicineId: string;
  onHand: number;
  minimum: number;
}

export interface RiderFixture {
  id: string;
  name: string;
  phone: string;
}

export const fixtureFacilities = facilities as FacilityFixture[];
export const fixtureMedicines = medicines as MedicineFixture[];
export const fixtureStock = stock as StockFixture[];
export const fixtureRiders = riders as RiderFixture[];
export const fixtureOverview: LgaOverview = lgaOverviewSchema.parse(dashboard);
export const fixtureFailures: OperationalFailure[] = failures.map((failure) =>
  operationalFailureSchema.parse(failure),
);

export function getStockPosition(facilityId: string, medicineId: string) {
  return fixtureStock.find(
    (item) => item.facilityId === facilityId && item.medicineId === medicineId,
  );
}
