# Create `url-state.ts` (parse/update URL hash)

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 2 — Index Registry & Value Architecture

## Description

Create `src/url-state.ts` with pure functions for reading and writing URL hash state.

```typescript
type UrlState = {
  readonly indexId: IndexId;
  readonly dimensionId?: string;
};

export const parseUrlHash = (hash: string): UrlState => { ... };
export const toUrlHash = (state: UrlState): string => { ... };
```

- Parse `#index=whr` → `{ indexId: 'whr' }`
- Parse `#index=oecd-bli&dim=health` → `{ indexId: 'oecd-bli', dimensionId: 'health' }`
- Parse `#` or empty → `{ indexId: 'hdi' }` (default)
- Parse `#index=invalid` → `{ indexId: 'hdi' }` (fallback)
- Validate using Zod schema for the `IndexId` enum and OECD dimension IDs

## Acceptance Criteria

- [ ] `parseUrlHash` correctly parses valid hash strings
- [ ] Invalid/malformed hashes fall back to HDI default
- [ ] `toUrlHash` produces correct hash strings
- [ ] Round-trip: `parseUrlHash(toUrlHash(state))` === `state`
- [ ] Full test coverage for valid, invalid, and edge-case hashes

## Implementation Notes

- Use `URLSearchParams` for parsing (strip leading `#`)
- Zod schema for validation: `z.object({ index: z.enum(['hdi', 'whr', 'oecd-bli']).default('hdi'), dim: z.string().optional() })`
- Pure functions, no DOM access — testable without browser environment
- The `hashchange` event listener wiring happens in task 0041

## Dependencies

- Blocked by: 0026 (needs IndexId type)
- Blocks: 0041
