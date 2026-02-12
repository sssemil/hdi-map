# Create `value-loader.ts` (fetch + cache value files)

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 2 — Index Registry & Value Architecture

## Description

Create `src/value-loader.ts` that fetches per-index value JSON files and caches them.

```typescript
type ValueLoader = {
  readonly loadValues: (indexId: IndexId) => Promise<IndexValues>;
  readonly getCachedValues: (indexId: IndexId) => IndexValues | null;
};
```

- On first request for an index, fetch the JSON file from the index definition's `dataUrl`
- Validate against the appropriate Zod schema
- Cache the parsed result in a `Map<IndexId, IndexValues>`
- On subsequent requests, return from cache immediately
- Handle fetch errors gracefully (throw typed error for caller to handle)

## Acceptance Criteria

- [ ] `loadValues(indexId)` fetches, validates, and caches value file
- [ ] Second call to `loadValues` for same index returns cached result (no network request)
- [ ] Fetch errors throw a descriptive `ValueLoadError`
- [ ] Schema validation errors throw a descriptive error
- [ ] Full test coverage (mock fetch, test caching, test error handling)

## Implementation Notes

- Use the `IndexDefinition.dataUrl` from the index registry to construct the URL
- The Zod schemas from 0027 provide runtime validation
- The cache is a simple `Map<IndexId, unknown>` — the caller knows the specific type based on `indexId`
- Consider returning a discriminated union `Result<IndexValues, ValueLoadError>` instead of throwing

## Dependencies

- Blocked by: 0026 (index registry), 0027 (value schemas)
- Blocks: 0036
