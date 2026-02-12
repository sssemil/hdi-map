import { describe, it, expect } from 'vitest';
import { joinShdiToGeo, type GeoFeature } from './join-data';
import type { ShdiRecord } from './parse-shdi';

const buildFeature = (gdlcode: string): GeoFeature => ({
  type: 'Feature',
  properties: { gdlcode, continent: 'Europe', iso_code: 'GBR' },
  geometry: {
    type: 'Polygon',
    coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
  },
});

const buildShdiRecord = (overrides?: Partial<ShdiRecord>): ShdiRecord => ({
  gdlCode: 'GBRr101',
  name: 'North East England',
  country: 'United Kingdom',
  countryIso: 'GBR',
  level: 'subnational',
  year: 2022,
  hdi: 0.929,
  educationIndex: 0.887,
  healthIndex: 0.953,
  incomeIndex: 0.948,
  ...overrides,
});

describe('joinShdiToGeo', () => {
  it('should join matching GDL-Codes with base geographic identity', () => {
    const features = [buildFeature('GBRr101')];
    const records = [buildShdiRecord()];

    const result = joinShdiToGeo({ features, records });

    expect(result.joined).toHaveLength(1);
    expect(result.joined[0].properties.gdlCode).toBe('GBRr101');
    expect(result.joined[0].properties.name).toBe('North East England');
    expect(result.joined[0].properties.country).toBe('United Kingdom');
    expect(result.joined[0].properties.countryIso).toBe('GBR');
    expect(result.joined[0].properties.level).toBe('subnational');
  });

  it('should not include HDI-specific fields in joined properties', () => {
    const features = [buildFeature('GBRr101')];
    const records = [buildShdiRecord()];

    const result = joinShdiToGeo({ features, records });

    const props = result.joined[0].properties;
    expect('hdi' in props).toBe(false);
    expect('educationIndex' in props).toBe(false);
    expect('healthIndex' in props).toBe(false);
    expect('incomeIndex' in props).toBe(false);
    expect('year' in props).toBe(false);
  });

  it('should include centroid in joined properties', () => {
    const features = [buildFeature('GBRr101')];
    const records = [buildShdiRecord()];

    const result = joinShdiToGeo({ features, records });

    expect(result.joined[0].properties.centroid).toBeDefined();
    expect(result.joined[0].properties.centroid).toHaveLength(2);
  });

  it('should retain geometry features without CSV data', () => {
    const features = [buildFeature('ANDt')];
    const records: readonly ShdiRecord[] = [];

    const result = joinShdiToGeo({ features, records });

    expect(result.joined).toHaveLength(1);
    expect(result.joined[0].properties.gdlCode).toBe('ANDt');
  });

  it('should report CSV records without matching geometry', () => {
    const features: readonly GeoFeature[] = [];
    const records = [buildShdiRecord({ gdlCode: 'BELr105' })];

    const result = joinShdiToGeo({ features, records });

    expect(result.report.csvOnly).toContain('BELr105');
    expect(result.joined).toHaveLength(0);
  });

  it('should report geometry features without CSV data', () => {
    const features = [buildFeature('ANDt')];
    const records: readonly ShdiRecord[] = [];

    const result = joinShdiToGeo({ features, records });

    expect(result.report.geoOnly).toContain('ANDt');
  });

  it('should produce accurate match counts in the report', () => {
    const features = [
      buildFeature('GBRr101'),
      buildFeature('GBRr102'),
      buildFeature('ANDt'),
    ];
    const records = [
      buildShdiRecord({ gdlCode: 'GBRr101' }),
      buildShdiRecord({ gdlCode: 'GBRr102', name: 'London' }),
      buildShdiRecord({ gdlCode: 'BELr105' }),
    ];

    const result = joinShdiToGeo({ features, records });

    expect(result.report.matched).toBe(2);
    expect(result.report.csvOnly).toEqual(['BELr105']);
    expect(result.report.geoOnly).toEqual(['ANDt']);
    expect(result.report.matchRate).toBeCloseTo(2 / 3, 2);
  });

  it('should throw when match rate falls below threshold', () => {
    const features = [
      buildFeature('GBRr101'),
      buildFeature('GBRr102'),
      buildFeature('ANDt'),
      buildFeature('SGPt'),
    ];
    const records = [buildShdiRecord({ gdlCode: 'GBRr101' })];

    expect(() =>
      joinShdiToGeo({ features, records, minMatchRate: 0.95 })
    ).toThrow(/match rate/i);
  });

  it('should not throw when match rate meets threshold', () => {
    const features = [buildFeature('GBRr101')];
    const records = [buildShdiRecord({ gdlCode: 'GBRr101' })];

    expect(() =>
      joinShdiToGeo({ features, records, minMatchRate: 0.95 })
    ).not.toThrow();
  });

  it('should derive level from gdlcode suffix when CSV record is missing', () => {
    const features = [buildFeature('SGPt')];
    const records: readonly ShdiRecord[] = [];

    const result = joinShdiToGeo({ features, records });

    expect(result.joined[0].properties.level).toBe('national');
  });

  it('should derive subnational level for non-t suffix codes without CSV data', () => {
    const features = [buildFeature('GBRr101')];
    const records: readonly ShdiRecord[] = [];

    const result = joinShdiToGeo({ features, records });

    expect(result.joined[0].properties.level).toBe('subnational');
  });
});
