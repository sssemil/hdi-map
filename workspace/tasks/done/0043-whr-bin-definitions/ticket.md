# WHR bin definitions and color scale

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 5 — Per-Index Content

## Description

Define `WHR_BIN_DEFINITIONS` with bin boundaries and labels appropriate for the World Happiness Report's Cantril Ladder scale.

Data spike findings: scores range from 1.364 (Afghanistan) to 7.736 (Finland), concentrated in 5-7 range. Distribution (2024): [1-2): 1, [2-3): 1, [3-4): 15, [4-5): 30, [5-6): 39, [6-7): 52, [7-8): 9.

Suggested bins (~7 bins):
- < 3.0: Very Low
- 3.0 - 4.0: Low
- 4.0 - 5.0: Below Average
- 5.0 - 5.5: Average
- 5.5 - 6.0: Above Average
- 6.0 - 7.0: High
- 7.0+: Very High

Adjust `samplePoint` values to distribute evenly across the palette gradient.

Register in the index registry (task 0026).

## Acceptance Criteria

- [ ] `WHR_BIN_DEFINITIONS` defined with appropriate boundaries for 0-10 scale
- [ ] Labels are clear and descriptive
- [ ] Sample points distribute palette colors effectively across the data range
- [ ] Registered in the WHR `IndexDefinition`
- [ ] Tests verify bin assignment for boundary values

## Dependencies

- Blocked by: 0020 (parameterized color scale), 0026 (index registry)
- Blocks: None
