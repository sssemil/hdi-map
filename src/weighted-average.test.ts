import { describe, it, expect } from 'vitest';
import { computeWeightedAverage, normalizeWeights, redistributeWeights, EQUAL_WEIGHTS, type DimensionWeights } from './weighted-average';
import { getMockOecdBliRegionValue } from './schemas/oecd-bli-values.schema';

describe('EQUAL_WEIGHTS', () => {
  it('should assign equal weight to all 11 dimensions', () => {
    const keys = Object.keys(EQUAL_WEIGHTS);
    expect(keys).toHaveLength(11);

    const expectedWeight = 1 / 11;
    for (const key of keys) {
      expect(EQUAL_WEIGHTS[key as keyof DimensionWeights]).toBeCloseTo(expectedWeight, 10);
    }
  });

  it('should sum to 1.0', () => {
    const sum = Object.values(EQUAL_WEIGHTS).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });
});

describe('normalizeWeights', () => {
  it('should normalize weights so they sum to 1.0', () => {
    const weights: DimensionWeights = {
      income: 2, jobs: 2, housing: 2, education: 2, health: 2,
      environment: 2, safety: 2, civicEngagement: 2, accessToServices: 2,
      community: 2, lifeSatisfaction: 2,
    };

    const normalized = normalizeWeights(weights);
    const sum = Object.values(normalized).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it('should preserve relative proportions between weights', () => {
    const weights: DimensionWeights = {
      income: 3, jobs: 1, housing: 1, education: 1, health: 1,
      environment: 1, safety: 1, civicEngagement: 1, accessToServices: 1,
      community: 1, lifeSatisfaction: 1,
    };

    const normalized = normalizeWeights(weights);
    expect(normalized.income / normalized.jobs).toBeCloseTo(3.0, 10);
  });

  it('should return equal weights when all inputs are equal', () => {
    const weights: DimensionWeights = {
      income: 5, jobs: 5, housing: 5, education: 5, health: 5,
      environment: 5, safety: 5, civicEngagement: 5, accessToServices: 5,
      community: 5, lifeSatisfaction: 5,
    };

    const normalized = normalizeWeights(weights);
    const expectedWeight = 1 / 11;
    for (const value of Object.values(normalized)) {
      expect(value).toBeCloseTo(expectedWeight, 10);
    }
  });

  it('should handle already-normalized weights', () => {
    const normalized = normalizeWeights(EQUAL_WEIGHTS);
    const sum = Object.values(normalized).reduce((s, v) => s + v, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });
});

describe('redistributeWeights', () => {
  it('should set changed dimension to new percentage and redistribute rest', () => {
    const result = redistributeWeights({
      currentWeights: EQUAL_WEIGHTS,
      changedKey: 'income',
      newPercentage: 50,
    });

    expect(result.income).toBeCloseTo(50, 5);
    const otherSum = Object.entries(result)
      .filter(([k]) => k !== 'income')
      .reduce((sum, [, v]) => sum + v, 0);
    expect(otherSum).toBeCloseTo(50, 5);
  });

  it('should maintain total of 100', () => {
    const result = redistributeWeights({
      currentWeights: EQUAL_WEIGHTS,
      changedKey: 'health',
      newPercentage: 30,
    });

    const total = Object.values(result).reduce((s, v) => s + v, 0);
    expect(total).toBeCloseTo(100, 5);
  });

  it('should preserve relative proportions of unchanged dimensions', () => {
    const unequalWeights: DimensionWeights = {
      income: 20, jobs: 10, housing: 10, education: 10, health: 10,
      environment: 10, safety: 10, civicEngagement: 5, accessToServices: 5,
      community: 5, lifeSatisfaction: 5,
    };
    const normalized = normalizeWeights(unequalWeights);

    const result = redistributeWeights({
      currentWeights: normalized,
      changedKey: 'income',
      newPercentage: 40,
    });

    expect(result.jobs / result.housing).toBeCloseTo(1.0, 5);
    expect(result.civicEngagement / result.community).toBeCloseTo(1.0, 5);
  });

  it('should set all others to 0 when changed to 100', () => {
    const result = redistributeWeights({
      currentWeights: EQUAL_WEIGHTS,
      changedKey: 'income',
      newPercentage: 100,
    });

    expect(result.income).toBeCloseTo(100, 5);
    const otherKeys = Object.keys(result).filter((k) => k !== 'income') as (keyof DimensionWeights)[];
    for (const key of otherKeys) {
      expect(result[key]).toBeCloseTo(0, 5);
    }
  });

  it('should distribute evenly among others when changed to 0', () => {
    const result = redistributeWeights({
      currentWeights: EQUAL_WEIGHTS,
      changedKey: 'income',
      newPercentage: 0,
    });

    expect(result.income).toBeCloseTo(0, 5);
    const otherKeys = Object.keys(result).filter((k) => k !== 'income') as (keyof DimensionWeights)[];
    for (const key of otherKeys) {
      expect(result[key]).toBeCloseTo(10, 5);
    }
  });

  it('should handle edge case where all other weights are zero', () => {
    const allOnIncome: DimensionWeights = {
      income: 1, jobs: 0, housing: 0, education: 0, health: 0,
      environment: 0, safety: 0, civicEngagement: 0, accessToServices: 0,
      community: 0, lifeSatisfaction: 0,
    };

    const result = redistributeWeights({
      currentWeights: allOnIncome,
      changedKey: 'income',
      newPercentage: 50,
    });

    expect(result.income).toBeCloseTo(50, 5);
    const total = Object.values(result).reduce((s, v) => s + v, 0);
    expect(total).toBeCloseTo(100, 5);
  });
});

describe('computeWeightedAverage', () => {
  it('should compute equal-weighted average with EQUAL_WEIGHTS', () => {
    const values = getMockOecdBliRegionValue({
      income: 5.0, jobs: 8.0, housing: 6.0, education: 8.0,
      health: 9.0, environment: 8.0, safety: 9.5, civicEngagement: 9.5,
      accessToServices: 6.0, community: 8.5, lifeSatisfaction: 8.5,
    });

    const result = computeWeightedAverage({ values, weights: EQUAL_WEIGHTS });
    const expected = (5.0 + 8.0 + 6.0 + 8.0 + 9.0 + 8.0 + 9.5 + 9.5 + 6.0 + 8.5 + 8.5) / 11;
    expect(result).toBeCloseTo(expected, 5);
  });

  it('should apply custom weights correctly', () => {
    const values = getMockOecdBliRegionValue({
      income: 10.0, jobs: 0.0, housing: 0.0, education: 0.0,
      health: 0.0, environment: 0.0, safety: 0.0, civicEngagement: 0.0,
      accessToServices: 0.0, community: 0.0, lifeSatisfaction: 0.0,
    });

    const weights: DimensionWeights = {
      income: 1, jobs: 0, housing: 0, education: 0, health: 0,
      environment: 0, safety: 0, civicEngagement: 0, accessToServices: 0,
      community: 0, lifeSatisfaction: 0,
    };

    const result = computeWeightedAverage({ values, weights });
    expect(result).toBeCloseTo(10.0, 5);
  });

  it('should exclude null dimension values and re-normalize', () => {
    const values = getMockOecdBliRegionValue({
      income: null, jobs: null, housing: null, education: null,
      health: 4.2, environment: 7.2, safety: 2.6, civicEngagement: 4.2,
      accessToServices: 3.2, community: null, lifeSatisfaction: null,
    });

    const result = computeWeightedAverage({ values, weights: EQUAL_WEIGHTS });
    const expected = (4.2 + 7.2 + 2.6 + 4.2 + 3.2) / 5;
    expect(result).toBeCloseTo(expected, 5);
  });

  it('should return null when all dimension values are null', () => {
    const values = getMockOecdBliRegionValue({
      income: null, jobs: null, housing: null, education: null,
      health: null, environment: null, safety: null, civicEngagement: null,
      accessToServices: null, community: null, lifeSatisfaction: null,
    });

    const result = computeWeightedAverage({ values, weights: EQUAL_WEIGHTS });
    expect(result).toBeNull();
  });

  it('should weight dimensions proportionally with non-equal weights', () => {
    const values = getMockOecdBliRegionValue({
      income: 10.0, jobs: 0.0, housing: 5.0, education: 5.0,
      health: 5.0, environment: 5.0, safety: 5.0, civicEngagement: 5.0,
      accessToServices: 5.0, community: 5.0, lifeSatisfaction: 5.0,
    });

    const heavyIncome: DimensionWeights = {
      income: 10, jobs: 1, housing: 1, education: 1, health: 1,
      environment: 1, safety: 1, civicEngagement: 1, accessToServices: 1,
      community: 1, lifeSatisfaction: 1,
    };

    const heavyJobs: DimensionWeights = {
      income: 1, jobs: 10, housing: 1, education: 1, health: 1,
      environment: 1, safety: 1, civicEngagement: 1, accessToServices: 1,
      community: 1, lifeSatisfaction: 1,
    };

    const resultIncome = computeWeightedAverage({ values, weights: heavyIncome });
    const resultJobs = computeWeightedAverage({ values, weights: heavyJobs });

    expect(resultIncome).not.toBeNull();
    expect(resultJobs).not.toBeNull();
    expect(resultIncome!).toBeGreaterThan(resultJobs!);
  });

  it('should handle single non-null dimension', () => {
    const values = getMockOecdBliRegionValue({
      income: 7.5, jobs: null, housing: null, education: null,
      health: null, environment: null, safety: null, civicEngagement: null,
      accessToServices: null, community: null, lifeSatisfaction: null,
    });

    const result = computeWeightedAverage({ values, weights: EQUAL_WEIGHTS });
    expect(result).toBeCloseTo(7.5, 5);
  });
});
