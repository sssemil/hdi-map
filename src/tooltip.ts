import type { RegionProperties } from './schemas/region-properties.schema';
import type { HdiRegionValue } from './schemas/hdi-values.schema';
import type { WhrRegionValue } from './schemas/whr-values.schema';
import type { OecdBliRegionValue } from './schemas/oecd-bli-values.schema';
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

export type WhrTooltipOptions = {
  readonly properties: RegionProperties;
  readonly whrValue?: WhrRegionValue;
  readonly source?: string;
};

const WHR_SUBFACTORS: readonly { key: keyof WhrRegionValue; label: string }[] = [
  { key: 'gdpPerCapita', label: 'GDP per capita' },
  { key: 'socialSupport', label: 'Social support' },
  { key: 'lifeExpectancy', label: 'Life expectancy' },
  { key: 'freedom', label: 'Freedom' },
  { key: 'generosity', label: 'Generosity' },
  { key: 'corruption', label: 'Corruption' },
];

export const formatWhrTooltip = (options: WhrTooltipOptions): string => {
  const { properties, whrValue, source } = options;
  const title = formatTitle(properties);

  if (!whrValue || whrValue.score === null) {
    return [title, '<div>No data available</div>'].join('');
  }

  const scoreLine = `<div>Happiness Score: ${whrValue.score.toFixed(1)}</div>`;

  const subFactors = WHR_SUBFACTORS
    .filter(({ key }) => whrValue[key] !== null)
    .map(({ key, label }) => `<div>${label}: ${(whrValue[key] as number).toFixed(3)}</div>`)
    .join('');

  const note = '<div class="tooltip-note">Country-level data</div>';
  const sourceLine = formatSource(source);

  return [title, scoreLine, subFactors, note, sourceLine].filter(Boolean).join('');
};

export type OecdTooltipOptions = {
  readonly properties: RegionProperties;
  readonly oecdValue?: OecdBliRegionValue;
  readonly dimensionLabel?: string;
  readonly compositeScore?: number;
  readonly source?: string;
};

const OECD_DIMENSION_LABELS: readonly { key: keyof OecdBliRegionValue; label: string }[] = [
  { key: 'income', label: 'Income' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'housing', label: 'Housing' },
  { key: 'education', label: 'Education' },
  { key: 'health', label: 'Health' },
  { key: 'environment', label: 'Environment' },
  { key: 'safety', label: 'Safety' },
  { key: 'civicEngagement', label: 'Civic Engagement' },
  { key: 'accessToServices', label: 'Access to Services' },
  { key: 'community', label: 'Community' },
  { key: 'lifeSatisfaction', label: 'Life Satisfaction' },
];

export const formatOecdTooltip = (options: OecdTooltipOptions): string => {
  const { properties, oecdValue, dimensionLabel, compositeScore, source } = options;
  const title = formatTitle(properties);

  if (!oecdValue) {
    return [title, '<div>No data available</div>'].join('');
  }

  const parts = [title];

  if (dimensionLabel) {
    const key = OECD_DIMENSION_LABELS.find((d) => d.label === dimensionLabel)?.key;
    const value = key ? oecdValue[key] : null;
    parts.push(
      value !== null
        ? `<div>${dimensionLabel}: ${(value as number).toFixed(1)}</div>`
        : '<div>No data available</div>'
    );
  } else if (compositeScore !== undefined) {
    parts.push(`<div>Weighted Average: ${compositeScore.toFixed(1)}</div>`);
    const dimLines = OECD_DIMENSION_LABELS
      .filter(({ key }) => oecdValue[key] !== null)
      .map(({ key, label }) => `<div>${label}: ${(oecdValue[key] as number).toFixed(1)}</div>`)
      .join('');
    parts.push(dimLines);
  }

  parts.push(formatNationalNote(properties));
  parts.push(formatSource(source));

  return parts.filter(Boolean).join('');
};

export const formatTooltipContent: TooltipFormatter = (
  properties: RegionProperties,
  source?: string
): string => formatHdiTooltip({ properties, source });
