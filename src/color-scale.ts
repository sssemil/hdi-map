import { interpolatePlasma } from 'd3-scale-chromatic';

export type HdiBin = {
  readonly min: number;
  readonly max: number;
  readonly color: string;
  readonly label: string;
};

export const NO_DATA_COLOR = '#555';

export const HDI_BINS: readonly HdiBin[] = [
  { min: 0, max: 0.450, color: interpolatePlasma(0.0), label: 'Low (< 0.450)' },
  { min: 0.450, max: 0.550, color: interpolatePlasma(0.14), label: 'Low (0.450 - 0.549)' },
  { min: 0.550, max: 0.650, color: interpolatePlasma(0.28), label: 'Medium (0.550 - 0.649)' },
  { min: 0.650, max: 0.700, color: interpolatePlasma(0.42), label: 'Medium (0.650 - 0.699)' },
  { min: 0.700, max: 0.800, color: interpolatePlasma(0.57), label: 'High (0.700 - 0.799)' },
  { min: 0.800, max: 0.850, color: interpolatePlasma(0.71), label: 'Very High (0.800 - 0.849)' },
  { min: 0.850, max: 0.900, color: interpolatePlasma(0.85), label: 'Very High (0.850 - 0.899)' },
  { min: 0.900, max: 1, color: interpolatePlasma(1.0), label: 'Very High (0.900+)' },
];

export const getColor = (hdi: number | null): string => {
  if (hdi === null) return NO_DATA_COLOR;

  for (const bin of HDI_BINS) {
    if (bin === HDI_BINS[HDI_BINS.length - 1]) {
      if (hdi >= bin.min && hdi <= bin.max) return bin.color;
    } else {
      if (hdi >= bin.min && hdi < bin.max) return bin.color;
    }
  }

  return NO_DATA_COLOR;
};
