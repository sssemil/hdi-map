import { interpolatePlasma } from 'd3-scale-chromatic';

export type Bin = {
  readonly min: number;
  readonly max: number;
  readonly color: string;
  readonly label: string;
};

export type Interpolator = (t: number) => string;

export type ColorScale = {
  readonly bins: readonly Bin[];
  readonly getColor: (hdi: number | null) => string;
};

export const NO_DATA_COLOR = '#555';

export const HDI_BIN_DEFINITIONS: readonly {
  readonly min: number;
  readonly max: number;
  readonly samplePoint: number;
  readonly label: string;
}[] = [
  { min: 0, max: 0.450, samplePoint: 0.0, label: 'Low (< 0.450)' },
  { min: 0.450, max: 0.550, samplePoint: 0.14, label: 'Low (0.450 - 0.549)' },
  { min: 0.550, max: 0.650, samplePoint: 0.28, label: 'Medium (0.550 - 0.649)' },
  { min: 0.650, max: 0.700, samplePoint: 0.42, label: 'Medium (0.650 - 0.699)' },
  { min: 0.700, max: 0.800, samplePoint: 0.57, label: 'High (0.700 - 0.799)' },
  { min: 0.800, max: 0.850, samplePoint: 0.71, label: 'Very High (0.800 - 0.849)' },
  { min: 0.850, max: 0.900, samplePoint: 0.85, label: 'Very High (0.850 - 0.899)' },
  { min: 0.900, max: 1, samplePoint: 1.0, label: 'Very High (0.900+)' },
];

export const createColorScale = (interpolator: Interpolator): ColorScale => {
  const bins: readonly Bin[] = HDI_BIN_DEFINITIONS.map((def) => ({
    min: def.min,
    max: def.max,
    color: interpolator(def.samplePoint),
    label: def.label,
  }));

  const getColorFn = (hdi: number | null): string => {
    if (hdi === null) return NO_DATA_COLOR;

    for (const bin of bins) {
      if (bin === bins[bins.length - 1]) {
        if (hdi >= bin.min && hdi <= bin.max) return bin.color;
      } else {
        if (hdi >= bin.min && hdi < bin.max) return bin.color;
      }
    }

    return NO_DATA_COLOR;
  };

  return { bins, getColor: getColorFn };
};

const defaultScale = createColorScale(interpolatePlasma);

export const HDI_BINS: readonly Bin[] = defaultScale.bins;
export const getColor = defaultScale.getColor;
