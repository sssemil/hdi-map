import type { IndexId } from './index-registry';
import type { HdiValues } from './schemas/hdi-values.schema';
import type { WhrValues } from './schemas/whr-values.schema';
import type { OecdBliValues, OecdBliRegionValue } from './schemas/oecd-bli-values.schema';
import { computeWeightedAverage, EQUAL_WEIGHTS, type DimensionWeights } from './weighted-average';

type GetValueFn = (gdlCode: string, countryIso: string) => number | null;

type CreateGetValueOptions = {
  readonly indexId: IndexId;
  readonly values: Record<string, unknown>;
  readonly dimensionId?: string;
  readonly weights?: DimensionWeights;
};

const DIMENSION_ID_TO_KEY: Record<string, keyof OecdBliRegionValue> = {
  income: 'income',
  jobs: 'jobs',
  housing: 'housing',
  education: 'education',
  health: 'health',
  environment: 'environment',
  safety: 'safety',
  'civic-engagement': 'civicEngagement',
  'accessibility-to-services': 'accessToServices',
  community: 'community',
  'life-satisfaction': 'lifeSatisfaction',
};

export const createGetValue = (options: CreateGetValueOptions): GetValueFn => {
  const { indexId, values, dimensionId, weights = EQUAL_WEIGHTS } = options;

  if (indexId === 'hdi') {
    const hdiValues = values as HdiValues;
    return (gdlCode: string): number | null =>
      hdiValues[gdlCode]?.hdi ?? null;
  }

  if (indexId === 'whr') {
    const whrValues = values as WhrValues;
    return (_gdlCode: string, countryIso: string): number | null =>
      whrValues[countryIso]?.score ?? null;
  }

  const oecdValues = values as OecdBliValues;
  const schemaKey = dimensionId ? DIMENSION_ID_TO_KEY[dimensionId] : undefined;

  if (schemaKey) {
    return (_gdlCode: string, countryIso: string): number | null =>
      oecdValues[countryIso]?.[schemaKey] ?? null;
  }

  return (_gdlCode: string, countryIso: string): number | null => {
    const entry = oecdValues[countryIso];
    if (!entry) return null;
    return computeWeightedAverage({ values: entry, weights });
  };
};
