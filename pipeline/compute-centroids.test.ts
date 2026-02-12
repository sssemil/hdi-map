import { describe, it, expect } from 'vitest';
import { computeCentroid } from './compute-centroids';

describe('computeCentroid', () => {
  it('should compute centroid of a simple polygon', () => {
    const polygon = {
      type: 'Polygon' as const,
      coordinates: [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]],
    };
    const [lon, lat] = computeCentroid(polygon);
    expect(lon).toBeCloseTo(5, 0);
    expect(lat).toBeCloseTo(5, 0);
  });

  it('should compute centroid of a multipolygon', () => {
    const multiPolygon = {
      type: 'MultiPolygon' as const,
      coordinates: [
        [[[0, 0], [0, 2], [2, 2], [2, 0], [0, 0]]],
        [[[8, 8], [8, 10], [10, 10], [10, 8], [8, 8]]],
      ],
    };
    const [lon, lat] = computeCentroid(multiPolygon);
    expect(lon).toBeCloseTo(5, 0);
    expect(lat).toBeCloseTo(5, 0);
  });

  it('should return a tuple of two numbers', () => {
    const polygon = {
      type: 'Polygon' as const,
      coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
    };
    const result = computeCentroid(polygon);
    expect(result).toHaveLength(2);
    expect(typeof result[0]).toBe('number');
    expect(typeof result[1]).toBe('number');
  });

  it('should handle a polygon at negative coordinates', () => {
    const polygon = {
      type: 'Polygon' as const,
      coordinates: [[[-10, -10], [-10, -5], [-5, -5], [-5, -10], [-10, -10]]],
    };
    const [lon, lat] = computeCentroid(polygon);
    expect(lon).toBeCloseTo(-7.5, 0);
    expect(lat).toBeCloseTo(-7.5, 0);
  });
});
