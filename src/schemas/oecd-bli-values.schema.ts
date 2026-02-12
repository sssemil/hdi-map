import { z } from 'zod';

const oecdScore = z.number().min(0).max(10).nullable();

const OecdBliRegionValueSchema = z.object({
  income: oecdScore,
  jobs: oecdScore,
  housing: oecdScore,
  education: oecdScore,
  health: oecdScore,
  environment: oecdScore,
  safety: oecdScore,
  civicEngagement: oecdScore,
  accessToServices: oecdScore,
  community: oecdScore,
  lifeSatisfaction: oecdScore,
});

export const OecdBliValuesSchema = z.record(z.string(), OecdBliRegionValueSchema);

export type OecdBliRegionValue = z.infer<typeof OecdBliRegionValueSchema>;
export type OecdBliValues = z.infer<typeof OecdBliValuesSchema>;

export const getMockOecdBliRegionValue = (overrides?: Partial<OecdBliRegionValue>): OecdBliRegionValue =>
  OecdBliRegionValueSchema.parse({
    income: 8.5,
    jobs: 7.8,
    housing: 6.2,
    education: 7.9,
    health: 8.3,
    environment: 5.1,
    safety: 9.2,
    civicEngagement: 4.3,
    accessToServices: 6.8,
    community: 7.5,
    lifeSatisfaction: 7.0,
    ...overrides,
  });
