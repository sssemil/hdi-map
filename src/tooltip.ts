import type { RegionProperties } from './schemas/region-properties.schema';
import type { HdiRegionValue } from './schemas/hdi-values.schema';
import { classifyHdi } from './hdi-classification';

export type TooltipFormatter = (properties: RegionProperties, source?: string) => string;

const formatTitle = (properties: RegionProperties): string => {
  if (properties.level === 'national' || properties.name === properties.country) {
    return `<div><strong>${properties.name}</strong></div>`;
  }
  return `<div><strong>${properties.name}</strong>, ${properties.country}</div>`;
};

const formatHdiLine = (hdi: number | null): string => {
  if (hdi === null) return '<div>No data available</div>';
  const category = classifyHdi(hdi);
  return `<div>HDI: ${hdi.toFixed(3)} (${category})</div>`;
};

const formatSubIndices = (value: HdiRegionValue | undefined): string => {
  if (!value) return '';
  const lines: readonly string[] = [
    value.educationIndex !== null
      ? `<div>Education: ${value.educationIndex.toFixed(3)}</div>`
      : '',
    value.healthIndex !== null
      ? `<div>Health: ${value.healthIndex.toFixed(3)}</div>`
      : '',
    value.incomeIndex !== null
      ? `<div>Income: ${value.incomeIndex.toFixed(3)}</div>`
      : '',
  ].filter(Boolean);

  return lines.join('');
};

const formatNationalNote = (properties: RegionProperties): string => {
  if (properties.level !== 'national') return '';
  return '<div class="tooltip-note">Country-level data</div>';
};

const formatSource = (source?: string): string => {
  if (!source) return '';
  return `<div class="tooltip-source">Source: ${source}</div>`;
};

export type HdiTooltipOptions = {
  readonly properties: RegionProperties;
  readonly hdiValue?: HdiRegionValue;
  readonly source?: string;
};

export const formatHdiTooltip = (options: HdiTooltipOptions): string => {
  const { properties, hdiValue, source } = options;
  const title = formatTitle(properties);
  const hdiLine = formatHdiLine(hdiValue?.hdi ?? null);
  const subIndices = formatSubIndices(hdiValue);
  const note = formatNationalNote(properties);
  const sourceLine = formatSource(source);

  return [title, hdiLine, subIndices, note, sourceLine].filter(Boolean).join('');
};

export const formatTooltipContent: TooltipFormatter = (
  properties: RegionProperties,
  source?: string
): string => formatHdiTooltip({ properties, source });
