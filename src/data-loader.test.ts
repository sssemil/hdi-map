import { describe, it, expect, vi } from 'vitest';
import { loadMapData } from './data-loader';
import { getMockRegionProperties } from './schemas/region-properties.schema';

const buildMockTopology = () => ({
  type: 'Topology',
  objects: {
    regions: {
      type: 'GeometryCollection',
      geometries: [
        {
          type: 'Polygon',
          arcs: [[0]],
          properties: getMockRegionProperties(),
        },
        {
          type: 'Polygon',
          arcs: [[1]],
          properties: getMockRegionProperties({
            gdlCode: 'INDr101',
            name: 'Kerala',
            country: 'India',
            countryIso: 'IND',
          }),
        },
        {
          type: 'Polygon',
          arcs: [[2]],
          properties: getMockRegionProperties({
            gdlCode: 'CHNr132',
            name: 'CHNr132',
            country: '',
            countryIso: 'CHN',
            level: 'subnational',
            year: 0,
            hdi: null,
            educationIndex: null,
            healthIndex: null,
            incomeIndex: null,
            centroid: [114.134, 22.384],
          }),
        },
        {
          type: 'Polygon',
          arcs: [[3]],
          properties: getMockRegionProperties({
            gdlCode: 'CHNr133',
            name: 'CHNr133',
            country: '',
            countryIso: 'CHN',
            level: 'subnational',
            year: 0,
            hdi: null,
            educationIndex: null,
            healthIndex: null,
            incomeIndex: null,
            centroid: [120.955, 23.748],
          }),
        },
      ],
    },
  },
  arcs: [
    [[0, 0], [9999, 0], [0, 9999], [-9999, 0], [0, -9999]],
    [[100, 100], [9999, 0], [0, 9999], [-9999, 0], [0, -9999]],
    [[200, 200], [9999, 0], [0, 9999], [-9999, 0], [0, -9999]],
    [[300, 300], [9999, 0], [0, 9999], [-9999, 0], [0, -9999]],
  ],
  transform: {
    scale: [0.001, 0.001],
    translate: [0, 0],
  },
});

describe('loadMapData', () => {
  it('should parse valid TopoJSON and return typed features', async () => {
    const mockTopology = buildMockTopology();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTopology),
      })
    );

    const result = await loadMapData('/data/regions.topo.json');

    expect(result.regions).toHaveLength(4);
    expect(result.regions[0].properties.gdlCode).toBe('GBRr101');
    expect(result.regions[1].properties.gdlCode).toBe('INDr101');
    expect(result.regions[0].type).toBe('Feature');

    vi.unstubAllGlobals();
  });

  it('should throw descriptive error on fetch failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })
    );

    await expect(loadMapData('/data/missing.json')).rejects.toThrow(
      /failed to load/i
    );

    vi.unstubAllGlobals();
  });

  it('should throw descriptive error on network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error'))
    );

    await expect(loadMapData('/data/regions.json')).rejects.toThrow(
      /network/i
    );

    vi.unstubAllGlobals();
  });

  it('should throw on invalid topology structure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ type: 'FeatureCollection', features: [] }),
      })
    );

    await expect(loadMapData('/data/bad.json')).rejects.toThrow(
      /invalid/i
    );

    vi.unstubAllGlobals();
  });

  it('should throw when regions object is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ type: 'Topology', objects: {}, arcs: [] }),
      })
    );

    await expect(loadMapData('/data/bad.json')).rejects.toThrow(
      /regions/i
    );

    vi.unstubAllGlobals();
  });

  it('should patch CHNr133 with Taiwan HDI data', async () => {
    const mockTopology = buildMockTopology();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTopology),
      })
    );

    const result = await loadMapData('/data/regions.topo.json');

    const taiwan = result.regions.find((r) => r.properties.gdlCode === 'CHNr133');
    expect(taiwan).toBeDefined();
    expect(taiwan!.properties.name).toBe('Taiwan');
    expect(taiwan!.properties.hdi).toBe(0.926);

    vi.unstubAllGlobals();
  });

  it('should patch CHNr132 with Hong Kong HDI data', async () => {
    const mockTopology = buildMockTopology();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTopology),
      })
    );

    const result = await loadMapData('/data/regions.topo.json');

    const hk = result.regions.find((r) => r.properties.gdlCode === 'CHNr132');
    expect(hk).toBeDefined();
    expect(hk!.properties.name).toBe('Hong Kong');
    expect(hk!.properties.hdi).toBe(0.956);

    vi.unstubAllGlobals();
  });

  it('should validate sample features against schema', async () => {
    const topology = buildMockTopology();
    topology.objects.regions.geometries[0].properties = { gdlCode: 'bad' } as ReturnType<typeof getMockRegionProperties>;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(topology),
      })
    );

    await expect(loadMapData('/data/bad.json')).rejects.toThrow();

    vi.unstubAllGlobals();
  });
});
