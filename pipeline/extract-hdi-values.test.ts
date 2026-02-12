import { describe, it, expect } from 'vitest';
import { extractHdiValues } from './extract-hdi-values';
import { HdiValuesSchema } from '../src/schemas/hdi-values.schema';

describe('extractHdiValues', () => {
  it('should extract HDI values from region properties', () => {
    const regions = [
      {
        gdlCode: 'GBRr101',
        hdi: 0.929,
        educationIndex: 0.887,
        healthIndex: 0.953,
        incomeIndex: 0.948,
        year: 2022,
      },
      {
        gdlCode: 'INDr101',
        hdi: 0.650,
        educationIndex: 0.530,
        healthIndex: 0.710,
        incomeIndex: 0.690,
        year: 2021,
      },
    ];

    const result = extractHdiValues(regions);

    expect(result).toEqual({
      GBRr101: { hdi: 0.929, educationIndex: 0.887, healthIndex: 0.953, incomeIndex: 0.948, year: 2022 },
      INDr101: { hdi: 0.650, educationIndex: 0.530, healthIndex: 0.710, incomeIndex: 0.690, year: 2021 },
    });
  });

  it('should handle null values', () => {
    const regions = [
      {
        gdlCode: 'TWNt',
        hdi: 0.926,
        educationIndex: null,
        healthIndex: null,
        incomeIndex: null,
        year: 2022,
      },
    ];

    const result = extractHdiValues(regions);

    expect(result.TWNt.hdi).toBe(0.926);
    expect(result.TWNt.educationIndex).toBeNull();
  });

  it('should skip regions with null HDI', () => {
    const regions = [
      {
        gdlCode: 'GBRr101',
        hdi: 0.929,
        educationIndex: 0.887,
        healthIndex: 0.953,
        incomeIndex: 0.948,
        year: 2022,
      },
      {
        gdlCode: 'UNKt',
        hdi: null,
        educationIndex: null,
        healthIndex: null,
        incomeIndex: null,
        year: 0,
      },
    ];

    const result = extractHdiValues(regions);

    expect(Object.keys(result)).toEqual(['GBRr101']);
  });

  it('should return empty object for empty input', () => {
    expect(extractHdiValues([])).toEqual({});
  });

  it('should produce output that validates against HdiValuesSchema', () => {
    const regions = [
      {
        gdlCode: 'GBRr101',
        hdi: 0.929,
        educationIndex: 0.887,
        healthIndex: 0.953,
        incomeIndex: 0.948,
        year: 2022,
      },
    ];

    const result = extractHdiValues(regions);
    const validation = HdiValuesSchema.safeParse(result);

    expect(validation.success).toBe(true);
  });
});
