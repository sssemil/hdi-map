import { describe, it, expect } from 'vitest';
import { formatTooltipContent } from './tooltip';
import { getMockRegionProperties } from './schemas/region-properties.schema';

describe('formatTooltipContent', () => {
  it('should format subnational region with full data', () => {
    const props = getMockRegionProperties({
      name: 'Ile-de-France',
      country: 'France',
      hdi: 0.921,
      educationIndex: 0.89,
      healthIndex: 0.95,
      incomeIndex: 0.91,
      level: 'subnational',
    });
    const html = formatTooltipContent(props);

    expect(html).toContain('Ile-de-France');
    expect(html).toContain('France');
    expect(html).toContain('0.921');
    expect(html).toContain('Very High');
    expect(html).toContain('0.89');
    expect(html).toContain('0.95');
    expect(html).toContain('0.91');
  });

  it('should format national-level fallback with note', () => {
    const props = getMockRegionProperties({
      name: 'North Korea',
      country: 'North Korea',
      hdi: 0.733,
      level: 'national',
      educationIndex: null,
      healthIndex: null,
      incomeIndex: null,
    });
    const html = formatTooltipContent(props);

    expect(html).toContain('North Korea');
    expect(html).toContain('0.733');
    expect(html).toContain('High');
    expect(html).toContain('Country-level data');
  });

  it('should format region with null HDI as no data', () => {
    const props = getMockRegionProperties({
      name: 'Unknown Region',
      hdi: null,
      educationIndex: null,
      healthIndex: null,
      incomeIndex: null,
    });
    const html = formatTooltipContent(props);

    expect(html).toContain('Unknown Region');
    expect(html).toContain('No data');
  });

  it('should not show sub-indices when they are null', () => {
    const props = getMockRegionProperties({
      hdi: 0.733,
      level: 'national',
      educationIndex: null,
      healthIndex: null,
      incomeIndex: null,
    });
    const html = formatTooltipContent(props);

    expect(html).not.toContain('Education');
    expect(html).not.toContain('Health');
    expect(html).not.toContain('Income');
  });

  it('should show sub-indices when they have values', () => {
    const props = getMockRegionProperties({
      hdi: 0.929,
      educationIndex: 0.887,
      healthIndex: 0.953,
      incomeIndex: 0.948,
    });
    const html = formatTooltipContent(props);

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
    const html = formatTooltipContent(props);

    expect(html).toContain('Bavaria');
    expect(html).toContain('Germany');
  });

  it('should not duplicate country name for national regions', () => {
    const props = getMockRegionProperties({
      name: 'Singapore',
      country: 'Singapore',
      level: 'national',
    });
    const html = formatTooltipContent(props);

    const matches = html.match(/Singapore/g);
    expect(matches).toHaveLength(1);
  });

  it('should wrap each content line in a div for block-level layout', () => {
    const props = getMockRegionProperties({
      name: 'Ile-de-France',
      country: 'France',
      hdi: 0.921,
      educationIndex: 0.89,
      healthIndex: 0.95,
      incomeIndex: 0.91,
      level: 'subnational',
    });
    const html = formatTooltipContent(props);

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
      hdi: 0.733,
      level: 'national',
      educationIndex: null,
      healthIndex: null,
      incomeIndex: null,
    });
    const html = formatTooltipContent(props);

    expect(html).toContain('<div class="tooltip-note">Country-level data</div>');
  });

  it('should wrap no-data message in a div', () => {
    const props = getMockRegionProperties({
      name: 'Unknown',
      hdi: null,
      educationIndex: null,
      healthIndex: null,
      incomeIndex: null,
    });
    const html = formatTooltipContent(props);

    expect(html).toContain('<div>No data available</div>');
  });
});
