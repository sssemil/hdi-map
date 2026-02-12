import { describe, it, expect } from 'vitest';
import {
  INDICES,
  DEFAULT_INDEX_ID,
  getIndexById,
  type IndexId,
} from './index-registry';

describe('INDICES', () => {
  it('should have 3 index entries', () => {
    expect(INDICES).toHaveLength(3);
  });

  it('should have unique ids', () => {
    const ids = INDICES.map((i) => i.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('should include hdi, whr, and oecd-bli', () => {
    const ids = INDICES.map((i) => i.id);
    expect(ids).toContain('hdi');
    expect(ids).toContain('whr');
    expect(ids).toContain('oecd-bli');
  });

  it('should have id, label, dataUrl, binDefinitions, legendTitle, and attribution on each entry', () => {
    INDICES.forEach((index) => {
      expect(typeof index.id).toBe('string');
      expect(typeof index.label).toBe('string');
      expect(typeof index.dataUrl).toBe('string');
      expect(Array.isArray(index.binDefinitions)).toBe(true);
      expect(index.binDefinitions.length).toBeGreaterThan(0);
      expect(typeof index.legendTitle).toBe('string');
      expect(typeof index.attribution).toBe('string');
    });
  });
});

describe('HDI index definition', () => {
  it('should have 8 bin definitions covering 0-1', () => {
    const hdi = getIndexById('hdi');
    expect(hdi.binDefinitions).toHaveLength(8);
    expect(hdi.binDefinitions[0].min).toBe(0);
    expect(hdi.binDefinitions[hdi.binDefinitions.length - 1].max).toBe(1);
  });

  it('should have correct label and legend title', () => {
    const hdi = getIndexById('hdi');
    expect(hdi.label).toBe('Human Development Index');
    expect(hdi.legendTitle).toBe('Human Development Index');
  });

  it('should have no dimensions', () => {
    const hdi = getIndexById('hdi');
    expect(hdi.dimensions).toBeUndefined();
  });
});

describe('WHR index definition', () => {
  it('should have 7 bin definitions matching data distribution', () => {
    const whr = getIndexById('whr');
    expect(whr.binDefinitions).toHaveLength(7);
    expect(whr.binDefinitions[0].min).toBe(0);
    expect(whr.binDefinitions[0].max).toBe(3);
    expect(whr.binDefinitions[whr.binDefinitions.length - 1].max).toBe(10);
  });

  it('should have contiguous bins covering full 0-10 range', () => {
    const whr = getIndexById('whr');
    for (let i = 1; i < whr.binDefinitions.length; i++) {
      expect(whr.binDefinitions[i].min).toBe(whr.binDefinitions[i - 1].max);
    }
  });

  it('should have bins matching data distribution (5-7 range concentrated)', () => {
    const whr = getIndexById('whr');
    const labels = whr.binDefinitions.map((b) => b.label);
    expect(labels.some((l) => l.includes('Very Low'))).toBe(true);
    expect(labels.some((l) => l.includes('Very High'))).toBe(true);
  });

  it('should have correct label', () => {
    const whr = getIndexById('whr');
    expect(whr.label).toBe('World Happiness Report');
  });

  it('should have no dimensions', () => {
    const whr = getIndexById('whr');
    expect(whr.dimensions).toBeUndefined();
  });
});

describe('OECD BLI index definition', () => {
  it('should have 7 bin definitions covering 0-10 scale', () => {
    const oecd = getIndexById('oecd-bli');
    expect(oecd.binDefinitions).toHaveLength(7);
    expect(oecd.binDefinitions[0].min).toBe(0);
    expect(oecd.binDefinitions[oecd.binDefinitions.length - 1].max).toBe(10);
  });

  it('should have contiguous bins', () => {
    const oecd = getIndexById('oecd-bli');
    for (let i = 1; i < oecd.binDefinitions.length; i++) {
      expect(oecd.binDefinitions[i].min).toBe(oecd.binDefinitions[i - 1].max);
    }
  });

  it('should have correct label', () => {
    const oecd = getIndexById('oecd-bli');
    expect(oecd.label).toBe('OECD Better Life Index');
  });

  it('should have 12 dimensions (11 indices + weighted average)', () => {
    const oecd = getIndexById('oecd-bli');
    expect(oecd.dimensions).toBeDefined();
    expect(oecd.dimensions!).toHaveLength(12);
  });

  it('should include weighted-average as first dimension', () => {
    const oecd = getIndexById('oecd-bli');
    expect(oecd.dimensions![0].id).toBe('weighted-average');
    expect(oecd.dimensions![0].label).toBe('Weighted Average');
  });

  it('should include all 11 OECD dimensions', () => {
    const oecd = getIndexById('oecd-bli');
    const dimIds = oecd.dimensions!.map((d) => d.id);
    expect(dimIds).toContain('income');
    expect(dimIds).toContain('jobs');
    expect(dimIds).toContain('housing');
    expect(dimIds).toContain('education');
    expect(dimIds).toContain('health');
    expect(dimIds).toContain('environment');
    expect(dimIds).toContain('safety');
    expect(dimIds).toContain('civic-engagement');
    expect(dimIds).toContain('accessibility-to-services');
    expect(dimIds).toContain('community');
    expect(dimIds).toContain('life-satisfaction');
  });
});

describe('DEFAULT_INDEX_ID', () => {
  it('should be hdi', () => {
    expect(DEFAULT_INDEX_ID).toBe('hdi');
  });
});

describe('getIndexById', () => {
  it('should return the correct index for a valid id', () => {
    const hdi = getIndexById('hdi');
    expect(hdi.id).toBe('hdi');
    expect(hdi.label).toBe('Human Development Index');
  });

  it('should return each index by its id', () => {
    INDICES.forEach((index) => {
      const found = getIndexById(index.id);
      expect(found).toBe(index);
    });
  });

  it('should throw for unknown id', () => {
    expect(() => getIndexById('unknown' as IndexId)).toThrow(/unknown index/i);
  });
});
