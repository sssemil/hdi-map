import { z } from 'zod';

const WhrRegionValueSchema = z.object({
  score: z.number().min(0).max(10).nullable(),
  gdpPerCapita: z.number().nullable(),
  socialSupport: z.number().nullable(),
  lifeExpectancy: z.number().nullable(),
  freedom: z.number().nullable(),
  generosity: z.number().nullable(),
  corruption: z.number().nullable(),
  year: z.number().int(),
});

export const WhrValuesSchema = z.record(z.string(), WhrRegionValueSchema);

export type WhrRegionValue = z.infer<typeof WhrRegionValueSchema>;
export type WhrValues = z.infer<typeof WhrValuesSchema>;

export const getMockWhrRegionValue = (overrides?: Partial<WhrRegionValue>): WhrRegionValue =>
  WhrRegionValueSchema.parse({
    score: 6.714,
    gdpPerCapita: 10.534,
    socialSupport: 0.812,
    lifeExpectancy: 65.1,
    freedom: 0.789,
    generosity: 0.112,
    corruption: 0.745,
    year: 2024,
    ...overrides,
  });
