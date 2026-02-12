export type SearchableRegion = {
  readonly gdlCode: string;
  readonly name: string;
  readonly country: string;
};

export type SearchResult = {
  readonly gdlCode: string;
  readonly label: string;
};

type IndexEntry = {
  readonly gdlCode: string;
  readonly name: string;
  readonly country: string;
  readonly normalizedName: string;
  readonly normalizedCountry: string;
  readonly label: string;
};

export type SearchIndex = readonly IndexEntry[];

const DEFAULT_LIMIT = 10;

const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const buildSearchIndex = (
  regions: readonly SearchableRegion[]
): SearchIndex =>
  regions.map((region) => ({
    gdlCode: region.gdlCode,
    name: region.name,
    country: region.country,
    normalizedName: normalize(region.name),
    normalizedCountry: normalize(region.country),
    label: `${region.name}, ${region.country}`,
  }));

type SearchOptions = {
  readonly query: string;
  readonly index: SearchIndex;
  readonly limit?: number;
};

export const searchRegions = (options: SearchOptions): readonly SearchResult[] => {
  const { query, index, limit = DEFAULT_LIMIT } = options;
  const trimmed = query.trim();

  if (trimmed === '') return [];

  const normalizedQuery = normalize(trimmed);

  const matches = index.filter(
    (entry) =>
      entry.normalizedName.includes(normalizedQuery) ||
      entry.normalizedCountry.includes(normalizedQuery)
  );

  return matches.slice(0, limit).map((entry) => ({
    gdlCode: entry.gdlCode,
    label: entry.label,
  }));
};
