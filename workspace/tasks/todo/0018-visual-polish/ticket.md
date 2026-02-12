# Visual Polish and Final Integration

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 4 (Final)

## Description

Final pass: wire all modules together in `app.ts`, visual polish, responsive tweaks, and final QA.

### Steps

1. Wire all modules in `app.ts`: data loader → map renderer → tooltips → zoom → search → legend
2. Add page title/header (minimal — not a dashboard)
3. Add attribution/data source credits (GDL, UNDP, Natural Earth)
4. Add disputed territory disclaimer (if applicable based on spike findings)
5. Fine-tune colors, spacing, fonts for readability on dark background
6. Test responsive layout at various desktop/tablet widths (768px - 2560px)
7. Test small viewport fallback message
8. Performance audit: measure load-to-interactive time
9. Cross-browser test: Chrome, Firefox, Safari (if available)
10. Build production output: `npm run build` → verify `dist/` contains all static assets
11. Final visual QA: compare against reference image for overall aesthetic

## Acceptance Criteria

- [ ] All modules wired and working together
- [ ] Attribution/credits displayed
- [ ] Responsive at ≥768px widths
- [ ] Small viewport shows fallback
- [ ] Load-to-interactive < 3 seconds (on 10 Mbps)
- [ ] Production build outputs valid static files
- [ ] Visual quality comparable to or better than reference image
- [ ] HDI values spot-checked for accuracy (hover 10 known regions, verify values)

## Implementation Notes

- Attribution should be subtle — small text at bottom: "Data: Global Data Lab SHDI v8.3 | Boundaries: Natural Earth | Built with D3.js"
- Keep the page minimal: no header navigation, no footer, just the map and its controls.
- Performance: if load-to-interactive exceeds 3 seconds, investigate bottlenecks (file size? rendering? parsing?)
- The `dist/` output should be deployable to any static host (GitHub Pages, Netlify, etc.)

## Dependencies

- Blocked by: all previous tasks (0001-0017)
- Blocks: None (final task)

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
