# OECD coverage note near legend

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 5 — Per-Index Content

## Description

When OECD BLI is the active index, ~80% of the world map is gray (only OECD member countries have data). Users may think the data failed to load.

Add a muted note near the legend: "Data available for OECD member countries only" (or similar). This note appears only when OECD BLI is the active index and disappears when switching to HDI or WHR.

## Acceptance Criteria

- [ ] Note appears below or within the legend when OECD BLI is active
- [ ] Note hidden for HDI and WHR
- [ ] Muted styling (smaller font, gray text) — not distracting
- [ ] Text clearly explains the coverage limitation

## Implementation Notes

- Can be a conditional element in the `createLegend` function
- Or a separate small div positioned near the legend
- Only needs the active `indexId` to decide visibility

## Dependencies

- Blocked by: 0037 (index switcher)
- Blocks: None
