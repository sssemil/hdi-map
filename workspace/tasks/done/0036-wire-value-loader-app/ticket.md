# Wire value-loader into app.ts

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 4 — Runtime Integration

## Description

Replace the current direct property access pattern in `app.ts` with the value-loader system. On initial load:

1. Load geometry from `regions.topo.json` (as before)
2. Load `hdi-values.json` via value-loader
3. Build `getValue` accessor that looks up values from the loaded data
4. Pass `getValue` to the renderer

The renderer no longer reads `d.properties.hdi` — it calls `getValue(gdlCode, countryIso)`.

This task wires together tasks 0021 (renderer value accessor), 0028 (value-loader), and 0030 (HDI values JSON) into a working end-to-end flow that behaves identically to the current app but uses the new architecture.

## Acceptance Criteria

- [ ] Initial load fetches geometry + HDI values separately
- [ ] Renderer uses `getValue` accessor (not direct property access)
- [ ] Map renders identically to current behavior
- [ ] Palette switching still works
- [ ] Legend bin hover highlighting still works
- [ ] Search + zoom still works
- [ ] Tooltips still show correct HDI data
- [ ] No performance regression visible on initial load

## Implementation Notes

- This is the integration point where the shared-geometry + value-overlay pattern comes together
- Build a `Map<string, HdiValues>` from the loaded JSON for O(1) lookups
- The `getValue` for HDI: `(gdlCode) => hdiValuesMap.get(gdlCode)?.hdi ?? null`
- Consider loading geometry and HDI values in parallel (`Promise.all`)
- The tooltip formatter needs access to the full value object (not just the primary value)

## Dependencies

- Blocked by: 0021, 0022, 0024, 0028, 0030
- Blocks: 0031, 0037
