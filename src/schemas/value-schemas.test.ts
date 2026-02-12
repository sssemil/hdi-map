import { describe, it, expect } from 'vitest';
import { HdiValuesSchema, getMockHdiRegionValue } from './hdi-values.schema';
import { WhrValuesSchema, getMockWhrRegionValue } from './whr-values.schema';
import { OecdBliValuesSchema, getMockOecdBliRegionValue } from './oecd-bli-values.schema';

describe('HdiValuesSchema', () => {
  it('should accept valid HDI values record', () => {
    const data = {
      GBRr101: getMockHdiRegionValue(),
      INDr101: getMockHdiRegionValue({ hdi: 0.650, year: 2021 }),
    };
    const result = HdiValuesSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept null sub-indices', () => {
    const data = {
      TWNt: getMockHdiRegionValue({
        hdi: 0.926,
        educationIndex: null,
        healthIndex: null,
        incomeIndex: null,
      }),
    };
    const result = HdiValuesSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject HDI values outside 0-1 range', () => {
    const result = HdiValuesSchema.safeParse({
      BAD: { hdi: 1.5, educationIndex: 0.5, healthIndex: 0.5, incomeIndex: 0.5, year: 2022 },
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative HDI values', () => {
    const result = HdiValuesSchema.safeParse({
      BAD: { hdi: -0.1, educationIndex: 0.5, healthIndex: 0.5, incomeIndex: 0.5, year: 2022 },
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing year', () => {
    const result = HdiValuesSchema.safeParse({
      BAD: { hdi: 0.5, educationIndex: 0.5, healthIndex: 0.5, incomeIndex: 0.5 },
    });
    expect(result.success).toBe(false);
  });

  it('should accept empty record', () => {
    const result = HdiValuesSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('getMockHdiRegionValue', () => {
  it('should return valid default values', () => {
    const value = getMockHdiRegionValue();
    expect(value.hdi).toBe(0.729);
    expect(value.year).toBe(2022);
  });

  it('should accept overrides', () => {
    const value = getMockHdiRegionValue({ hdi: 0.900 });
    expect(value.hdi).toBe(0.900);
  });

  it('should reject invalid overrides via schema', () => {
    expect(() => getMockHdiRegionValue({ hdi: 2.0 })).toThrow();
  });
});

describe('WhrValuesSchema', () => {
  it('should accept valid WHR values record', () => {
    const data = {
      FIN: getMockWhrRegionValue(),
      AFG: getMockWhrRegionValue({ score: 1.364, year: 2023 }),
    };
    const result = WhrValuesSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept null scores', () => {
    const data = {
      UNK: getMockWhrRegionValue({
        score: null,
        gdpPerCapita: null,
        socialSupport: null,
        lifeExpectancy: null,
        freedom: null,
        generosity: null,
        corruption: null,
      }),
    };
    const result = WhrValuesSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject score outside 0-10 range', () => {
    const result = WhrValuesSchema.safeParse({
      BAD: { score: 11, gdpPerCapita: 0, socialSupport: 0, lifeExpectancy: 0, freedom: 0, generosity: 0, corruption: 0, year: 2024 },
    });
    expect(result.success).toBe(false);
  });

  it('should accept empty record', () => {
    const result = WhrValuesSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('getMockWhrRegionValue', () => {
  it('should return valid default values', () => {
    const value = getMockWhrRegionValue();
    expect(value.score).toBe(6.714);
    expect(value.year).toBe(2024);
  });

  it('should accept overrides', () => {
    const value = getMockWhrRegionValue({ score: 7.5 });
    expect(value.score).toBe(7.5);
  });
});

describe('OecdBliValuesSchema', () => {
  it('should accept valid OECD BLI values record', () => {
    const data = {
      DEr101: getMockOecdBliRegionValue(),
      FRr201: getMockOecdBliRegionValue({ income: 6.0, health: 9.0 }),
    };
    const result = OecdBliValuesSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept null dimension scores', () => {
    const data = {
      UNK: getMockOecdBliRegionValue({
        income: null,
        jobs: null,
        housing: null,
        education: null,
        health: null,
        environment: null,
        safety: null,
        civicEngagement: null,
        accessToServices: null,
        community: null,
        lifeSatisfaction: null,
      }),
    };
    const result = OecdBliValuesSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject dimension score outside 0-10 range', () => {
    const mock = getMockOecdBliRegionValue();
    const result = OecdBliValuesSchema.safeParse({
      BAD: { ...mock, income: 11 },
    });
    expect(result.success).toBe(false);
  });

  it('should require all 11 dimensions', () => {
    const result = OecdBliValuesSchema.safeParse({
      BAD: { income: 5.0 },
    });
    expect(result.success).toBe(false);
  });

  it('should accept empty record', () => {
    const result = OecdBliValuesSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('getMockOecdBliRegionValue', () => {
  it('should return valid default values', () => {
    const value = getMockOecdBliRegionValue();
    expect(value.income).toBe(8.5);
    expect(value.lifeSatisfaction).toBe(7.0);
  });

  it('should accept overrides', () => {
    const value = getMockOecdBliRegionValue({ income: 3.0 });
    expect(value.income).toBe(3.0);
  });

  it('should reject invalid overrides via schema', () => {
    expect(() => getMockOecdBliRegionValue({ income: -1 })).toThrow();
  });
});
