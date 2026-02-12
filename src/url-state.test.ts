import { describe, it, expect } from 'vitest';
import { parseUrlHash, toUrlHash } from './url-state';

describe('parseUrlHash', () => {
  it('should parse empty hash to HDI default', () => {
    expect(parseUrlHash('')).toEqual({ indexId: 'hdi' });
  });

  it('should parse bare hash to HDI default', () => {
    expect(parseUrlHash('#')).toEqual({ indexId: 'hdi' });
  });

  it('should parse index=hdi', () => {
    expect(parseUrlHash('#index=hdi')).toEqual({ indexId: 'hdi' });
  });

  it('should parse index=whr', () => {
    expect(parseUrlHash('#index=whr')).toEqual({ indexId: 'whr' });
  });

  it('should parse index=oecd-bli', () => {
    expect(parseUrlHash('#index=oecd-bli')).toEqual({ indexId: 'oecd-bli' });
  });

  it('should parse oecd-bli with dimension', () => {
    expect(parseUrlHash('#index=oecd-bli&dim=health')).toEqual({
      indexId: 'oecd-bli',
      dimensionId: 'health',
    });
  });

  it('should ignore dimension for non-oecd index', () => {
    expect(parseUrlHash('#index=hdi&dim=health')).toEqual({ indexId: 'hdi' });
  });

  it('should fall back to HDI for invalid index', () => {
    expect(parseUrlHash('#index=invalid')).toEqual({ indexId: 'hdi' });
  });

  it('should fall back to HDI for malformed hash', () => {
    expect(parseUrlHash('#garbage')).toEqual({ indexId: 'hdi' });
  });

  it('should handle dimension without index', () => {
    expect(parseUrlHash('#dim=health')).toEqual({ indexId: 'hdi' });
  });
});

describe('toUrlHash', () => {
  it('should produce hash for HDI', () => {
    expect(toUrlHash({ indexId: 'hdi' })).toBe('#index=hdi');
  });

  it('should produce hash for WHR', () => {
    expect(toUrlHash({ indexId: 'whr' })).toBe('#index=whr');
  });

  it('should produce hash for OECD BLI without dimension', () => {
    expect(toUrlHash({ indexId: 'oecd-bli' })).toBe('#index=oecd-bli');
  });

  it('should produce hash for OECD BLI with dimension', () => {
    expect(toUrlHash({ indexId: 'oecd-bli', dimensionId: 'health' })).toBe(
      '#index=oecd-bli&dim=health'
    );
  });

  it('should omit dimension for non-oecd index even if provided', () => {
    expect(toUrlHash({ indexId: 'hdi', dimensionId: 'health' })).toBe('#index=hdi');
  });
});

describe('round-trip', () => {
  it('should preserve hdi state', () => {
    const state = { indexId: 'hdi' as const };
    expect(parseUrlHash(toUrlHash(state))).toEqual(state);
  });

  it('should preserve whr state', () => {
    const state = { indexId: 'whr' as const };
    expect(parseUrlHash(toUrlHash(state))).toEqual(state);
  });

  it('should preserve oecd-bli with dimension', () => {
    const state = { indexId: 'oecd-bli' as const, dimensionId: 'income' };
    expect(parseUrlHash(toUrlHash(state))).toEqual(state);
  });

  it('should preserve oecd-bli without dimension', () => {
    const state = { indexId: 'oecd-bli' as const };
    expect(parseUrlHash(toUrlHash(state))).toEqual(state);
  });
});
