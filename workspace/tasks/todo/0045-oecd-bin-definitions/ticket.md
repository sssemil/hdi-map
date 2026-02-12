# OECD BLI bin definitions and color scale

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 5 — Per-Index Content

## Description

Define `OECD_BIN_DEFINITIONS` with bin boundaries for the OECD BLI 0-10 scale. These bins are used for all 11 dimensions and the weighted average (same scale).

Data spike: scores use full 0-10 range (some dimensions hit both extremes). Distribution varies by dimension.

Suggested bins (~6-7 bins):
- 0.0 - 2.0: Very Low
- 2.0 - 4.0: Low
- 4.0 - 5.0: Below Average
- 5.0 - 6.0: Average
- 6.0 - 7.0: Above Average
- 7.0 - 8.5: High
- 8.5 - 10.0: Very High

Register in the index registry.

## Acceptance Criteria

- [ ] `OECD_BIN_DEFINITIONS` defined for 0-10 scale
- [ ] Labels clear and descriptive
- [ ] Sample points distribute palette colors effectively
- [ ] Registered in the OECD BLI `IndexDefinition`
- [ ] Tests verify bin assignment

## Dependencies

- Blocked by: 0020, 0026
- Blocks: None
