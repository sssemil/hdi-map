import { describe, it, expect } from 'vitest';
import {
  RegionPropertiesSchema,
  TopologySchema,
  getMockRegionProperties,
} from './region-properties.schema';

const buildRawRegionProperties = (
  overrides?: Record<string, unknown>
): Record<string, unknown> => ({
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
  ...overrides,
});

describe('RegionPropertiesSchema', () => {
  it('should accept a valid subnational region', () => {
    const result = RegionPropertiesSchema.safeParse(buildRawRegionProperties());
    expect(result.success).toBe(true);
  });

  it('should accept a valid national-level region', () => {
    const result = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ gdlCode: 'SGPt', level: 'national' })
    );
    expect(result.success).toBe(true);
  });

  it('should accept null hdi and sub-indices for regions without data', () => {
    const result = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({
        hdi: null,
        educationIndex: null,
        healthIndex: null,
        incomeIndex: null,
      })
    );
    expect(result.success).toBe(true);
  });

  it('should reject hdi values below 0', () => {
    const result = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ hdi: -0.1 })
    );
    expect(result.success).toBe(false);
  });

  it('should reject hdi values above 1', () => {
    const result = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ hdi: 1.1 })
    );
    expect(result.success).toBe(false);
  });

  it('should accept hdi boundary values 0 and 1', () => {
    const atZero = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ hdi: 0 })
    );
    const atOne = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ hdi: 1 })
    );
    expect(atZero.success).toBe(true);
    expect(atOne.success).toBe(true);
  });

  it('should reject invalid level values', () => {
    const result = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ level: 'invalid' })
    );
    expect(result.success).toBe(false);
  });

  it('should reject countryIso that is not exactly 3 characters', () => {
    const tooShort = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ countryIso: 'US' })
    );
    const tooLong = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ countryIso: 'USAA' })
    );
    expect(tooShort.success).toBe(false);
    expect(tooLong.success).toBe(false);
  });

  it('should reject non-integer year', () => {
    const result = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ year: 2022.5 })
    );
    expect(result.success).toBe(false);
  });

  it('should reject invalid centroid tuple', () => {
    const result = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ centroid: [10] })
    );
    expect(result.success).toBe(false);
  });

  it('should reject education index outside 0-1 range', () => {
    const belowZero = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ educationIndex: -0.5 })
    );
    const aboveOne = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ educationIndex: 1.5 })
    );
    expect(belowZero.success).toBe(false);
    expect(aboveOne.success).toBe(false);
  });

  it('should reject health index outside 0-1 range', () => {
    const result = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ healthIndex: 2.0 })
    );
    expect(result.success).toBe(false);
  });

  it('should reject income index outside 0-1 range', () => {
    const result = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ incomeIndex: -1 })
    );
    expect(result.success).toBe(false);
  });
});

describe('TopologySchema', () => {
  const getMockTopology = () => ({
    type: 'Topology' as const,
    objects: {
      regions: {
        type: 'GeometryCollection' as const,
        geometries: [
          {
            type: 'Polygon' as const,
            arcs: [[0]],
            properties: getMockRegionProperties(),
          },
        ],
      },
    },
    arcs: [[[0, 0], [1, 1]]],
  });

  it('should accept a valid topology', () => {
    const result = TopologySchema.safeParse(getMockTopology());
    expect(result.success).toBe(true);
  });

  it('should reject topology with wrong type', () => {
    const invalid = { ...getMockTopology(), type: 'FeatureCollection' };
    const result = TopologySchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject topology without regions object', () => {
    const invalid = {
      ...getMockTopology(),
      objects: { other: getMockTopology().objects.regions },
    };
    const result = TopologySchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject topology with empty geometries', () => {
    const topology = getMockTopology();
    const invalid = {
      ...topology,
      objects: {
        regions: {
          ...topology.objects.regions,
          geometries: [],
        },
      },
    };
    const result = TopologySchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should validate feature properties within topology', () => {
    const topology = getMockTopology();
    const invalid = {
      ...topology,
      objects: {
        regions: {
          ...topology.objects.regions,
          geometries: [
            {
              type: 'Polygon' as const,
              arcs: [[0]],
              properties: { gdlCode: 'test' },
            },
          ],
        },
      },
    };
    const result = TopologySchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('getMockRegionProperties', () => {
  it('should return valid data without overrides', () => {
    const mock = getMockRegionProperties();
    const result = RegionPropertiesSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it('should apply overrides while remaining valid', () => {
    const mock = getMockRegionProperties({
      gdlCode: 'INDr101',
      name: 'Kerala',
      country: 'India',
      countryIso: 'IND',
      hdi: 0.782,
    });
    expect(mock.gdlCode).toBe('INDr101');
    expect(mock.name).toBe('Kerala');
    const result = RegionPropertiesSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it('should throw when overrides produce invalid data', () => {
    expect(() => getMockRegionProperties({ hdi: -1 })).toThrow();
  });
});
