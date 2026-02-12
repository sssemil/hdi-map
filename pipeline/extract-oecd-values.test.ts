import { describe, it, expect } from 'vitest';
import { extractOecdValues, type OecdExcelRow } from './extract-oecd-values';
import { OecdBliValuesSchema } from '../src/schemas/oecd-bli-values.schema';

const makeRow = (overrides?: Partial<OecdExcelRow>): OecdExcelRow => ({
  country: 'Australia',
  region: 'New South Wales',
  code: 'AU1',
  income: 5.0,
  jobs: 8.0,
  housing: 5.0,
  education: 8.0,
  health: 9.0,
  environment: 8.0,
  safety: 9.5,
  civicEngagement: 9.5,
  accessToServices: 6.0,
  community: 8.5,
  lifeSatisfaction: 8.5,
  ...overrides,
});

const countryToIso: Record<string, string> = {
  'Australia': 'AUS',
  'Germany': 'DEU',
};

describe('extractOecdValues', () => {
  it('should average dimension scores across TL2 regions per country', () => {
    const rows = [
      makeRow({ country: 'Australia', code: 'AU1', income: 4.0 }),
      makeRow({ country: 'Australia', code: 'AU2', income: 6.0 }),
    ];

    const result = extractOecdValues(rows, countryToIso);

    expect(result['AUS']).toBeDefined();
    expect(result['AUS'].income).toBeCloseTo(5.0, 1);
  });

  it('should map countries to ISO codes', () => {
    const rows = [
      makeRow({ country: 'Australia', code: 'AU1' }),
      makeRow({ country: 'Germany', code: 'DE1' }),
    ];

    const result = extractOecdValues(rows, countryToIso);

    expect(result['AUS']).toBeDefined();
    expect(result['DEU']).toBeDefined();
  });

  it('should skip rows with undefined country', () => {
    const rows = [
      makeRow({ country: undefined as unknown as string, code: 'XX1' }),
    ];

    const result = extractOecdValues(rows, countryToIso);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('should skip countries not in mapping', () => {
    const rows = [
      makeRow({ country: 'Unknown Country', code: 'XX1' }),
    ];

    const result = extractOecdValues(rows, countryToIso);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('should round dimension scores to 1 decimal place', () => {
    const rows = [
      makeRow({ country: 'Australia', code: 'AU1', income: 4.777 }),
      makeRow({ country: 'Australia', code: 'AU2', income: 5.333 }),
    ];

    const result = extractOecdValues(rows, countryToIso);

    expect(result['AUS'].income).toBe(5.1);
  });

  it('should return empty object for empty input', () => {
    expect(extractOecdValues([], countryToIso)).toEqual({});
  });

  it('should produce output that validates against OecdBliValuesSchema', () => {
    const rows = [makeRow()];
    const result = extractOecdValues(rows, countryToIso);
    const validation = OecdBliValuesSchema.safeParse(result);

    expect(validation.success).toBe(true);
  });
});
