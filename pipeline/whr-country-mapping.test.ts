import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const mapping: Record<string, string | null> = JSON.parse(
  readFileSync('pipeline/data/whr-country-to-iso.json', 'utf-8')
);

describe('WHR country-to-ISO mapping', () => {
  it('should have 168 entries', () => {
    expect(Object.keys(mapping)).toHaveLength(168);
  });

  it('should map standard countries correctly', () => {
    expect(mapping['Afghanistan']).toBe('AFG');
    expect(mapping['Finland']).toBe('FIN');
    expect(mapping['Germany']).toBe('DEU');
    expect(mapping['Japan']).toBe('JPN');
    expect(mapping['United States']).toBe('USA');
    expect(mapping['United Kingdom']).toBe('GBR');
  });

  it('should map Unicode country names', () => {
    expect(mapping['Côte d\u2019Ivoire'] ?? mapping['Côte d\'Ivoire']).toBe('CIV');
    expect(mapping['Türkiye']).toBe('TUR');
  });

  it('should map non-standard country names', () => {
    expect(mapping['DR Congo']).toBe('COD');
    expect(mapping['Congo']).toBe('COG');
    expect(mapping['Republic of Korea']).toBe('KOR');
    expect(mapping['Republic of Moldova']).toBe('MDA');
    expect(mapping['Russian Federation']).toBe('RUS');
    expect(mapping['Lao PDR']).toBe('LAO');
    expect(mapping['Viet Nam']).toBe('VNM');
    expect(mapping['Czechia']).toBe('CZE');
  });

  it('should map special territories', () => {
    expect(mapping['Hong Kong SAR of China']).toBe('HKG');
    expect(mapping['Taiwan Province of China']).toBe('TWN');
    expect(mapping['Kosovo']).toBe('XKO');
    expect(mapping['State of Palestine']).toBe('PSE');
    expect(mapping['Puerto Rico']).toBe('PRI');
  });

  it('should map null for unrecognized entities', () => {
    expect(mapping['North Cyprus']).toBeNull();
    expect(mapping['Somaliland Region']).toBeNull();
  });

  it('should map both Swaziland and Eswatini to SWZ', () => {
    expect(mapping['Swaziland']).toBe('SWZ');
    expect(mapping['Eswatini']).toBe('SWZ');
  });

  it('should have all ISO codes as valid 3-letter strings or null', () => {
    Object.entries(mapping).forEach(([, iso]) => {
      if (iso !== null) {
        expect(iso).toMatch(/^[A-Z]{3}$/);
      }
    });
  });

  it('should have no undefined values', () => {
    Object.values(mapping).forEach((iso) => {
      expect(iso === null || typeof iso === 'string').toBe(true);
    });
  });
});
