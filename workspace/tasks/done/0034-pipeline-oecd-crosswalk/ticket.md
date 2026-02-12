# Pipeline — OECD TL2-to-GDL crosswalk table

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 3 — Data Pipelines

## Description

Create a tested JSON mapping file `pipeline/data/oecd-tl2-to-gdl.json` that maps OECD TL2 region codes to GDL region codes.

The OECD spike identified three categories:
1. **Exact/near match** (~20 countries, ~330 regions): Name mapping needed (e.g., Bavaria→Bayern for Germany, "North East England"→"North East" for UK)
2. **Boundary mismatch** (~19 countries, ~179 regions): Many-to-one mapping (e.g., OECD "Grand Est" → GDL Alsace + Lorraine + Champagne-Ardenne)
3. **No GDL geometry** (Bulgaria, Croatia): Country-level fallback only

Format:
```json
{
  "AU1": ["AUSr101"],
  "DE1": ["DEUr101"],
  "FR10": ["FRAr101", "FRAr102", "FRAr103"],
  ...
}
```

Where each TL2 code maps to one or more `gdlCode` values. For many-to-one cases, all listed GDL regions receive the same OECD score.

Also include a country-level fallback section for countries where all regions should get the same score (Bulgaria, Croatia, and any country where subnational matching fails).

## Acceptance Criteria

- [ ] `pipeline/data/oecd-tl2-to-gdl.json` covers all 509 OECD TL2 regions
- [ ] Each TL2 code maps to one or more GDL codes
- [ ] Many-to-one mappings documented (France, Belgium, Ireland, etc.)
- [ ] Country-level fallback entries for Bulgaria and Croatia
- [ ] Test validates all referenced GDL codes exist in the geometry
- [ ] Test validates all 509 TL2 codes from the OECD Excel are present
- [ ] Coverage report: how many GDL regions in OECD countries have a match

## Implementation Notes

- This is a manually curated table — the single highest-effort task in the plan
- Start with Australia (8/8 exact match) and UK (12 with normalization) as easy wins
- For Germany, create English→German name mapping
- For France, use a reference of which pre-2016 regions merged into which post-2016 regions
- Write a validation script that reads both sources and reports match/mismatch rates
- Consider generating an initial draft programmatically and then hand-correcting

## Dependencies

- Blocked by: None (can start immediately, data files already in spike/data/)
- Blocks: 0035
