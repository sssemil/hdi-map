export type ShdiRecord = {
  readonly gdlCode: string;
  readonly name: string;
  readonly country: string;
  readonly countryIso: string;
  readonly level: 'subnational' | 'national';
  readonly year: number;
  readonly hdi: number | null;
  readonly educationIndex: number | null;
  readonly healthIndex: number | null;
  readonly incomeIndex: number | null;
};

const LEVEL_MAP: Record<string, 'subnational' | 'national'> = {
  Subnat: 'subnational',
  National: 'national',
};

const parseNumericOrNull = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const num = Number(trimmed);
  return Number.isNaN(num) ? null : num;
};

const parseCsvLine = (line: string): readonly string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);

  return fields;
};

const parseCsvRow = (
  headers: readonly string[],
  line: string
): Record<string, string> => {
  const values = parseCsvLine(line);
  const row: Record<string, string> = {};
  headers.forEach((header, i) => {
    row[header] = values[i] ?? '';
  });
  return row;
};

const toShdiRecord = (row: Record<string, string>): ShdiRecord => ({
  gdlCode: row['gdlcode'] ?? '',
  name: row['region'] ?? '',
  country: row['country'] ?? '',
  countryIso: row['isocode3'] ?? '',
  level: LEVEL_MAP[row['level'] ?? ''] ?? 'subnational',
  year: Number(row['year']),
  hdi: parseNumericOrNull(row['shdi'] ?? ''),
  educationIndex: parseNumericOrNull(row['edindex'] ?? ''),
  healthIndex: parseNumericOrNull(row['healthindex'] ?? ''),
  incomeIndex: parseNumericOrNull(row['incindex'] ?? ''),
});

export const parseShdiCsv = (csvText: string): readonly ShdiRecord[] => {
  const lines = csvText.split('\n').filter((line) => line.trim() !== '');

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const allRecords = lines.slice(1).map((line) => toShdiRecord(parseCsvRow(headers, line)));

  const latestByCode = new Map<string, ShdiRecord>();
  for (const record of allRecords) {
    const existing = latestByCode.get(record.gdlCode);
    if (!existing || record.year > existing.year) {
      latestByCode.set(record.gdlCode, record);
    }
  }

  return [...latestByCode.values()];
};
