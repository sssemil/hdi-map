import { HDI_BIN_DEFINITIONS, type BinDefinition } from './color-scale';

export type IndexId = 'hdi' | 'whr' | 'oecd-bli';

export type DimensionDefinition = {
  readonly id: string;
  readonly label: string;
};

export type IndexDefinition = {
  readonly id: IndexId;
  readonly label: string;
  readonly dataUrl: string;
  readonly binDefinitions: readonly BinDefinition[];
  readonly legendTitle: string;
  readonly attribution: string;
  readonly dimensions?: readonly DimensionDefinition[];
};

const WHR_BIN_DEFINITIONS: readonly BinDefinition[] = [
  { min: 0, max: 2, samplePoint: 0.0, label: 'Very Low (< 2.0)' },
  { min: 2, max: 3, samplePoint: 0.14, label: 'Low (2.0 - 2.9)' },
  { min: 3, max: 4, samplePoint: 0.28, label: 'Below Average (3.0 - 3.9)' },
  { min: 4, max: 5, samplePoint: 0.42, label: 'Average (4.0 - 4.9)' },
  { min: 5, max: 6, samplePoint: 0.57, label: 'Above Average (5.0 - 5.9)' },
  { min: 6, max: 7, samplePoint: 0.71, label: 'High (6.0 - 6.9)' },
  { min: 7, max: 8, samplePoint: 0.85, label: 'Very High (7.0 - 7.9)' },
  { min: 8, max: 10, samplePoint: 1.0, label: 'Exceptional (8.0+)' },
];

const OECD_BIN_DEFINITIONS: readonly BinDefinition[] = [
  { min: 0, max: 2, samplePoint: 0.0, label: 'Very Low (< 2.0)' },
  { min: 2, max: 3, samplePoint: 0.14, label: 'Low (2.0 - 2.9)' },
  { min: 3, max: 4, samplePoint: 0.28, label: 'Below Average (3.0 - 3.9)' },
  { min: 4, max: 5, samplePoint: 0.42, label: 'Average (4.0 - 4.9)' },
  { min: 5, max: 6, samplePoint: 0.57, label: 'Above Average (5.0 - 5.9)' },
  { min: 6, max: 7, samplePoint: 0.71, label: 'High (6.0 - 6.9)' },
  { min: 7, max: 8, samplePoint: 0.85, label: 'Very High (7.0 - 7.9)' },
  { min: 8, max: 10, samplePoint: 1.0, label: 'Exceptional (8.0+)' },
];

const OECD_DIMENSIONS: readonly DimensionDefinition[] = [
  { id: 'weighted-average', label: 'Weighted Average' },
  { id: 'income', label: 'Income' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'housing', label: 'Housing' },
  { id: 'education', label: 'Education' },
  { id: 'health', label: 'Health' },
  { id: 'environment', label: 'Environment' },
  { id: 'safety', label: 'Safety' },
  { id: 'civic-engagement', label: 'Civic Engagement' },
  { id: 'accessibility-to-services', label: 'Accessibility to Services' },
  { id: 'community', label: 'Community' },
  { id: 'life-satisfaction', label: 'Life Satisfaction' },
];

export const INDICES: readonly IndexDefinition[] = [
  {
    id: 'hdi',
    label: 'Human Development Index',
    dataUrl: 'data/hdi-values.json',
    binDefinitions: HDI_BIN_DEFINITIONS,
    legendTitle: 'Human Development Index',
    attribution: 'Global Data Lab, Subnational HDI v8.3',
  },
  {
    id: 'whr',
    label: 'World Happiness Report',
    dataUrl: 'data/whr-values.json',
    binDefinitions: WHR_BIN_DEFINITIONS,
    legendTitle: 'World Happiness Report',
    attribution: 'Helliwell et al. (2025), World Happiness Report 2025',
  },
  {
    id: 'oecd-bli',
    label: 'OECD Better Life Index',
    dataUrl: 'data/oecd-bli-values.json',
    binDefinitions: OECD_BIN_DEFINITIONS,
    legendTitle: 'OECD Better Life Index',
    attribution: 'OECD Regional Well-Being, CC BY 4.0',
    dimensions: OECD_DIMENSIONS,
  },
];

export const DEFAULT_INDEX_ID: IndexId = 'hdi';

export const getIndexById = (id: IndexId): IndexDefinition => {
  const index = INDICES.find((i) => i.id === id);
  if (!index) {
    throw new Error(`Unknown index id: ${id}`);
  }
  return index;
};
