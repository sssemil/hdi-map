import { describe, it, expect } from 'vitest';
import { PALETTES, DEFAULT_PALETTE_ID, getPaletteById, type PaletteId } from './palette-registry';

describe('PALETTES', () => {
  it('should have 6 palette entries', () => {
    expect(PALETTES).toHaveLength(6);
  });

  it('should have unique ids', () => {
    const ids = PALETTES.map((p) => p.id);
    expect(new Set(ids).size).toBe(6);
  });

  it('should have id, label, and interpolator on each entry', () => {
    PALETTES.forEach((p) => {
      expect(typeof p.id).toBe('string');
      expect(typeof p.label).toBe('string');
      expect(typeof p.interpolator).toBe('function');
    });
  });

  it('should include plasma, viridis, inferno, magma, cividis, turbo', () => {
    const ids = PALETTES.map((p) => p.id);
    expect(ids).toContain('plasma');
    expect(ids).toContain('viridis');
    expect(ids).toContain('inferno');
    expect(ids).toContain('magma');
    expect(ids).toContain('cividis');
    expect(ids).toContain('turbo');
  });
});

describe('DEFAULT_PALETTE_ID', () => {
  it('should be plasma', () => {
    expect(DEFAULT_PALETTE_ID).toBe('plasma');
  });
});

describe('getPaletteById', () => {
  it('should return the correct palette for a valid id', () => {
    const plasma = getPaletteById('plasma' as PaletteId);
    expect(plasma.id).toBe('plasma');
    expect(plasma.label).toBe('Plasma');
  });

  it('should return each palette by its id', () => {
    PALETTES.forEach((p) => {
      const found = getPaletteById(p.id);
      expect(found).toBe(p);
    });
  });
});
