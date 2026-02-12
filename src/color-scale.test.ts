import { describe, it, expect } from 'vitest';
import { interpolatePlasma, interpolateViridis } from 'd3-scale-chromatic';
import { NO_DATA_COLOR, createColorScale, HDI_BIN_DEFINITIONS, type ColorScale } from './color-scale';

const createHdiScale = () =>
  createColorScale({ interpolator: interpolatePlasma, binDefinitions: HDI_BIN_DEFINITIONS });

describe('createColorScale with HDI bins', () => {
  it('should return no-data color for null', () => {
    const scale = createHdiScale();
    expect(scale.getColor(null)).toBe(NO_DATA_COLOR);
  });

  it('should return darkest bin color for very low HDI', () => {
    const scale = createHdiScale();
    expect(scale.getColor(0.2)).toBe(scale.bins[0].color);
  });

  it('should return brightest bin color for very high HDI', () => {
    const scale = createHdiScale();
    expect(scale.getColor(0.95)).toBe(scale.bins[scale.bins.length - 1].color);
  });

  it('should return correct bin for value at 0', () => {
    const scale = createHdiScale();
    expect(scale.getColor(0)).toBe(scale.bins[0].color);
  });

  it('should return correct bin for value at 1', () => {
    const scale = createHdiScale();
    expect(scale.getColor(1)).toBe(scale.bins[scale.bins.length - 1].color);
  });

  it('should place boundary value 0.450 in the second bin', () => {
    const scale = createHdiScale();
    expect(scale.getColor(0.450)).toBe(scale.bins[1].color);
  });

  it('should place value just below 0.450 in the first bin', () => {
    const scale = createHdiScale();
    expect(scale.getColor(0.449)).toBe(scale.bins[0].color);
  });

  it('should return distinct colors for each bin', () => {
    const scale = createHdiScale();
    const testValues = [0.3, 0.5, 0.6, 0.68, 0.75, 0.82, 0.87, 0.95];
    const colors = testValues.map(scale.getColor);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(8);
  });

  it('should return valid CSS color strings', () => {
    const scale = createHdiScale();
    const color = scale.getColor(0.75);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('HDI_BIN_DEFINITIONS', () => {
  it('should have exactly 8 bin definitions', () => {
    expect(HDI_BIN_DEFINITIONS).toHaveLength(8);
  });

  it('should cover the full 0-1 range', () => {
    expect(HDI_BIN_DEFINITIONS[0].min).toBe(0);
    expect(HDI_BIN_DEFINITIONS[HDI_BIN_DEFINITIONS.length - 1].max).toBe(1);
  });

  it('should have contiguous bins with no gaps', () => {
    for (let i = 1; i < HDI_BIN_DEFINITIONS.length; i++) {
      expect(HDI_BIN_DEFINITIONS[i].min).toBe(HDI_BIN_DEFINITIONS[i - 1].max);
    }
  });

  it('should have UNDP classification labels', () => {
    const labels = HDI_BIN_DEFINITIONS.map((def) => def.label);
    expect(labels.some((l) => l.includes('Low'))).toBe(true);
    expect(labels.some((l) => l.includes('Medium'))).toBe(true);
    expect(labels.some((l) => l.includes('High'))).toBe(true);
    expect(labels.some((l) => l.includes('Very High'))).toBe(true);
  });
});

describe('createColorScale bins', () => {
  it('should produce 8 bins with colors from the provided interpolator', () => {
    const scale: ColorScale = createHdiScale();
    expect(scale.bins).toHaveLength(8);
    scale.bins.forEach((bin) => {
      expect(bin.color).toBeTruthy();
      expect(typeof bin.color).toBe('string');
    });
  });

  it('should produce bins with correct boundaries covering 0-1', () => {
    const scale = createHdiScale();
    expect(scale.bins[0].min).toBe(0);
    expect(scale.bins[scale.bins.length - 1].max).toBe(1);
    for (let i = 1; i < scale.bins.length; i++) {
      expect(scale.bins[i].min).toBe(scale.bins[i - 1].max);
    }
  });

  it('should produce bins with UNDP classification labels', () => {
    const scale = createHdiScale();
    const labels = scale.bins.map((b) => b.label);
    expect(labels.some((l) => l.includes('Low'))).toBe(true);
    expect(labels.some((l) => l.includes('Medium'))).toBe(true);
    expect(labels.some((l) => l.includes('High'))).toBe(true);
    expect(labels.some((l) => l.includes('Very High'))).toBe(true);
  });

  it('should map values to correct bin colors via getColor', () => {
    const scale = createHdiScale();
    expect(scale.getColor(0.2)).toBe(scale.bins[0].color);
    expect(scale.getColor(0.95)).toBe(scale.bins[scale.bins.length - 1].color);
  });

  it('should return NO_DATA_COLOR for null via getColor', () => {
    const scale = createHdiScale();
    expect(scale.getColor(null)).toBe(NO_DATA_COLOR);
  });

  it('should produce different colors for different interpolators', () => {
    const plasma = createColorScale({ interpolator: interpolatePlasma, binDefinitions: HDI_BIN_DEFINITIONS });
    const viridis = createColorScale({ interpolator: interpolateViridis, binDefinitions: HDI_BIN_DEFINITIONS });
    const plasmaColors = plasma.bins.map((b) => b.color);
    const viridisColors = viridis.bins.map((b) => b.color);
    expect(plasmaColors).not.toEqual(viridisColors);
  });
});

describe('NO_DATA_COLOR', () => {
  it('should be a gray color', () => {
    expect(NO_DATA_COLOR).toMatch(/^#[0-9a-fA-F]{3,6}$|^rgb/);
  });
});

describe('createColorScale with custom bin definitions', () => {
  it('should use provided bin definitions instead of HDI defaults', () => {
    const customBins = [
      { min: 0, max: 5, samplePoint: 0.0, label: 'Low (0-5)' },
      { min: 5, max: 10, samplePoint: 1.0, label: 'High (5-10)' },
    ] as const;

    const scale = createColorScale({ interpolator: interpolatePlasma, binDefinitions: customBins });

    expect(scale.bins).toHaveLength(2);
    expect(scale.bins[0].min).toBe(0);
    expect(scale.bins[0].max).toBe(5);
    expect(scale.bins[0].label).toBe('Low (0-5)');
    expect(scale.bins[1].min).toBe(5);
    expect(scale.bins[1].max).toBe(10);
    expect(scale.bins[1].label).toBe('High (5-10)');
  });

  it('should map values to correct custom bins', () => {
    const customBins = [
      { min: 0, max: 5, samplePoint: 0.0, label: 'Low' },
      { min: 5, max: 10, samplePoint: 1.0, label: 'High' },
    ] as const;

    const scale = createColorScale({ interpolator: interpolatePlasma, binDefinitions: customBins });

    expect(scale.getColor(3)).toBe(scale.bins[0].color);
    expect(scale.getColor(7)).toBe(scale.bins[1].color);
  });

  it('should return no-data color for values outside custom bin range', () => {
    const customBins = [
      { min: 0, max: 5, samplePoint: 0.0, label: 'Low' },
      { min: 5, max: 10, samplePoint: 1.0, label: 'High' },
    ] as const;

    const scale = createColorScale({ interpolator: interpolatePlasma, binDefinitions: customBins });

    expect(scale.getColor(-1)).toBe(NO_DATA_COLOR);
    expect(scale.getColor(11)).toBe(NO_DATA_COLOR);
  });
});
