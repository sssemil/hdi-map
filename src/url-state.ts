import { z } from 'zod';
import { type IndexId, DEFAULT_INDEX_ID } from './index-registry';

export type UrlState = {
  readonly indexId: IndexId;
  readonly dimensionId?: string;
};

const IndexIdSchema = z.enum(['hdi', 'whr', 'oecd-bli']);

export const parseUrlHash = (hash: string): UrlState => {
  const cleaned = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(cleaned);

  const indexResult = IndexIdSchema.safeParse(params.get('index'));
  const indexId: IndexId = indexResult.success ? indexResult.data : DEFAULT_INDEX_ID;

  const dim = params.get('dim');
  if (indexId === 'oecd-bli' && dim) {
    return { indexId, dimensionId: dim };
  }

  return { indexId };
};

export const toUrlHash = (state: UrlState): string => {
  const params = new URLSearchParams();
  params.set('index', state.indexId);

  if (state.indexId === 'oecd-bli' && state.dimensionId) {
    params.set('dim', state.dimensionId);
  }

  return `#${params.toString()}`;
};
