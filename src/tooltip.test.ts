import { describe, it, expect } from 'vitest';
import { formatTooltipContent, formatHdiTooltip, formatWhrTooltip, formatOecdTooltip, type TooltipFormatter } from './tooltip';
import { getMockRegionProperties } from './schemas/region-properties.schema';
import { getMockHdiRegionValue } from './schemas/hdi-values.schema';
import { getMockWhrRegionValue } from './schemas/whr-values.schema';
import { getMockOecdBliRegionValue } from './schemas/oecd-bli-values.schema';

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

describe('formatWhrTooltip', () => {
  it('should show happiness score with 1 decimal', () => {
    const props = getMockRegionProperties({
      name: 'Finland',
      country: 'Finland',
      level: 'national',
    });
    const whrValue = getMockWhrRegionValue({ score: 7.736 });
    const html = formatWhrTooltip({ properties: props, whrValue });

    expect(html).toContain('Finland');
    expect(html).toContain('Happiness Score: 7.7');
  });

  it('should show sub-factors with 3 decimal places', () => {
    const props = getMockRegionProperties({
      name: 'Finland',
      country: 'Finland',
      level: 'national',
    });
    const whrValue = getMockWhrRegionValue({
      score: 7.736,
      gdpPerCapita: 1.855,
      socialSupport: 1.587,
      lifeExpectancy: 0.695,
      freedom: 0.830,
      generosity: 0.141,
      corruption: 0.519,
    });
    const html = formatWhrTooltip({ properties: props, whrValue });

    expect(html).toContain('GDP per capita: 1.855');
    expect(html).toContain('Social support: 1.587');
    expect(html).toContain('Life expectancy: 0.695');
    expect(html).toContain('Freedom: 0.830');
    expect(html).toContain('Generosity: 0.141');
    expect(html).toContain('Corruption: 0.519');
  });

  it('should show country-level data note', () => {
    const props = getMockRegionProperties({
      name: 'Bavaria',
      country: 'Germany',
      level: 'subnational',
    });
    const whrValue = getMockWhrRegionValue({ score: 6.7 });
    const html = formatWhrTooltip({ properties: props, whrValue });

    expect(html).toContain('Country-level data');
  });

  it('should handle no data', () => {
    const props = getMockRegionProperties({ name: 'Unknown' });
    const html = formatWhrTooltip({ properties: props });

    expect(html).toContain('No data available');
  });

  it('should skip null sub-factors', () => {
    const props = getMockRegionProperties({
      name: 'Test',
      country: 'Test',
      level: 'national',
    });
    const whrValue = getMockWhrRegionValue({
      score: 5.0,
      gdpPerCapita: null,
      socialSupport: null,
      lifeExpectancy: null,
      freedom: null,
      generosity: null,
      corruption: null,
    });
    const html = formatWhrTooltip({ properties: props, whrValue });

    expect(html).toContain('5.0');
    expect(html).not.toContain('GDP per capita');
  });
});

describe('formatOecdTooltip', () => {
  it('should show single dimension score', () => {
    const props = getMockRegionProperties({
      name: 'Bavaria',
      country: 'Germany',
      level: 'subnational',
    });
    const oecdValue = getMockOecdBliRegionValue({ health: 8.3 });
    const html = formatOecdTooltip({
      properties: props,
      oecdValue,
      dimensionLabel: 'Health',
    });

    expect(html).toContain('Bavaria');
    expect(html).toContain('Germany');
    expect(html).toContain('Health: 8.3');
  });

  it('should show weighted average with all 11 dimension values', () => {
    const props = getMockRegionProperties({
      name: 'Bavaria',
      country: 'Germany',
      level: 'subnational',
    });
    const oecdValue = getMockOecdBliRegionValue({
      income: 8.5, jobs: 7.8, housing: 6.2, education: 7.9,
      health: 8.3, environment: 5.1, safety: 9.2, civicEngagement: 4.3,
      accessToServices: 6.8, community: 7.5, lifeSatisfaction: 7.0,
    });
    const html = formatOecdTooltip({
      properties: props,
      oecdValue,
      compositeScore: 7.1,
    });

    expect(html).toContain('Weighted Average: 7.1');
    expect(html).toContain('Income: 8.5');
    expect(html).toContain('Jobs: 7.8');
    expect(html).toContain('Safety: 9.2');
  });

  it('should handle no data', () => {
    const props = getMockRegionProperties({ name: 'Unknown' });
    const html = formatOecdTooltip({ properties: props });

    expect(html).toContain('No data available');
  });

  it('should show country-level note for national regions', () => {
    const props = getMockRegionProperties({
      name: 'Australia',
      country: 'Australia',
      level: 'national',
    });
    const oecdValue = getMockOecdBliRegionValue({ health: 9.0 });
    const html = formatOecdTooltip({
      properties: props,
      oecdValue,
      dimensionLabel: 'Health',
    });

    expect(html).toContain('Country-level data');
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
