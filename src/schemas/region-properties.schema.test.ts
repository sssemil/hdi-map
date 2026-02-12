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

  it('should reject invalid centroid tuple', () => {
    const result = RegionPropertiesSchema.safeParse(
      buildRawRegionProperties({ centroid: [10] })
    );
    expect(result.success).toBe(false);
  });

  it('should strip unknown properties', () => {
    const input = buildRawRegionProperties({ hdi: 0.929, year: 2022 });
    const result = RegionPropertiesSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect('hdi' in result.data).toBe(false);
      expect('year' in result.data).toBe(false);
    }
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
    });
    expect(mock.gdlCode).toBe('INDr101');
    expect(mock.name).toBe('Kerala');
    const result = RegionPropertiesSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it('should throw when overrides produce invalid data', () => {
    expect(() => getMockRegionProperties({ countryIso: 'XX' } as never)).toThrow();
  });
});
