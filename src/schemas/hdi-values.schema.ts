import { z } from 'zod';

const indexRange = z.number().min(0).max(1).nullable();

const HdiRegionValueSchema = z.object({
  hdi: indexRange,
  educationIndex: indexRange,
  healthIndex: indexRange,
  incomeIndex: indexRange,
  year: z.number().int(),
});

export const HdiValuesSchema = z.record(z.string(), HdiRegionValueSchema);

export type HdiRegionValue = z.infer<typeof HdiRegionValueSchema>;
export type HdiValues = z.infer<typeof HdiValuesSchema>;

export const getMockHdiRegionValue = (overrides?: Partial<HdiRegionValue>): HdiRegionValue =>
  HdiRegionValueSchema.parse({
    hdi: 0.729,
    educationIndex: 0.630,
    healthIndex: 0.837,
    incomeIndex: 0.735,
    year: 2022,
    ...overrides,
  });
