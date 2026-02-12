import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, GeoJsonProperties } from 'geojson';
import {
  RegionPropertiesSchema,
  type RegionProperties,
} from './schemas/region-properties.schema';
import { REGION_SUPPLEMENTS } from './region-supplements';

type RegionFeature = GeoJSON.Feature<GeoJSON.Geometry, RegionProperties>;

type LoadResult = {
  readonly regions: readonly RegionFeature[];
};

const SAMPLE_SIZE = 10;

const validateTopologyStructure = (data: unknown): Topology => {
  if (
    typeof data !== 'object' ||
    data === null ||
    (data as Record<string, unknown>)['type'] !== 'Topology'
  ) {
    throw new Error('Invalid map data: expected a TopoJSON Topology');
  }

  const topology = data as Topology;

  if (!topology.objects || !('regions' in topology.objects)) {
    throw new Error('Invalid map data: missing "regions" object in topology');
  }

  return topology;
};

const validateSampleFeatures = (
  features: readonly RegionFeature[]
): void => {
  const sample = features.slice(0, SAMPLE_SIZE);

  for (const f of sample) {
    const result = RegionPropertiesSchema.safeParse(f.properties);
    if (!result.success) {
      throw new Error(
        `Invalid region properties for feature: ${JSON.stringify(result.error.issues)}`
      );
    }
  }
};

export const loadMapData = async (url: string): Promise<LoadResult> => {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Network error: failed to fetch map data');
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load map data: ${response.status} ${response.statusText}`
    );
  }

  const data: unknown = await response.json();
  const topology = validateTopologyStructure(data);

  const regionsObject = topology.objects['regions'] as GeometryCollection<GeoJsonProperties>;
  const featureCollection = feature(topology, regionsObject) as FeatureCollection<GeoJSON.Geometry, RegionProperties>;
  const regions = featureCollection.features as RegionFeature[];

  for (const supplement of REGION_SUPPLEMENTS) {
    const target = regions.find((r) => r.properties.gdlCode === supplement.gdlCode);
    if (target) {
      target.properties = supplement.properties;
    }
  }

  validateSampleFeatures(regions);

  return { regions };
};
