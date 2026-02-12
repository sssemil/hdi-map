import { describe, it, expect } from 'vitest';
import { parseShdiCsv } from './parse-shdi';

const HEADER = 'isocode3,country,continent,datasource,year,gdlcode,level,region,sgdi,shdif,shdim,healthindexf,healthindexm,edindexf,edindexm,incindexf,incindexm,shdi,healthindex,edindex,incindex,lifexp,lifexpf,lifexpm,esch,eschf,eschm,msch,mschf,mschm,lgnic,lgnicf,lgnicm,pop';

const buildRow = (overrides?: Partial<Record<string, string>>): string => {
  const defaults: Record<string, string> = {
    isocode3: 'GBR',
    country: 'United Kingdom',
    continent: 'Europe',
    datasource: '',
    year: '2022',
    gdlcode: 'GBRr101',
    level: 'Subnat',
    region: 'North East England',
    sgdi: '',
    shdif: '',
    shdim: '',
    healthindexf: '',
    healthindexm: '',
    edindexf: '',
    edindexm: '',
    incindexf: '',
    incindexm: '',
    shdi: '0.929',
    healthindex: '0.953',
    edindex: '0.887',
    incindex: '0.948',
    lifexp: '80.5',
    lifexpf: '',
    lifexpm: '',
    esch: '',
    eschf: '',
    eschm: '',
    msch: '',
    mschf: '',
    mschm: '',
    lgnic: '',
    lgnicf: '',
    lgnicm: '',
    pop: '2600000',
  };
  const merged = { ...defaults, ...overrides };
  const columns = HEADER.split(',');
  return columns.map((col) => merged[col] ?? '').join(',');
};

const buildCsv = (...rows: string[]): string =>
  [HEADER, ...rows].join('\n');

describe('parseShdiCsv', () => {
  it('should parse a single valid subnational row', () => {
    const csv = buildCsv(buildRow());
    const records = parseShdiCsv(csv);

    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({
      gdlCode: 'GBRr101',
      name: 'North East England',
      country: 'United Kingdom',
      countryIso: 'GBR',
      level: 'subnational',
      year: 2022,
      hdi: 0.929,
      educationIndex: 0.887,
      healthIndex: 0.953,
      incomeIndex: 0.948,
    });
  });

  it('should normalize level "National" to "national"', () => {
    const csv = buildCsv(buildRow({ level: 'National', gdlcode: 'GBRt' }));
    const records = parseShdiCsv(csv);

    expect(records[0].level).toBe('national');
  });

  it('should normalize level "Subnat" to "subnational"', () => {
    const csv = buildCsv(buildRow({ level: 'Subnat' }));
    const records = parseShdiCsv(csv);

    expect(records[0].level).toBe('subnational');
  });

  it('should select the latest year per region when multiple years exist', () => {
    const csv = buildCsv(
      buildRow({ year: '2020', shdi: '0.910' }),
      buildRow({ year: '2022', shdi: '0.929' }),
      buildRow({ year: '2021', shdi: '0.920' })
    );
    const records = parseShdiCsv(csv);

    expect(records).toHaveLength(1);
    expect(records[0].year).toBe(2022);
    expect(records[0].hdi).toBe(0.929);
  });

  it('should handle multiple regions each with their own latest year', () => {
    const csv = buildCsv(
      buildRow({ gdlcode: 'GBRr101', year: '2022', shdi: '0.929' }),
      buildRow({ gdlcode: 'GBRr101', year: '2020', shdi: '0.910' }),
      buildRow({ gdlcode: 'GBRr102', year: '2021', shdi: '0.940' }),
      buildRow({ gdlcode: 'GBRr102', year: '2022', shdi: '0.950' })
    );
    const records = parseShdiCsv(csv);

    expect(records).toHaveLength(2);
    const r101 = records.find((r) => r.gdlCode === 'GBRr101');
    const r102 = records.find((r) => r.gdlCode === 'GBRr102');
    expect(r101?.year).toBe(2022);
    expect(r102?.year).toBe(2022);
  });

  it('should handle missing HDI values as null', () => {
    const csv = buildCsv(
      buildRow({ shdi: '', healthindex: '', edindex: '', incindex: '' })
    );
    const records = parseShdiCsv(csv);

    expect(records[0].hdi).toBeNull();
    expect(records[0].healthIndex).toBeNull();
    expect(records[0].educationIndex).toBeNull();
    expect(records[0].incomeIndex).toBeNull();
  });

  it('should handle region names with commas in quoted fields', () => {
    const row = buildRow();
    const quotedRow = row.replace(
      'North East England',
      '"Gyeonggi-do, Seoul"'
    );
    const csv = buildCsv(quotedRow);
    const records = parseShdiCsv(csv);

    expect(records[0].name).toBe('Gyeonggi-do, Seoul');
  });

  it('should handle non-ASCII characters in region names', () => {
    const csv = buildCsv(
      buildRow({ region: 'São Paulo', country: 'Brasil', isocode3: 'BRA', gdlcode: 'BRAr101' })
    );
    const records = parseShdiCsv(csv);

    expect(records[0].name).toBe('São Paulo');
  });

  it('should return an empty array for CSV with only a header', () => {
    const csv = HEADER;
    const records = parseShdiCsv(csv);

    expect(records).toHaveLength(0);
  });

  it('should include both national and subnational records', () => {
    const csv = buildCsv(
      buildRow({ gdlcode: 'GBRt', level: 'National', region: 'Total' }),
      buildRow({ gdlcode: 'GBRr101', level: 'Subnat', region: 'North East England' })
    );
    const records = parseShdiCsv(csv);

    expect(records).toHaveLength(2);
    const national = records.find((r) => r.level === 'national');
    const subnational = records.find((r) => r.level === 'subnational');
    expect(national).toBeDefined();
    expect(subnational).toBeDefined();
  });
});
