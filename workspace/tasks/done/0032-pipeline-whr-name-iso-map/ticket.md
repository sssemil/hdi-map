# Pipeline — WHR country name-to-ISO mapping table

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 3 — Data Pipelines

## Description

Create a tested JSON mapping file `pipeline/data/whr-country-to-iso.json` that maps all 168 WHR country names to 3-letter ISO codes.

The WHR data spike identified 20 names requiring manual mapping:
- "Congo" → COG, "DR Congo" → COD
- "Cote d'Ivoire" (with Unicode U+2019 apostrophe) → CIV
- "Hong Kong SAR of China" → HKG
- "Taiwan Province of China" → TWN
- "Republic of Korea" → KOR
- "Russian Federation" → RUS
- "Turkiye" (with U+00FC) → TUR
- "North Cyprus" → null (no ISO), "Somaliland Region" → null
- Plus ~10 more documented in the WHR spike

## Acceptance Criteria

- [ ] `pipeline/data/whr-country-to-iso.json` maps all 168 WHR country names to ISO codes
- [ ] Names with Unicode characters (Côte d'Ivoire, Türkiye) handled correctly
- [ ] "North Cyprus" and "Somaliland Region" mapped to null (will be excluded)
- [ ] Eswatini/Swaziland dual entries both map to SWZ
- [ ] Test validates 100% coverage: every WHR country name has a mapping
- [ ] Test validates all ISO codes exist in the GDL geometry data

## Implementation Notes

- Source the 168 names directly from `spike/data/whr-2025-figure-2.1.xlsx`
- Cross-reference against `countryIso` values in existing `regions.topo.json`
- Consider writing a pipeline script that reads both and reports mismatches

## Dependencies

- Blocked by: None
- Blocks: 0033
