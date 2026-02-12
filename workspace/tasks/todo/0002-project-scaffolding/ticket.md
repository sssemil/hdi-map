# Project Scaffolding: Vite + TypeScript + Vitest

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0001-hdi-choropleth-map.md`
**Phase**: Phase 1

## Description

Initialize the project with Vite, TypeScript strict mode, and Vitest. Install all required dependencies. Create the HTML shell with dark background.

### Steps

1. `npm create vite@latest . -- --template vanilla-ts` (or equivalent)
2. Configure `tsconfig.json` with strict mode (all strict flags enabled per CLAUDE.md)
3. Install dependencies:
   - `d3`, `@types/d3`
   - `d3-geo-projection`
   - `topojson-client`, `@types/topojson-client`
   - `zod`
4. Install dev dependencies:
   - `vitest`
   - Any needed test utilities
5. Configure Vitest in `vite.config.ts`
6. Create `src/` directory structure matching the module decomposition in the plan
7. Create `index.html` with dark background (#0a0a2e or similar navy), viewport meta tag, responsive container
8. Add `<noscript>` fallback
9. Add viewport check: if width < 768px, show "best viewed on desktop" message
10. Verify: `npm run dev` serves the page, `npm test` runs (even with no tests yet), `npm run build` produces static output

## Acceptance Criteria

- [ ] `npm run dev` starts a dev server with hot reload
- [ ] `npm test` runs Vitest successfully (0 tests is fine)
- [ ] `npm run build` produces static files in `dist/`
- [ ] TypeScript strict mode enabled (all flags from CLAUDE.md)
- [ ] All dependencies installed and importable
- [ ] `index.html` renders with dark background
- [ ] Viewport < 768px shows fallback message
- [ ] Directory structure created for all planned modules

## Implementation Notes

- Do NOT use a framework (React, Vue, etc.) — vanilla TypeScript only
- The `src/` structure should include directories/files for: schemas, color-scale, tooltip, region-search, hdi-classification, data-loader, map-renderer, zoom-controller, legend, search-ui, app
- Vite's vanilla-ts template is minimal and correct for this use case
- Ensure `d3-geo-projection` types work — may need manual type declarations if `@types` doesn't exist

## Dependencies

- Blocked by: 0001 (spike confirms SVG approach and simplification parameters)
- Blocks: 0003, 0010, 0011, 0012, 0013, 0014, 0015, 0016, 0017, 0018

## History

- 2026-02-12 Created from brutal-plan PLAN-0001
