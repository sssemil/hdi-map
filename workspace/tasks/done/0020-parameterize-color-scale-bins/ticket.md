# Parameterize `createColorScale` to accept bin definitions

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 1 — Non-Breaking Refactors

## Description

Change `createColorScale` signature from `(interpolator: Interpolator) => ColorScale` to accept bin definitions as a parameter:

```typescript
type BinDefinition = {
  readonly min: number;
  readonly max: number;
  readonly samplePoint: number;
  readonly label: string;
};

type CreateColorScaleOptions = {
  readonly interpolator: Interpolator;
  readonly binDefinitions: readonly BinDefinition[];
};

export const createColorScale = (options: CreateColorScaleOptions): ColorScale => { ... };
```

Default behavior preserved: callers that currently pass just an interpolator must be updated to pass `{ interpolator, binDefinitions: HDI_BIN_DEFINITIONS }`.

## Acceptance Criteria

- [ ] `createColorScale` accepts `{ interpolator, binDefinitions }` options object
- [ ] `BinDefinition` type exported
- [ ] All existing tests updated to pass `HDI_BIN_DEFINITIONS` and still pass
- [ ] `app.ts` palette switching updated to pass bin definitions
- [ ] TypeScript strict mode clean

## Implementation Notes

- Update `app.ts` lines 338-339 and 372: pass `binDefinitions: HDI_BIN_DEFINITIONS` alongside `interpolator`
- The `color-scale.test.ts` tests should verify bin customization works (add test for different bin definitions)
- Remove the module-level `defaultScale`, `HDI_BINS`, and `getColor` convenience exports (they are now redundant — callers should use `createColorScale` directly)

## Dependencies

- Blocked by: 0019
- Blocks: 0043, 0045
