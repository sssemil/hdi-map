import type { RegionProperties } from './schemas/region-properties.schema';
import { classifyHdi } from './hdi-classification';

export type TooltipFormatter = (properties: RegionProperties, source?: string) => string;

const formatTitle = (properties: RegionProperties): string => {
  if (properties.level === 'national' || properties.name === properties.country) {
    return `<div><strong>${properties.name}</strong></div>`;
  }
  return `<div><strong>${properties.name}</strong>, ${properties.country}</div>`;
};

const formatHdiLine = (properties: RegionProperties): string => {
  if (properties.hdi === null) return '<div>No data available</div>';
  const category = classifyHdi(properties.hdi);
  return `<div>HDI: ${properties.hdi.toFixed(3)} (${category})</div>`;
};

const formatSubIndices = (properties: RegionProperties): string => {
  const lines: readonly string[] = [
    properties.educationIndex !== null
      ? `<div>Education: ${properties.educationIndex.toFixed(3)}</div>`
      : '',
    properties.healthIndex !== null
      ? `<div>Health: ${properties.healthIndex.toFixed(3)}</div>`
      : '',
    properties.incomeIndex !== null
      ? `<div>Income: ${properties.incomeIndex.toFixed(3)}</div>`
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

export const formatHdiTooltip: TooltipFormatter = (properties: RegionProperties, source?: string): string => {
  const title = formatTitle(properties);
  const hdiLine = formatHdiLine(properties);
  const subIndices = formatSubIndices(properties);
  const note = formatNationalNote(properties);
  const sourceLine = formatSource(source);

  return [title, hdiLine, subIndices, note, sourceLine].filter(Boolean).join('');
};

export const formatTooltipContent = formatHdiTooltip;
