import { describe, it, expect } from 'vitest';
import { extractWhrValues, type WhrExcelRow } from './extract-whr-values';
import { WhrValuesSchema } from '../src/schemas/whr-values.schema';

const makeRow = (overrides?: Partial<WhrExcelRow>): WhrExcelRow => ({
  'Year': 2024,
  'Country name': 'Finland',
  'Life evaluation (3-year average)': 7.736,
  'Explained by: Log GDP per capita': 1.749,
  'Explained by: Social support': 1.783,
  'Explained by: Healthy life expectancy': 0.824,
  'Explained by: Freedom to make life choices': 0.986,
  'Explained by: Generosity': 0.110,
  'Explained by: Perceptions of corruption': 0.502,
  ...overrides,
});

const mapping: Record<string, string | null> = {
  'Finland': 'FIN',
  'Afghanistan': 'AFG',
  'North Cyprus': null,
};

describe('extractWhrValues', () => {
  it('should extract most recent year per country', () => {
    const rows = [
      makeRow({ 'Year': 2022, 'Life evaluation (3-year average)': 7.5 }),
      makeRow({ 'Year': 2024, 'Life evaluation (3-year average)': 7.736 }),
      makeRow({ 'Year': 2023, 'Life evaluation (3-year average)': 7.6 }),
    ];

    const result = extractWhrValues(rows, mapping);

    expect(result['FIN'].score).toBe(7.736);
    expect(result['FIN'].year).toBe(2024);
  });

  it('should map country names to ISO codes', () => {
    const rows = [
      makeRow(),
      makeRow({ 'Country name': 'Afghanistan', 'Life evaluation (3-year average)': 1.364 }),
    ];

    const result = extractWhrValues(rows, mapping);

    expect(result['FIN']).toBeDefined();
    expect(result['AFG']).toBeDefined();
    expect(result['AFG'].score).toBe(1.364);
  });

  it('should exclude countries with null ISO mapping', () => {
    const rows = [
      makeRow({ 'Country name': 'North Cyprus', 'Life evaluation (3-year average)': 5.0 }),
    ];

    const result = extractWhrValues(rows, mapping);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('should extract sub-factors', () => {
    const rows = [makeRow()];
    const result = extractWhrValues(rows, mapping);

    expect(result['FIN'].gdpPerCapita).toBe(1.749);
    expect(result['FIN'].socialSupport).toBe(1.783);
    expect(result['FIN'].lifeExpectancy).toBe(0.824);
    expect(result['FIN'].freedom).toBe(0.986);
    expect(result['FIN'].generosity).toBe(0.110);
    expect(result['FIN'].corruption).toBe(0.502);
  });

  it('should handle missing sub-factors as null', () => {
    const rows = [makeRow({
      'Explained by: Log GDP per capita': undefined,
      'Explained by: Social support': undefined,
    })];
    const result = extractWhrValues(rows, mapping);

    expect(result['FIN'].gdpPerCapita).toBeNull();
    expect(result['FIN'].socialSupport).toBeNull();
  });

  it('should return empty object for empty input', () => {
    expect(extractWhrValues([], mapping)).toEqual({});
  });

  it('should produce output that validates against WhrValuesSchema', () => {
    const rows = [makeRow()];
    const result = extractWhrValues(rows, mapping);
    const validation = WhrValuesSchema.safeParse(result);

    expect(validation.success).toBe(true);
  });
});
