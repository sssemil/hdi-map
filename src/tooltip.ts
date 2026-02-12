import type { RegionProperties } from './schemas/region-properties.schema';
import { classifyHdi } from './hdi-classification';

const formatTitle = (properties: RegionProperties): string => {
  if (properties.level === 'national' || properties.name === properties.country) {
    return `<strong>${properties.name}</strong>`;
  }
  return `<strong>${properties.name}</strong>, ${properties.country}`;
};

const formatHdiLine = (properties: RegionProperties): string => {
  if (properties.hdi === null) return '<span>No data available</span>';
  const category = classifyHdi(properties.hdi);
  return `<span>HDI: ${properties.hdi.toFixed(3)} (${category})</span>`;
};

const formatSubIndices = (properties: RegionProperties): string => {
  const lines: readonly string[] = [
    properties.educationIndex !== null
      ? `<span>Education: ${properties.educationIndex.toFixed(3)}</span>`
      : '',
    properties.healthIndex !== null
      ? `<span>Health: ${properties.healthIndex.toFixed(3)}</span>`
      : '',
    properties.incomeIndex !== null
      ? `<span>Income: ${properties.incomeIndex.toFixed(3)}</span>`
      : '',
  ].filter(Boolean);

  return lines.join('');
};

const formatNationalNote = (properties: RegionProperties): string => {
  if (properties.level !== 'national') return '';
  return '<span class="tooltip-note">Country-level data</span>';
};

export const formatTooltipContent = (properties: RegionProperties): string => {
  const title = formatTitle(properties);
  const hdiLine = formatHdiLine(properties);
  const subIndices = formatSubIndices(properties);
  const note = formatNationalNote(properties);

  return [title, hdiLine, subIndices, note].filter(Boolean).join('');
};
