# Create `index-registry.ts` with HDI definition

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 2 — Index Registry & Value Architecture

## Description

Create `src/index-registry.ts` following the `palette-registry.ts` pattern. Define an `IndexDefinition` type and register HDI as the first (and initially only) index.

```typescript
type IndexId = 'hdi' | 'whr' | 'oecd-bli';

type IndexDefinition = {
  readonly id: IndexId;
  readonly label: string;
  readonly dataUrl: string;
  readonly binDefinitions: readonly BinDefinition[];
  readonly legendTitle: string;
  readonly attribution: string;
  readonly dimensions?: readonly DimensionDefinition[];
};

type DimensionDefinition = {
  readonly id: string;
  readonly label: string;
};
```

Export `INDICES`, `DEFAULT_INDEX_ID`, `getIndexById`.

## Acceptance Criteria

- [ ] `IndexDefinition` type exported with all required fields
- [ ] `IndexId` type exported as union literal
- [ ] HDI registered with correct bin definitions, data URL, and attribution
- [ ] WHR and OECD BLI registered with placeholder bin definitions (to be refined in 0043/0045)
- [ ] OECD BLI has 11 `DimensionDefinition` entries + "Weighted Average"
- [ ] `getIndexById` lookup function works
- [ ] Full test coverage

## Implementation Notes

- Follow `palette-registry.ts` pattern exactly: typed IDs, readonly definitions array, lookup function
- WHR `dataUrl`: `${BASE_URL}data/whr-values.json`
- OECD `dataUrl`: `${BASE_URL}data/oecd-bli-values.json`
- HDI `dataUrl`: `${BASE_URL}data/hdi-values.json`
- Placeholder bin definitions for WHR/OECD will be replaced in tasks 0043/0045

## Dependencies

- Blocked by: 0020 (needs `BinDefinition` type)
- Blocks: 0028, 0037
