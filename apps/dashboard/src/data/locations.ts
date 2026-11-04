import states from '../../data/states.json' with { type: 'json' };
import lgas from '../../data/lgas.json' with { type: 'json' };
import wards from '../../data/wards.json' with { type: 'json' };

export interface WardLocation {
  State: string;
  LGA: string;
  Ward: string;
  Latitude: number;
  Longitude: number;
}

export const locationStates = states;
export const locationLgas = lgas as Record<string, string[]>;
export const wardLocations = wards as WardLocation[];

export function getWardLocations(state: string, lga: string) {
  return wardLocations.filter(
    (ward) => ward.State === state && ward.LGA === lga,
  );
}
