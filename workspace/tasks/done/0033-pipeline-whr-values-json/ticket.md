# Pipeline — WHR Excel → `whr-values.json`

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 3 — Data Pipelines

## Description

Create `pipeline/build-whr.ts` that reads the WHR Excel file, applies the country-name-to-ISO mapping, and outputs `public/data/whr-values.json`.

Strategy: For each country, use the most recent available year (maximizes coverage to 168 countries vs 147 for 2024-only).

```json
{
  "FIN": { "score": 7.736, "gdpPerCapita": 1.855, "socialSupport": 1.587, "lifeExpectancy": 0.695, "freedom": 0.830, "generosity": 0.141, "corruption": 0.519, "year": 2024 },
  "AFG": { "score": 1.364, ... }
}
```

Keyed by 3-letter ISO country code.

## Acceptance Criteria

- [ ] `whr-values.json` generated in `public/data/`
- [ ] Keyed by `countryIso` (3-letter ISO)
- [ ] Uses most recent available year per country
- [ ] Validates against `WhrValuesSchema`
- [ ] Countries with no ISO mapping (North Cyprus, Somaliland) excluded
- [ ] Pipeline runs via `npm run build:data` or a new script
- [ ] File size < 50KB

## Implementation Notes

- Need to add `xlsx` or `exceljs` to devDependencies for Excel parsing
- Read from `spike/data/whr-2025-figure-2.1.xlsx`
- Apply mapping from `pipeline/data/whr-country-to-iso.json` (task 0032)
- Sort by year descending, take first (most recent) per country
- The WHR "Explained by:" columns are the sub-factors shown in tooltips

## Dependencies

- Blocked by: 0027 (value schema), 0032 (name-to-ISO mapping)
- Blocks: 0036, 0044
