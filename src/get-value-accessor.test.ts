import { describe, it, expect } from 'vitest';
import { createGetValue } from './get-value-accessor';
import type { HdiValues } from './schemas/hdi-values.schema';
import type { WhrValues } from './schemas/whr-values.schema';
import type { OecdBliValues } from './schemas/oecd-bli-values.schema';
import { getMockHdiRegionValue } from './schemas/hdi-values.schema';
import { getMockWhrRegionValue } from './schemas/whr-values.schema';
import { getMockOecdBliRegionValue } from './schemas/oecd-bli-values.schema';

describe('createGetValue', () => {
  describe('HDI index', () => {
    it('should return hdi value for a matching gdlCode', () => {
      const values: HdiValues = {
        GBRr101: getMockHdiRegionValue({ hdi: 0.929 }),
      };
      const getValue = createGetValue({ indexId: 'hdi', values });

      expect(getValue('GBRr101', 'GBR')).toBe(0.929);
    });

    it('should return null for unknown gdlCode', () => {
      const values: HdiValues = {};
      const getValue = createGetValue({ indexId: 'hdi', values });

      expect(getValue('UNKr101', 'UNK')).toBeNull();
    });
  });

  describe('WHR index', () => {
    it('should return score for a matching countryIso', () => {
      const values: WhrValues = {
        FIN: getMockWhrRegionValue({ score: 7.8 }),
      };
      const getValue = createGetValue({ indexId: 'whr', values });

      expect(getValue('FINr101', 'FIN')).toBe(7.8);
    });

    it('should use countryIso for lookup since WHR is country-level', () => {
      const values: WhrValues = {
        GBR: getMockWhrRegionValue({ score: 6.7 }),
      };
      const getValue = createGetValue({ indexId: 'whr', values });

      expect(getValue('GBRr101', 'GBR')).toBe(6.7);
      expect(getValue('GBRr102', 'GBR')).toBe(6.7);
    });

    it('should return null for unknown countryIso', () => {
      const values: WhrValues = {};
      const getValue = createGetValue({ indexId: 'whr', values });

      expect(getValue('XXXr101', 'XXX')).toBeNull();
    });
  });

  describe('OECD BLI index', () => {
    it('should return weighted average by default', () => {
      const values: OecdBliValues = {
        AUS: getMockOecdBliRegionValue({
          income: 5.0,
          jobs: 8.0,
          housing: 6.0,
          education: 8.0,
          health: 9.0,
          environment: 8.0,
          safety: 9.5,
          civicEngagement: 9.5,
          accessToServices: 6.0,
          community: 8.5,
          lifeSatisfaction: 8.5,
        }),
      };
      const getValue = createGetValue({ indexId: 'oecd-bli', values });

      const result = getValue('AUSr101', 'AUS');
      expect(result).not.toBeNull();
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(10);
    });

    it('should return specific dimension when dimensionId is provided', () => {
      const values: OecdBliValues = {
        AUS: getMockOecdBliRegionValue({ health: 9.0 }),
      };
      const getValue = createGetValue({ indexId: 'oecd-bli', values, dimensionId: 'health' });

      expect(getValue('AUSr101', 'AUS')).toBe(9.0);
    });

    it('should return null for unknown countryIso', () => {
      const values: OecdBliValues = {};
      const getValue = createGetValue({ indexId: 'oecd-bli', values });

      expect(getValue('XXXr101', 'XXX')).toBeNull();
    });

    it('should handle null dimension values', () => {
      const values: OecdBliValues = {
        AUS: getMockOecdBliRegionValue({ health: null }),
      };
      const getValue = createGetValue({ indexId: 'oecd-bli', values, dimensionId: 'health' });

      expect(getValue('AUSr101', 'AUS')).toBeNull();
    });

    it('should skip null values in weighted average calculation', () => {
      const values: OecdBliValues = {
        COL: getMockOecdBliRegionValue({
          income: null,
          jobs: null,
          housing: null,
          education: null,
          health: 4.2,
          environment: 7.2,
          safety: 2.6,
          civicEngagement: 4.2,
          accessToServices: 3.2,
          community: null,
          lifeSatisfaction: null,
        }),
      };
      const getValue = createGetValue({ indexId: 'oecd-bli', values });

      const result = getValue('COLr101', 'COL');
      expect(result).not.toBeNull();
      const expected = (4.2 + 7.2 + 2.6 + 4.2 + 3.2) / 5;
      expect(result).toBeCloseTo(expected, 1);
    });

    it('should return null when all dimension values are null', () => {
      const values: OecdBliValues = {
        XXX: getMockOecdBliRegionValue({
          income: null,
          jobs: null,
          housing: null,
          education: null,
          health: null,
          environment: null,
          safety: null,
          civicEngagement: null,
          accessToServices: null,
          community: null,
          lifeSatisfaction: null,
        }),
      };
      const getValue = createGetValue({ indexId: 'oecd-bli', values });

      expect(getValue('XXXr101', 'XXX')).toBeNull();
    });
  });
});
