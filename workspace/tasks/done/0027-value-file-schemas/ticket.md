# Create Zod schemas for per-index value files

**Source**: brutal-plan
**Plan**: `workspace/plans/PLAN-0002-multi-index-toggle.md`
**Phase**: 2 — Index Registry & Value Architecture

## Description

Define Zod schemas for the three per-index value JSON files. These schemas validate data at the trust boundary when value files are fetched at runtime.

```typescript
// hdi-values.schema.ts
HdiValuesSchema = z.record(z.string(), z.object({
  hdi: z.number().min(0).max(1).nullable(),
  educationIndex: z.number().min(0).max(1).nullable(),
  healthIndex: z.number().min(0).max(1).nullable(),
  incomeIndex: z.number().min(0).max(1).nullable(),
  year: z.number().int(),
}));

// whr-values.schema.ts
WhrValuesSchema = z.record(z.string(), z.object({
  score: z.number().min(0).max(10).nullable(),
  gdpPerCapita: z.number().nullable(),
  socialSupport: z.number().nullable(),
  lifeExpectancy: z.number().nullable(),
  freedom: z.number().nullable(),
  generosity: z.number().nullable(),
  corruption: z.number().nullable(),
  year: z.number().int(),
}));

// oecd-bli-values.schema.ts
OecdBliValuesSchema = z.record(z.string(), z.object({
  income: z.number().min(0).max(10).nullable(),
  jobs: z.number().min(0).max(10).nullable(),
  housing: z.number().min(0).max(10).nullable(),
  education: z.number().min(0).max(10).nullable(),
  health: z.number().min(0).max(10).nullable(),
  environment: z.number().min(0).max(10).nullable(),
  safety: z.number().min(0).max(10).nullable(),
  civicEngagement: z.number().min(0).max(10).nullable(),
  accessToServices: z.number().min(0).max(10).nullable(),
  community: z.number().min(0).max(10).nullable(),
  lifeSatisfaction: z.number().min(0).max(10).nullable(),
}));
```

Export derived TypeScript types from each schema.

## Acceptance Criteria

- [ ] Three Zod schemas defined in `src/schemas/`
- [ ] Types derived via `z.infer<>`
- [ ] Mock factory functions for each (`getMockHdiValues`, etc.)
- [ ] Full test coverage validating schema constraints

## Dependencies

- Blocked by: None
- Blocks: 0028, 0030, 0033, 0035
