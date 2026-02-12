import { z } from 'zod';

const indexRange = z.number().min(0).max(1).nullable();

export const RegionPropertiesSchema = z.object({
  gdlCode: z.string(),
  name: z.string(),
  country: z.string(),
  countryIso: z.string().length(3),
  level: z.enum(['subnational', 'national']),
  year: z.number().int(),
  hdi: indexRange,
  educationIndex: indexRange,
  healthIndex: indexRange,
  incomeIndex: indexRange,
  centroid: z.tuple([z.number(), z.number()]),
});

export type RegionProperties = z.infer<typeof RegionPropertiesSchema>;

const GeometrySchema = z.object({
  type: z.string(),
  arcs: z.unknown(),
  properties: RegionPropertiesSchema,
});

export const TopologySchema = z.object({
  type: z.literal('Topology'),
  objects: z.object({
    regions: z.object({
      type: z.literal('GeometryCollection'),
      geometries: z.array(GeometrySchema).min(1),
    }),
  }),
  arcs: z.array(z.unknown()),
});

export type HdiTopology = z.infer<typeof TopologySchema>;

export const getMockRegionProperties = (
  overrides?: Partial<RegionProperties>
): RegionProperties => {
  const base: RegionProperties = {
    gdlCode: 'GBRr101',
    name: 'North East England',
    country: 'United Kingdom',
    countryIso: 'GBR',
    level: 'subnational',
    year: 2022,
    hdi: 0.929,
    educationIndex: 0.887,
    healthIndex: 0.953,
    incomeIndex: 0.948,
    centroid: [-1.5, 55.0],
  };

  const merged = { ...base, ...overrides };

  return RegionPropertiesSchema.parse(merged);
};
