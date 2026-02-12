# Rename `HdiBin` to `Bin` and extract `HDI_BIN_DEFINITIONS`

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 1 — Non-Breaking Refactors

## Description

Rename the `HdiBin` type in `src/color-scale.ts` to `Bin` (it will be used for all indices, not just HDI). Extract the module-level `BIN_DEFINITIONS` constant as a named export `HDI_BIN_DEFINITIONS`.

Also rename the default exports `HDI_BINS` and `getColor` to clarify they are HDI-specific convenience exports that will be deprecated once the index registry exists.

Update all imports across the codebase (`app.ts`, `color-scale.test.ts`, any other consumers).

## Acceptance Criteria

- [ ] `HdiBin` type renamed to `Bin` throughout codebase
- [ ] `BIN_DEFINITIONS` exported as `HDI_BIN_DEFINITIONS`
- [ ] All existing tests pass without modification (pure rename)
- [ ] TypeScript strict mode clean

## Implementation Notes

- This is a mechanical rename with zero behavior change
- `color-scale.test.ts` imports `HdiBin` — update to `Bin`
- `app.ts` imports `HdiBin` — update to `Bin`
- Keep `HDI_BINS` and `getColor` exports for now (backward compat), but they will be removed in a later task

## Dependencies

- Blocked by: None
- Blocks: 0020
