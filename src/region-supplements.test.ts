import { describe, it, expect } from 'vitest';
import { REGION_SUPPLEMENTS, getRegionSource } from './region-supplements';
import { RegionPropertiesSchema } from './schemas/region-properties.schema';

describe('REGION_SUPPLEMENTS', () => {
  it('should contain patches for Taiwan, Hong Kong, and San Marino', () => {
    const codes = REGION_SUPPLEMENTS.map((s) => s.gdlCode);

    expect(codes).toContain('CHNr133');
    expect(codes).toContain('CHNr132');
    expect(codes).toContain('SMRt');
  });

  it('should have valid RegionProperties for every supplement', () => {
    for (const supplement of REGION_SUPPLEMENTS) {
      const result = RegionPropertiesSchema.safeParse(supplement.properties);

      expect(result.success).toBe(true);
    }
  });

  it('should have Taiwan with correct geographic identity', () => {
    const taiwan = REGION_SUPPLEMENTS.find((s) => s.gdlCode === 'CHNr133');

    expect(taiwan).toBeDefined();
    expect(taiwan!.properties.name).toBe('Taiwan');
    expect(taiwan!.properties.countryIso).toBe('TWN');
    expect(taiwan!.properties.level).toBe('national');
  });

  it('should have Hong Kong with correct geographic identity', () => {
    const hk = REGION_SUPPLEMENTS.find((s) => s.gdlCode === 'CHNr132');

    expect(hk).toBeDefined();
    expect(hk!.properties.name).toBe('Hong Kong');
    expect(hk!.properties.countryIso).toBe('HKG');
    expect(hk!.properties.level).toBe('national');
  });

  it('should have San Marino with correct geographic identity', () => {
    const smr = REGION_SUPPLEMENTS.find((s) => s.gdlCode === 'SMRt');

    expect(smr).toBeDefined();
    expect(smr!.properties.name).toBe('San Marino');
    expect(smr!.properties.countryIso).toBe('SMR');
    expect(smr!.properties.level).toBe('national');
  });

  it('should have a source string for every supplement', () => {
    for (const supplement of REGION_SUPPLEMENTS) {
      expect(supplement.source).toBeTruthy();
      expect(typeof supplement.source).toBe('string');
    }
  });

  it('should only contain base geographic identity fields', () => {
    for (const supplement of REGION_SUPPLEMENTS) {
      const props = supplement.properties;
      expect(Object.keys(props).sort()).toEqual(
        ['centroid', 'country', 'countryIso', 'gdlCode', 'level', 'name']
      );
    }
  });
});

describe('getRegionSource', () => {
  it('should return supplement source for supplemented regions', () => {
    expect(getRegionSource('CHNr133')).toBe('DGBAS (Taiwan)');
    expect(getRegionSource('CHNr132')).toBe('UNDP HDR');
    expect(getRegionSource('SMRt')).toBe('UNDP HDR');
  });

  it('should return GDL SHDI source for non-supplemented regions', () => {
    expect(getRegionSource('GBRr101')).toBe('GDL SHDI v8.3');
    expect(getRegionSource('INDr101')).toBe('GDL SHDI v8.3');
  });
});
