import type { HdiValues } from '../src/schemas/hdi-values.schema';

type RegionInput = {
  readonly gdlCode: string;
  readonly hdi: number | null;
  readonly educationIndex: number | null;
  readonly healthIndex: number | null;
  readonly incomeIndex: number | null;
  readonly year: number;
};

export const extractHdiValues = (regions: readonly RegionInput[]): HdiValues =>
  regions
    .filter((r) => r.hdi !== null)
    .reduce<HdiValues>((acc, r) => ({
      ...acc,
      [r.gdlCode]: {
        hdi: r.hdi,
        educationIndex: r.educationIndex,
        healthIndex: r.healthIndex,
        incomeIndex: r.incomeIndex,
        year: r.year,
      },
    }), {});
