import { describe, it, expect } from 'vitest';
import { classifyHdi } from './hdi-classification';

describe('classifyHdi', () => {
  it('should classify HDI < 0.550 as Low', () => {
    expect(classifyHdi(0.4)).toBe('Low');
    expect(classifyHdi(0.549)).toBe('Low');
  });

  it('should classify HDI 0.550-0.699 as Medium', () => {
    expect(classifyHdi(0.550)).toBe('Medium');
    expect(classifyHdi(0.699)).toBe('Medium');
  });

  it('should classify HDI 0.700-0.799 as High', () => {
    expect(classifyHdi(0.700)).toBe('High');
    expect(classifyHdi(0.799)).toBe('High');
  });

  it('should classify HDI >= 0.800 as Very High', () => {
    expect(classifyHdi(0.800)).toBe('Very High');
    expect(classifyHdi(0.950)).toBe('Very High');
    expect(classifyHdi(1.0)).toBe('Very High');
  });

  it('should classify HDI 0 as Low', () => {
    expect(classifyHdi(0)).toBe('Low');
  });

  it('should return null for null HDI', () => {
    expect(classifyHdi(null)).toBeNull();
  });
});
