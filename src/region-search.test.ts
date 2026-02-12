import { describe, it, expect } from 'vitest';
import { searchRegions, buildSearchIndex, type SearchableRegion } from './region-search';

const buildRegion = (overrides?: Partial<SearchableRegion>): SearchableRegion => ({
  gdlCode: 'FRAr101',
  name: 'Ile-de-France',
  country: 'France',
  ...overrides,
});

const sampleRegions: readonly SearchableRegion[] = [
  buildRegion({ gdlCode: 'FRAr101', name: 'Ile-de-France', country: 'France' }),
  buildRegion({ gdlCode: 'FRAr102', name: 'Provence-Alpes-Côte d\'Azur', country: 'France' }),
  buildRegion({ gdlCode: 'INDr101', name: 'Punjab', country: 'India' }),
  buildRegion({ gdlCode: 'PAKr101', name: 'Punjab', country: 'Pakistan' }),
  buildRegion({ gdlCode: 'GBRr101', name: 'North East England', country: 'United Kingdom' }),
  buildRegion({ gdlCode: 'GBRr102', name: 'London', country: 'United Kingdom' }),
  buildRegion({ gdlCode: 'BRAr101', name: 'São Paulo', country: 'Brasil' }),
  buildRegion({ gdlCode: 'DEUr101', name: 'Bayern', country: 'Germany' }),
  buildRegion({ gdlCode: 'DEUr102', name: 'Berlin', country: 'Germany' }),
  buildRegion({ gdlCode: 'DEUr103', name: 'Brandenburg', country: 'Germany' }),
  buildRegion({ gdlCode: 'DEUr104', name: 'Bremen', country: 'Germany' }),
  buildRegion({ gdlCode: 'DEUr105', name: 'Hamburg', country: 'Germany' }),
];

describe('searchRegions', () => {
  const index = buildSearchIndex(sampleRegions);

  it('should return matching regions by name substring', () => {
    const results = searchRegions({ query: 'Punjab', index });
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.gdlCode)).toContain('INDr101');
    expect(results.map((r) => r.gdlCode)).toContain('PAKr101');
  });

  it('should be case insensitive', () => {
    const results = searchRegions({ query: 'london', index });
    expect(results).toHaveLength(1);
    expect(results[0].gdlCode).toBe('GBRr102');
  });

  it('should be diacritics insensitive', () => {
    const results = searchRegions({ query: 'Sao Paulo', index });
    expect(results).toHaveLength(1);
    expect(results[0].gdlCode).toBe('BRAr101');
  });

  it('should match with diacritics in query against diacritics in name', () => {
    const results = searchRegions({ query: 'São', index });
    expect(results).toHaveLength(1);
  });

  it('should match accented characters in Côte', () => {
    const results = searchRegions({ query: 'Cote', index });
    expect(results).toHaveLength(1);
    expect(results[0].gdlCode).toBe('FRAr102');
  });

  it('should limit results to 10 by default', () => {
    const results = searchRegions({ query: 'r', index });
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it('should accept a custom limit', () => {
    const results = searchRegions({ query: 'r', index, limit: 3 });
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('should format results as "Region, Country"', () => {
    const results = searchRegions({ query: 'Punjab', index });
    const labels = results.map((r) => r.label);
    expect(labels).toContain('Punjab, India');
    expect(labels).toContain('Punjab, Pakistan');
  });

  it('should return empty array for empty query', () => {
    const results = searchRegions({ query: '', index });
    expect(results).toHaveLength(0);
  });

  it('should return empty array for whitespace-only query', () => {
    const results = searchRegions({ query: '   ', index });
    expect(results).toHaveLength(0);
  });

  it('should return empty array when no matches', () => {
    const results = searchRegions({ query: 'xyznonexistent', index });
    expect(results).toHaveLength(0);
  });

  it('should also match country names', () => {
    const results = searchRegions({ query: 'Germany', index });
    expect(results.length).toBeGreaterThanOrEqual(4);
  });
});
