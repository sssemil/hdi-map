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
      ],
    },
  },
  arcs: [
    [[0, 0], [9999, 0], [0, 9999], [-9999, 0], [0, -9999]],
    [[100, 100], [9999, 0], [0, 9999], [-9999, 0], [0, -9999]],
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

    expect(result.regions).toHaveLength(2);
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
