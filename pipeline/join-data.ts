import type { ShdiRecord } from './parse-shdi';
import type { RegionProperties } from '../src/schemas/region-properties.schema';
import { computeCentroid } from './compute-centroids';

export type GeoFeature = {
  readonly type: 'Feature';
  readonly properties: {
    readonly gdlcode: string;
    readonly continent: string;
    readonly iso_code: string;
  };
  readonly geometry: {
    readonly type: string;
    readonly coordinates: readonly unknown[];
  };
};

export type JoinedFeature = {
  readonly type: 'Feature';
  readonly properties: RegionProperties;
  readonly geometry: GeoFeature['geometry'];
};

export type JoinReport = {
  readonly matched: number;
  readonly csvOnly: readonly string[];
  readonly geoOnly: readonly string[];
  readonly matchRate: number;
};

type JoinOptions = {
  readonly features: readonly GeoFeature[];
  readonly records: readonly ShdiRecord[];
  readonly minMatchRate?: number;
};

type JoinResult = {
  readonly joined: readonly JoinedFeature[];
  readonly report: JoinReport;
};

const deriveLevel = (gdlCode: string): 'national' | 'subnational' =>
  gdlCode.endsWith('t') ? 'national' : 'subnational';

const buildUnmatchedProperties = (
  feature: GeoFeature,
  centroid: [number, number]
): RegionProperties => ({
  gdlCode: feature.properties.gdlcode,
  name: feature.properties.gdlcode,
  country: '',
  countryIso: feature.properties.iso_code,
  level: deriveLevel(feature.properties.gdlcode),
  year: 0,
  hdi: null,
  educationIndex: null,
  healthIndex: null,
  incomeIndex: null,
  centroid,
});

const buildMatchedProperties = (
  record: ShdiRecord,
  centroid: [number, number]
): RegionProperties => ({
  gdlCode: record.gdlCode,
  name: record.name,
  country: record.country,
  countryIso: record.countryIso,
  level: record.level,
  year: record.year,
  hdi: record.hdi,
  educationIndex: record.educationIndex,
  healthIndex: record.healthIndex,
  incomeIndex: record.incomeIndex,
  centroid,
});

export const joinShdiToGeo = (options: JoinOptions): JoinResult => {
  const { features, records, minMatchRate } = options;

  const recordsByCode = new Map<string, ShdiRecord>();
  for (const record of records) {
    recordsByCode.set(record.gdlCode, record);
  }

  const matchedCodes = new Set<string>();
  const geoOnly: string[] = [];

  const joined: JoinedFeature[] = features.map((feature) => {
    const gdlCode = feature.properties.gdlcode;
    const centroid = computeCentroid(feature.geometry);
    const record = recordsByCode.get(gdlCode);

    if (record) {
      matchedCodes.add(gdlCode);
      return {
        type: 'Feature' as const,
        properties: buildMatchedProperties(record, centroid),
        geometry: feature.geometry,
      };
    }

    geoOnly.push(gdlCode);
    return {
      type: 'Feature' as const,
      properties: buildUnmatchedProperties(feature, centroid),
      geometry: feature.geometry,
    };
  });

  const csvOnly = records
    .filter((r) => !matchedCodes.has(r.gdlCode))
    .map((r) => r.gdlCode);

  const matchRate = features.length > 0
    ? matchedCodes.size / features.length
    : 0;

  if (minMatchRate !== undefined && matchRate < minMatchRate) {
    throw new Error(
      `Match rate ${(matchRate * 100).toFixed(1)}% is below minimum ${(minMatchRate * 100).toFixed(1)}%`
    );
  }

  return {
    joined,
    report: {
      matched: matchedCodes.size,
      csvOnly,
      geoOnly,
      matchRate,
    },
  };
};
