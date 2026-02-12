# Pipeline — OECD Excel → `oecd-bli-values.json`

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 3 — Data Pipelines

## Description

Create `pipeline/build-oecd.ts` that reads the OECD Regional Well-Being Excel file, applies the TL2-to-GDL crosswalk, and outputs `public/data/oecd-bli-values.json`.

All 11 dimensions bundled into a single file (509 regions x 11 numbers is small):

```json
{
  "AUSr101": { "income": 7.2, "jobs": 6.1, "housing": 8.3, ... },
  "DEUr101": { "income": 8.5, "jobs": 7.8, ... },
  "_country:BGR": { "income": 3.2, ... }
}
```

For many-to-one crosswalk entries (e.g., France), all mapped GDL codes get the same OECD score.
Country-level fallback entries use a `_country:ISO` key prefix.

## Acceptance Criteria

- [ ] `oecd-bli-values.json` generated in `public/data/`
- [ ] Keyed by `gdlCode` (subnational) and `_country:ISO` (country fallback)
- [ ] All 11 dimensions present per region
- [ ] Validates against `OecdBliValuesSchema`
- [ ] Many-to-one crosswalk correctly duplicates scores to all mapped GDL regions
- [ ] Country-level fallback for Bulgaria, Croatia, and any unmapped regions
- [ ] Pipeline runs via build script
- [ ] File size < 200KB

## Implementation Notes

- Need `xlsx` or `exceljs` for Excel parsing (same dep as WHR pipeline)
- Read from `spike/data/OECD-Regional-Well-Being-Data-File.xlsx`
- The `Score_Last` sheet has data starting at row 9, headers at row 7
- Country column may be sparse (needs fill-down from previous non-empty row)
- Apply crosswalk from `pipeline/data/oecd-tl2-to-gdl.json` (task 0034)
- Handle missing values (null for dimensions where OECD reports no data)

## Dependencies

- Blocked by: 0027 (value schema), 0034 (crosswalk table)
- Blocks: 0036, 0046
