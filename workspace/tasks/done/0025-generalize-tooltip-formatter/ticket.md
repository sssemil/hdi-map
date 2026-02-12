# Generalize tooltip with per-index formatter function

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 1 — Non-Breaking Refactors

## Description

The current `formatTooltipContent` in `src/tooltip.ts` is monolithically coupled to HDI (calls `classifyHdi`, formats `educationIndex`/`healthIndex`/`incomeIndex`).

Introduce a `TooltipFormatter` type:

```typescript
type TooltipFormatter = (gdlCode: string, name: string, country: string, level: string, source?: string) => string;
```

Or more practically, refactor the existing function into an HDI-specific formatter that can be registered alongside WHR and OECD formatters in the index registry.

The existing `formatTooltipContent` becomes the HDI formatter. The app passes the active formatter to the tooltip controller.

## Acceptance Criteria

- [ ] `TooltipFormatter` type defined and exported
- [ ] Existing `formatTooltipContent` refactored as the HDI tooltip formatter
- [ ] `app.ts` wires the formatter through the tooltip controller
- [ ] All 13 existing tooltip tests pass without modification
- [ ] TypeScript strict mode clean

## Implementation Notes

- The formatter needs access to both region identity (name, country, level) and index-specific values
- For HDI, the formatter accesses hdi/education/health/income from the value map
- The formatter signature should receive the region's base properties + the index values
- Keep `formatTooltipContent` as a named export for backward compatibility, make it call the formatter internally

## Dependencies

- Blocked by: None
- Blocks: 0044, 0046
