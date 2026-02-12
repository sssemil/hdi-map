import { describe, it, expect } from 'vitest';
import { interpolatePlasma, interpolateViridis } from 'd3-scale-chromatic';
import { getColor, HDI_BINS, NO_DATA_COLOR, createColorScale, type ColorScale } from './color-scale';

describe('getColor', () => {
  it('should return no-data color for null HDI', () => {
    expect(getColor(null)).toBe(NO_DATA_COLOR);
  });

  it('should return darkest bin color for very low HDI', () => {
    expect(getColor(0.2)).toBe(HDI_BINS[0].color);
  });

  it('should return brightest bin color for very high HDI', () => {
    expect(getColor(0.95)).toBe(HDI_BINS[HDI_BINS.length - 1].color);
  });

  it('should return correct bin for HDI at 0', () => {
    expect(getColor(0)).toBe(HDI_BINS[0].color);
  });

  it('should return correct bin for HDI at 1', () => {
    expect(getColor(1)).toBe(HDI_BINS[HDI_BINS.length - 1].color);
  });

  it('should place boundary value 0.450 in the second bin', () => {
    expect(getColor(0.450)).toBe(HDI_BINS[1].color);
  });

  it('should place value just below 0.450 in the first bin', () => {
    expect(getColor(0.449)).toBe(HDI_BINS[0].color);
  });

  it('should return distinct colors for each bin', () => {
    const testValues = [0.3, 0.5, 0.6, 0.68, 0.75, 0.82, 0.87, 0.95];
    const colors = testValues.map(getColor);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(8);
  });

  it('should return valid CSS color strings', () => {
    const color = getColor(0.75);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('HDI_BINS', () => {
  it('should have exactly 8 bins', () => {
    expect(HDI_BINS).toHaveLength(8);
  });

  it('should have bins that cover the full 0-1 range', () => {
    expect(HDI_BINS[0].min).toBe(0);
    expect(HDI_BINS[HDI_BINS.length - 1].max).toBe(1);
  });

  it('should have contiguous bins with no gaps', () => {
    for (let i = 1; i < HDI_BINS.length; i++) {
      expect(HDI_BINS[i].min).toBe(HDI_BINS[i - 1].max);
    }
  });

  it('should have UNDP classification labels', () => {
    const labels = HDI_BINS.map((bin) => bin.label);
    expect(labels.some((l) => l.includes('Low'))).toBe(true);
    expect(labels.some((l) => l.includes('Medium'))).toBe(true);
    expect(labels.some((l) => l.includes('High'))).toBe(true);
    expect(labels.some((l) => l.includes('Very High'))).toBe(true);
  });

  it('should have non-empty color values', () => {
    HDI_BINS.forEach((bin) => {
      expect(bin.color).toBeTruthy();
      expect(typeof bin.color).toBe('string');
    });
  });
});

describe('NO_DATA_COLOR', () => {
  it('should be a gray color', () => {
    expect(NO_DATA_COLOR).toMatch(/^#[0-9a-fA-F]{3,6}$|^rgb/);
  });
});

describe('createColorScale', () => {
  it('should produce 8 bins with colors from the provided interpolator', () => {
    const scale: ColorScale = createColorScale(interpolatePlasma);
    expect(scale.bins).toHaveLength(8);
    scale.bins.forEach((bin) => {
      expect(bin.color).toBeTruthy();
      expect(typeof bin.color).toBe('string');
    });
  });

  it('should produce bins with correct HDI boundaries covering 0-1', () => {
    const scale = createColorScale(interpolatePlasma);
    expect(scale.bins[0].min).toBe(0);
    expect(scale.bins[scale.bins.length - 1].max).toBe(1);
    for (let i = 1; i < scale.bins.length; i++) {
      expect(scale.bins[i].min).toBe(scale.bins[i - 1].max);
    }
  });

  it('should produce bins with UNDP classification labels', () => {
    const scale = createColorScale(interpolatePlasma);
    const labels = scale.bins.map((b) => b.label);
    expect(labels.some((l) => l.includes('Low'))).toBe(true);
    expect(labels.some((l) => l.includes('Medium'))).toBe(true);
    expect(labels.some((l) => l.includes('High'))).toBe(true);
    expect(labels.some((l) => l.includes('Very High'))).toBe(true);
  });

  it('should map HDI values to correct bin colors via getColor', () => {
    const scale = createColorScale(interpolatePlasma);
    expect(scale.getColor(0.2)).toBe(scale.bins[0].color);
    expect(scale.getColor(0.95)).toBe(scale.bins[scale.bins.length - 1].color);
  });

  it('should return NO_DATA_COLOR for null via getColor', () => {
    const scale = createColorScale(interpolatePlasma);
    expect(scale.getColor(null)).toBe(NO_DATA_COLOR);
  });

  it('should produce different colors for different interpolators', () => {
    const plasma = createColorScale(interpolatePlasma);
    const viridis = createColorScale(interpolateViridis);
    const plasmaColors = plasma.bins.map((b) => b.color);
    const viridisColors = viridis.bins.map((b) => b.color);
    expect(plasmaColors).not.toEqual(viridisColors);
  });
});
