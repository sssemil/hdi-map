# WHR tooltip formatter

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 5 — Per-Index Content

## Description

Create a WHR-specific tooltip formatter that shows:

```
Finland
Happiness Score: 7.736
GDP per capita: 1.855
Social support: 1.587
Life expectancy: 0.695
Freedom: 0.830
Generosity: 0.141
Corruption: 0.519
Source: World Happiness Report 2025
```

- Title: region name (+ country for subnational regions, though WHR is country-level)
- Primary value: "Happiness Score" to 1 decimal place (no classification — WHR has no official tiers)
- Sub-factors: 6 "Explained by" values to 3 decimal places
- Source attribution
- Note: "Country-level data" (since WHR is not subnational)

Register in the index registry.

## Acceptance Criteria

- [ ] WHR tooltip shows happiness score with 1 decimal
- [ ] Shows 6 sub-factors with labels
- [ ] Shows "Country-level data" note
- [ ] Shows source attribution
- [ ] Full TDD test coverage

## Dependencies

- Blocked by: 0025 (generalized tooltip), 0033 (WHR values available)
- Blocks: None
