import { geoCentroid } from 'd3-geo';

type GeoJsonGeometry = {
  readonly type: string;
  readonly coordinates: readonly unknown[];
};

export const computeCentroid = (
  geometry: GeoJsonGeometry
): [number, number] => {
  const [lon, lat] = geoCentroid(geometry as GeoJSON.Geometry);
  return [
    Math.round(lon * 1000) / 1000,
    Math.round(lat * 1000) / 1000,
  ];
};
