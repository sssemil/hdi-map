import { describe, it, expect } from 'vitest';
import { REGION_SUPPLEMENTS } from './region-supplements';
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

  it('should have Taiwan HDI of 0.926', () => {
    const taiwan = REGION_SUPPLEMENTS.find((s) => s.gdlCode === 'CHNr133');

    expect(taiwan).toBeDefined();
    expect(taiwan!.properties.name).toBe('Taiwan');
    expect(taiwan!.properties.hdi).toBe(0.926);
    expect(taiwan!.properties.countryIso).toBe('TWN');
    expect(taiwan!.properties.level).toBe('national');
  });

  it('should have Hong Kong HDI of 0.956', () => {
    const hk = REGION_SUPPLEMENTS.find((s) => s.gdlCode === 'CHNr132');

    expect(hk).toBeDefined();
    expect(hk!.properties.name).toBe('Hong Kong');
    expect(hk!.properties.hdi).toBe(0.956);
    expect(hk!.properties.countryIso).toBe('HKG');
    expect(hk!.properties.level).toBe('national');
  });

  it('should have San Marino HDI of 0.915', () => {
    const smr = REGION_SUPPLEMENTS.find((s) => s.gdlCode === 'SMRt');

    expect(smr).toBeDefined();
    expect(smr!.properties.name).toBe('San Marino');
    expect(smr!.properties.hdi).toBe(0.915);
    expect(smr!.properties.countryIso).toBe('SMR');
    expect(smr!.properties.level).toBe('national');
    expect(smr!.properties.year).toBe(2023);
  });

  it('should have null sub-indices for all supplements', () => {
    for (const supplement of REGION_SUPPLEMENTS) {
      expect(supplement.properties.educationIndex).toBeNull();
      expect(supplement.properties.healthIndex).toBeNull();
      expect(supplement.properties.incomeIndex).toBeNull();
    }
  });
});
