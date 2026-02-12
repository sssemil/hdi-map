import type { OecdBliRegionValue } from './schemas/oecd-bli-values.schema';

export type DimensionWeights = {
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

const DIMENSION_KEYS: readonly (keyof DimensionWeights)[] = [
  'income', 'jobs', 'housing', 'education', 'health',
  'environment', 'safety', 'civicEngagement', 'accessToServices',
  'community', 'lifeSatisfaction',
];

const WEIGHT_PER_DIMENSION = 1 / DIMENSION_KEYS.length;

export const EQUAL_WEIGHTS: DimensionWeights = Object.fromEntries(
  DIMENSION_KEYS.map((k) => [k, WEIGHT_PER_DIMENSION])
) as unknown as DimensionWeights;

export const normalizeWeights = (weights: DimensionWeights): DimensionWeights => {
  const total = DIMENSION_KEYS.reduce((sum, k) => sum + weights[k], 0);

  return Object.fromEntries(
    DIMENSION_KEYS.map((k) => [k, weights[k] / total])
  ) as unknown as DimensionWeights;
};

type ComputeWeightedAverageOptions = {
  readonly values: OecdBliRegionValue;
  readonly weights: DimensionWeights;
};

export const computeWeightedAverage = (options: ComputeWeightedAverageOptions): number | null => {
  const { values, weights } = options;

  const validPairs = DIMENSION_KEYS
    .filter((k) => values[k] !== null)
    .map((k) => ({ value: values[k] as number, weight: weights[k] }));

  if (validPairs.length === 0) return null;

  const totalWeight = validPairs.reduce((sum, p) => sum + p.weight, 0);

  return validPairs.reduce((sum, p) => sum + p.value * (p.weight / totalWeight), 0);
};
