# OECD weighted average computation module

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 4 — Runtime Integration

## Description

Create `src/weighted-average.ts` with a pure function that computes a weighted average across OECD BLI dimensions.

```typescript
type DimensionWeights = {
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

export const computeWeightedAverage = (
  values: OecdBliRegionValues,
  weights: DimensionWeights
): number | null => { ... };

export const normalizeWeights = (weights: DimensionWeights): DimensionWeights => { ... };

export const EQUAL_WEIGHTS: DimensionWeights = { ... }; // All dimensions at 1/11
```

Handle null dimension values: exclude from weighted sum and re-normalize remaining weights.

## Acceptance Criteria

- [ ] `computeWeightedAverage` produces correct weighted sum
- [ ] Null dimension values are excluded (remaining weights re-normalized)
- [ ] If all dimension values are null, returns null
- [ ] `normalizeWeights` ensures weights sum to 1.0
- [ ] `EQUAL_WEIGHTS` gives 1/11 to each dimension
- [ ] Full TDD test coverage with edge cases

## Implementation Notes

- Pure functions, no side effects
- The weight sliders (task 0040) will call `normalizeWeights` when a slider changes
- The `getValue` accessor for "Weighted Average" mode calls `computeWeightedAverage`

## Dependencies

- Blocked by: 0027 (OECD value types)
- Blocks: 0040
