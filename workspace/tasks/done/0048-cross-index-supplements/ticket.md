# Cross-index supplements (Taiwan, HK, San Marino)

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 5 — Per-Index Content

## Description

Best-effort lookup for Taiwan, Hong Kong, and San Marino in WHR and OECD data:

**WHR**:
- Taiwan: Listed as "Taiwan Province of China" in WHR data — extract score
- Hong Kong: Listed as "Hong Kong SAR of China" — extract score
- San Marino: Likely NOT in WHR data (small state) — stays gray

**OECD**:
- None of these three are OECD members — all stay gray for OECD

Add per-index supplement entries to the value files or value-loader.

## Acceptance Criteria

- [ ] Taiwan and Hong Kong show WHR scores (if present in WHR data)
- [ ] San Marino shows gray for WHR (if absent)
- [ ] All three show gray for OECD BLI
- [ ] Source attribution correct per supplement per index

## Implementation Notes

- Check the WHR Excel for "Taiwan Province of China" and "Hong Kong SAR of China"
- The name-to-ISO mapping (task 0032) already maps these to TWN and HKG
- The value-loader should apply per-index supplements after loading

## Dependencies

- Blocked by: 0033 (WHR values), 0035 (OECD values)
- Blocks: None
