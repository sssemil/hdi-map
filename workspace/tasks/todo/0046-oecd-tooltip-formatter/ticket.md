# OECD BLI tooltip formatter

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 5 — Per-Index Content

## Description

Create an OECD BLI-specific tooltip formatter. The content depends on the selected dimension:

**Single dimension (e.g., Health)**:
```
Bavaria, Germany
Health: 8.3
Source: OECD Regional Well-Being
```

**Weighted Average**:
```
Bavaria, Germany
Weighted Average: 7.1
  Income: 8.5  Jobs: 7.8  Housing: 6.2
  Education: 7.9  Health: 8.3  Environment: 5.1
  Safety: 9.2  Civic Engagement: 4.3  Services: 6.8
  Community: 7.5  Life Satisfaction: 7.0
Source: OECD Regional Well-Being
```

Show all 11 dimension values as compact sub-indices when viewing the weighted average.

## Acceptance Criteria

- [ ] Single dimension view shows dimension name + score
- [ ] Weighted average view shows composite score + all 11 dimension values
- [ ] Shows source attribution
- [ ] For regions with country-level fallback: shows "Country-level data" note
- [ ] For non-OECD regions on hover: shows "No OECD data"
- [ ] Full TDD test coverage

## Dependencies

- Blocked by: 0025, 0035
- Blocks: None
