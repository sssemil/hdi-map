import type { IndexId } from './index-registry';
import type { HdiValues } from './schemas/hdi-values.schema';
import type { WhrValues } from './schemas/whr-values.schema';
import type { OecdBliValues, OecdBliRegionValue } from './schemas/oecd-bli-values.schema';

type GetValueFn = (gdlCode: string, countryIso: string) => number | null;

type CreateGetValueOptions = {
  readonly indexId: IndexId;
  readonly values: Record<string, unknown>;
  readonly dimensionId?: string;
};

const OECD_DIMENSION_KEYS: readonly (keyof OecdBliRegionValue)[] = [
  'income', 'jobs', 'housing', 'education', 'health',
  'environment', 'safety', 'civicEngagement', 'accessToServices',
  'community', 'lifeSatisfaction',
];

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

const computeOecdWeightedAverage = (entry: OecdBliRegionValue): number | null => {
  const validValues = OECD_DIMENSION_KEYS
    .map((k) => entry[k])
    .filter((v): v is number => v !== null);

  if (validValues.length === 0) return null;

  return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
};

export const createGetValue = (options: CreateGetValueOptions): GetValueFn => {
  const { indexId, values, dimensionId } = options;

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
    return computeOecdWeightedAverage(entry);
  };
};
