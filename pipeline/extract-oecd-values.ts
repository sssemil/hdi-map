import type { OecdBliValues } from '../src/schemas/oecd-bli-values.schema';

export type OecdExcelRow = {
  readonly country: string;
  readonly region: string;
  readonly code: string;
  readonly income: number;
  readonly jobs: number;
  readonly housing: number;
  readonly education: number;
  readonly health: number;
  readonly environment: number;
  readonly safety: number;
  readonly civicEngagement: number;
  readonly accessToServices: number;
  readonly community: number;
  readonly lifeSatisfaction: number;
};

const DIMENSIONS = [
  'income', 'jobs', 'housing', 'education', 'health',
  'environment', 'safety', 'civicEngagement', 'accessToServices',
  'community', 'lifeSatisfaction',
] as const;

const round1 = (n: number): number => Math.round(n * 10) / 10;

export const extractOecdValues = (
  rows: readonly OecdExcelRow[],
  countryToIso: Record<string, string>
): OecdBliValues => {
  const byIso = new Map<string, OecdExcelRow[]>();

  for (const row of rows) {
    if (!row.country) continue;
    const iso = countryToIso[row.country];
    if (!iso) continue;

    const existing = byIso.get(iso) ?? [];
    byIso.set(iso, [...existing, row]);
  }

  const result: Record<string, OecdBliValues[string]> = {};

  for (const [iso, countryRows] of byIso) {
    const averaged: Record<string, number | null> = {};

    for (const dim of DIMENSIONS) {
      const values = countryRows.map((r) => r[dim]).filter((v) => v != null);
      averaged[dim] = values.length > 0
        ? round1(values.reduce((sum, v) => sum + v, 0) / values.length)
        : null;
    }

    result[iso] = averaged as OecdBliValues[string];
  }

  return result;
};
