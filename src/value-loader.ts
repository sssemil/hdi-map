import { type IndexId, getIndexById } from './index-registry';
import { HdiValuesSchema } from './schemas/hdi-values.schema';
import { WhrValuesSchema } from './schemas/whr-values.schema';
import { OecdBliValuesSchema } from './schemas/oecd-bli-values.schema';

type IndexValues = Record<string, unknown>;

export type ValueLoader = {
  readonly loadValues: (indexId: IndexId) => Promise<IndexValues>;
  readonly getCachedValues: (indexId: IndexId) => IndexValues | null;
};

const SCHEMA_MAP = {
  hdi: HdiValuesSchema,
  whr: WhrValuesSchema,
  'oecd-bli': OecdBliValuesSchema,
} as const;

export const createValueLoader = (): ValueLoader => {
  const cache = new Map<IndexId, IndexValues>();

  const loadValues = async (indexId: IndexId): Promise<IndexValues> => {
    const cached = cache.get(indexId);
    if (cached) return cached;

    const indexDef = getIndexById(indexId);

    let response: Response;
    try {
      response = await fetch(indexDef.dataUrl);
    } catch {
      throw new Error(`Network error: failed to fetch ${indexId} values`);
    }

    if (!response.ok) {
      throw new Error(
        `Failed to load ${indexId} values: ${response.status} ${response.statusText}`
      );
    }

    const data: unknown = await response.json();

    const schema = SCHEMA_MAP[indexId];
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(
        `Validation error: ${indexId} value file is invalid: ${result.error.message}`
      );
    }

    const values = result.data as IndexValues;
    cache.set(indexId, values);
    return values;
  };

  const getCachedValues = (indexId: IndexId): IndexValues | null => {
    return cache.get(indexId) ?? null;
  };

  return { loadValues, getCachedValues };
};
