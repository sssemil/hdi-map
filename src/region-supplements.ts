import type { RegionProperties } from './schemas/region-properties.schema';

type RegionSupplement = {
  readonly gdlCode: string;
  readonly properties: RegionProperties;
  readonly source: string;
};

export const REGION_SUPPLEMENTS: readonly RegionSupplement[] = [
  {
    gdlCode: 'CHNr133',
    source: 'DGBAS (Taiwan)',
    properties: {
      gdlCode: 'CHNr133',
      name: 'Taiwan',
      country: 'Taiwan',
      countryIso: 'TWN',
      level: 'national',
      centroid: [120.960, 23.697],
    },
  },
  {
    gdlCode: 'CHNr132',
    source: 'UNDP HDR',
    properties: {
      gdlCode: 'CHNr132',
      name: 'Hong Kong',
      country: 'Hong Kong',
      countryIso: 'HKG',
      level: 'national',
      centroid: [114.134, 22.384],
    },
  },
  {
    gdlCode: 'SMRt',
    source: 'UNDP HDR',
    properties: {
      gdlCode: 'SMRt',
      name: 'San Marino',
      country: 'San Marino',
      countryIso: 'SMR',
      level: 'national',
      centroid: [12.461, 43.939],
    },
  },
];

const DEFAULT_SOURCE = 'GDL SHDI v8.3';

export const getRegionSource = (gdlCode: string): string => {
  const supplement = REGION_SUPPLEMENTS.find((s) => s.gdlCode === gdlCode);
  return supplement ? supplement.source : DEFAULT_SOURCE;
};
