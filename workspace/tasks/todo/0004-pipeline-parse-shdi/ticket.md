# Pipeline: Parse SHDI CSV

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 2

## Description

Parse the SHDI v8.3 CSV file, filter to the latest available year per region, and extract the fields needed for the TopoJSON properties.

### Steps (TDD)

1. RED: Test that CSV parsing extracts expected columns (gdlCode, country, hdi, educationIndex, healthIndex, incomeIndex, year)
2. GREEN: Implement CSV parser (use a lightweight CSV library or native parsing)
3. RED: Test that filtering selects the latest year per region (not all regions may have the same latest year)
4. GREEN: Implement latest-year filtering
5. RED: Test edge cases: missing values, malformed rows, encoding issues (diacritics in region names)
6. GREEN: Handle edge cases
7. RED: Test output matches the expected shape (array of objects conforming to a subset of RegionPropertiesSchema)
8. GREEN: Validate output

### Output

Array of parsed SHDI records, one per region (latest year), with fields:
- `gdlCode`, `name`, `country`, `countryIso`, `year`
- `hdi`, `educationIndex`, `healthIndex`, `incomeIndex`

## Acceptance Criteria

- [ ] Parses SHDI CSV successfully
- [ ] Filters to latest available year per GDL-Code
- [ ] Handles missing/null HDI values gracefully
- [ ] Handles non-ASCII characters in region names
- [ ] Reports total records parsed, unique regions, year distribution
- [ ] 100% test coverage on parsing and filtering logic

## Implementation Notes

- The actual column names in the CSV will be discovered during the spike (task 0001). Adjust accordingly.
- The CSV may have ~50,000+ rows (1,800 regions x 30 years). Filter early to reduce memory.
- Use a streaming CSV parser if memory is a concern.
- Region names may contain diacritics (UTF-8). Ensure encoding is handled correctly.

## Dependencies

- Blocked by: 0001 (spike reveals CSV structure), 0003 (schema defines output shape)
- Blocks: 0006

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
