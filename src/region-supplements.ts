import type { RegionProperties } from './schemas/region-properties.schema';

type RegionSupplement = {
  readonly gdlCode: string;
  readonly properties: RegionProperties;
};

export const REGION_SUPPLEMENTS: readonly RegionSupplement[] = [
  {
    gdlCode: 'CHNr133',
    properties: {
      gdlCode: 'CHNr133',
      name: 'Taiwan',
      country: 'Taiwan',
      countryIso: 'TWN',
      level: 'national',
      year: 2022,
      hdi: 0.926,
      educationIndex: null,
      healthIndex: null,
      incomeIndex: null,
      centroid: [120.960, 23.697],
    },
  },
  {
    gdlCode: 'CHNr132',
    properties: {
      gdlCode: 'CHNr132',
      name: 'Hong Kong',
      country: 'Hong Kong',
      countryIso: 'HKG',
      level: 'national',
      year: 2022,
      hdi: 0.956,
      educationIndex: null,
      healthIndex: null,
      incomeIndex: null,
      centroid: [114.134, 22.384],
    },
  },
  {
    gdlCode: 'SMRt',
    properties: {
      gdlCode: 'SMRt',
      name: 'San Marino',
      country: 'San Marino',
      countryIso: 'SMR',
      level: 'national',
      year: 2023,
      hdi: 0.915,
      educationIndex: null,
      healthIndex: null,
      incomeIndex: null,
      centroid: [12.461, 43.939],
    },
  },
];
