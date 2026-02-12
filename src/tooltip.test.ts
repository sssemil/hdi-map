import { describe, it, expect } from 'vitest';
import { formatTooltipContent, formatHdiTooltip, type TooltipFormatter } from './tooltip';
import { getMockRegionProperties } from './schemas/region-properties.schema';
import { getMockHdiRegionValue } from './schemas/hdi-values.schema';

describe('formatHdiTooltip', () => {
  it('should format subnational region with full HDI data', () => {
    const props = getMockRegionProperties({
      name: 'Ile-de-France',
      country: 'France',
      level: 'subnational',
    });
    const hdiValue = getMockHdiRegionValue({
      hdi: 0.921,
      educationIndex: 0.89,
      healthIndex: 0.95,
      incomeIndex: 0.91,
    });
    const html = formatHdiTooltip({ properties: props, hdiValue });

    expect(html).toContain('Ile-de-France');
    expect(html).toContain('France');
    expect(html).toContain('0.921');
    expect(html).toContain('Very High');
    expect(html).toContain('0.890');
    expect(html).toContain('0.950');
    expect(html).toContain('0.910');
  });

  it('should format national-level fallback with note', () => {
    const props = getMockRegionProperties({
      name: 'North Korea',
      country: 'North Korea',
      level: 'national',
    });
    const hdiValue = getMockHdiRegionValue({
      hdi: 0.733,
      educationIndex: null,
      healthIndex: null,
      incomeIndex: null,
    });
    const html = formatHdiTooltip({ properties: props, hdiValue });

    expect(html).toContain('North Korea');
    expect(html).toContain('0.733');
    expect(html).toContain('High');
    expect(html).toContain('Country-level data');
  });

  it('should format region with no HDI value as no data', () => {
    const props = getMockRegionProperties({
      name: 'Unknown Region',
    });
    const html = formatHdiTooltip({ properties: props });

    expect(html).toContain('Unknown Region');
    expect(html).toContain('No data');
  });

  it('should not show sub-indices when they are null', () => {
    const props = getMockRegionProperties({ level: 'national' });
    const hdiValue = getMockHdiRegionValue({
      hdi: 0.733,
      educationIndex: null,
      healthIndex: null,
      incomeIndex: null,
    });
    const html = formatHdiTooltip({ properties: props, hdiValue });

    expect(html).not.toContain('Education');
    expect(html).not.toContain('Health');
    expect(html).not.toContain('Income');
  });

  it('should show sub-indices when they have values', () => {
    const props = getMockRegionProperties();
    const hdiValue = getMockHdiRegionValue({
      hdi: 0.929,
      educationIndex: 0.887,
      healthIndex: 0.953,
      incomeIndex: 0.948,
    });
    const html = formatHdiTooltip({ properties: props, hdiValue });

    expect(html).toContain('Education');
    expect(html).toContain('Health');
    expect(html).toContain('Income');
  });

  it('should include country name for subnational regions', () => {
    const props = getMockRegionProperties({
      name: 'Bavaria',
      country: 'Germany',
      level: 'subnational',
    });
    const html = formatHdiTooltip({ properties: props });

    expect(html).toContain('Bavaria');
    expect(html).toContain('Germany');
  });

  it('should not duplicate country name for national regions', () => {
    const props = getMockRegionProperties({
      name: 'Singapore',
      country: 'Singapore',
      level: 'national',
    });
    const html = formatHdiTooltip({ properties: props });

    const matches = html.match(/Singapore/g);
    expect(matches).toHaveLength(1);
  });

  it('should wrap each content line in a div for block-level layout', () => {
    const props = getMockRegionProperties({
      name: 'Ile-de-France',
      country: 'France',
      level: 'subnational',
    });
    const hdiValue = getMockHdiRegionValue({
      hdi: 0.921,
      educationIndex: 0.89,
      healthIndex: 0.95,
      incomeIndex: 0.91,
    });
    const html = formatHdiTooltip({ properties: props, hdiValue });

    expect(html).toContain('<div><strong>Ile-de-France</strong>, France</div>');
    expect(html).toContain('<div>HDI: 0.921 (Very High)</div>');
    expect(html).toContain('<div>Education: 0.890</div>');
    expect(html).toContain('<div>Health: 0.950</div>');
    expect(html).toContain('<div>Income: 0.910</div>');
  });

  it('should wrap national note in a div', () => {
    const props = getMockRegionProperties({
      name: 'North Korea',
      country: 'North Korea',
      level: 'national',
    });
    const hdiValue = getMockHdiRegionValue({
      hdi: 0.733,
      educationIndex: null,
      healthIndex: null,
      incomeIndex: null,
    });
    const html = formatHdiTooltip({ properties: props, hdiValue });

    expect(html).toContain('<div class="tooltip-note">Country-level data</div>');
  });

  it('should wrap no-data message in a div', () => {
    const props = getMockRegionProperties({ name: 'Unknown' });
    const html = formatHdiTooltip({ properties: props });

    expect(html).toContain('<div>No data available</div>');
  });

  it('should show source attribution when provided', () => {
    const props = getMockRegionProperties({
      name: 'Taiwan',
      country: 'Taiwan',
      level: 'national',
    });
    const hdiValue = getMockHdiRegionValue({ hdi: 0.926 });
    const html = formatHdiTooltip({ properties: props, hdiValue, source: 'DGBAS (Taiwan)' });

    expect(html).toContain('Source: DGBAS (Taiwan)');
  });

  it('should show GDL source for standard regions', () => {
    const props = getMockRegionProperties({
      name: 'Bavaria',
      country: 'Germany',
      level: 'subnational',
    });
    const html = formatHdiTooltip({ properties: props, source: 'GDL SHDI v8.3' });

    expect(html).toContain('Source: GDL SHDI v8.3');
  });

  it('should not show source line when source is not provided', () => {
    const props = getMockRegionProperties();
    const html = formatHdiTooltip({ properties: props });

    expect(html).not.toContain('Source:');
  });
});

describe('formatTooltipContent', () => {
  it('should satisfy the TooltipFormatter type', () => {
    const formatter: TooltipFormatter = formatTooltipContent;
    expect(typeof formatter).toBe('function');
  });

  it('should show no data when called without HDI values', () => {
    const props = getMockRegionProperties({ name: 'Test Region' });
    const html = formatTooltipContent(props);

    expect(html).toContain('Test Region');
    expect(html).toContain('No data available');
  });

  it('should include source when provided', () => {
    const props = getMockRegionProperties();
    const html = formatTooltipContent(props, 'GDL SHDI v8.3');

    expect(html).toContain('Source: GDL SHDI v8.3');
  });
});
