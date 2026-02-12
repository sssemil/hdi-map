import type { WhrValues } from '../src/schemas/whr-values.schema';

export type WhrExcelRow = {
  readonly 'Year': number;
  readonly 'Country name': string;
  readonly 'Life evaluation (3-year average)': number;
  readonly 'Explained by: Log GDP per capita'?: number;
  readonly 'Explained by: Social support'?: number;
  readonly 'Explained by: Healthy life expectancy'?: number;
  readonly 'Explained by: Freedom to make life choices'?: number;
  readonly 'Explained by: Generosity'?: number;
  readonly 'Explained by: Perceptions of corruption'?: number;
};

const toNullable = (value: number | undefined): number | null =>
  value === undefined ? null : value;

export const extractWhrValues = (
  rows: readonly WhrExcelRow[],
  countryToIso: Record<string, string | null>
): WhrValues => {
  const byCountry = new Map<string, WhrExcelRow>();

  for (const row of rows) {
    const iso = countryToIso[row['Country name']];
    if (!iso) continue;

    const existing = byCountry.get(iso);
    if (!existing || row['Year'] > existing['Year']) {
      byCountry.set(iso, row);
    }
  }

  const result: Record<string, WhrValues[string]> = {};
  for (const [iso, row] of byCountry) {
    result[iso] = {
      score: row['Life evaluation (3-year average)'],
      gdpPerCapita: toNullable(row['Explained by: Log GDP per capita']),
      socialSupport: toNullable(row['Explained by: Social support']),
      lifeExpectancy: toNullable(row['Explained by: Healthy life expectancy']),
      freedom: toNullable(row['Explained by: Freedom to make life choices']),
      generosity: toNullable(row['Explained by: Generosity']),
      corruption: toNullable(row['Explained by: Perceptions of corruption']),
      year: row['Year'],
    };
  }

  return result;
};
