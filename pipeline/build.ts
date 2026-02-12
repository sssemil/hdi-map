import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, GeoJsonProperties } from 'geojson';
import { geoCentroid } from 'd3-geo';
import { parseShdiCsv } from './parse-shdi';
import type { ShdiRecord } from './parse-shdi';
import type { RegionProperties } from '../src/schemas/region-properties.schema';
import { extractHdiValues } from './extract-hdi-values';
import { extractWhrValues, type WhrExcelRow } from './extract-whr-values';
import { extractOecdValues, type OecdExcelRow } from './extract-oecd-values';
import XLSX from 'xlsx';

const SPIKE_DATA_DIR = 'spike/data';
const CSV_PATH = `${SPIKE_DATA_DIR}/SHDI-v8.3.csv`;
const TOPO_PATH = `${SPIKE_DATA_DIR}/gdl_2pct.topo.json`;
const OUTPUT_DIR = 'public/data';
const OUTPUT_PATH = `${OUTPUT_DIR}/regions.topo.json`;

const log = (message: string): void => {
  console.log(`[pipeline] ${message}`);
};

const LEVEL_FROM_CODE = (gdlCode: string): 'national' | 'subnational' =>
  gdlCode.endsWith('t') ? 'national' : 'subnational';

const run = (): void => {
  log('Starting pipeline build...');

  log('Parsing SHDI CSV...');
  const csvText = readFileSync(CSV_PATH, 'utf-8');
  const records = parseShdiCsv(csvText);
  log(`  Parsed ${records.length} regions from CSV`);

  log('Loading TopoJSON...');
  const topoText = readFileSync(TOPO_PATH, 'utf-8');
  const topology: Topology = JSON.parse(topoText);

  const objectKey = Object.keys(topology.objects)[0];
  const geoCollection = topology.objects[objectKey] as GeometryCollection<GeoJsonProperties>;
  const fc = feature(topology, geoCollection) as FeatureCollection;

  log(`  Found ${fc.features.length} features`);

  const recordsByCode = new Map<string, ShdiRecord>();
  for (const record of records) {
    recordsByCode.set(record.gdlCode, record);
  }

  let matched = 0;
  let geoOnly = 0;

  type RawProps = Record<string, string | undefined>;

  log('Joining data and computing centroids...');
  const enrichedGeometries = (geoCollection as GeometryCollection<RawProps>).geometries.map(
    (geom, i) => {
      const geoFeature = fc.features[i];
      const props = (geom.properties ?? {}) as RawProps;
      const gdlCode: string = props['gdlcode'] ?? props['GDLcode'] ?? '';

      const centroid = geoCentroid(geoFeature.geometry);
      const roundedCentroid: [number, number] = [
        Math.round(centroid[0] * 1000) / 1000,
        Math.round(centroid[1] * 1000) / 1000,
      ];

      const record = recordsByCode.get(gdlCode);

      const properties: RegionProperties = record
        ? {
            gdlCode,
            name: record.name,
            country: record.country,
            countryIso: record.countryIso,
            level: record.level,
            centroid: roundedCentroid,
          }
        : {
            gdlCode,
            name: gdlCode,
            country: '',
            countryIso: props['iso_code'] ?? '',
            level: LEVEL_FROM_CODE(gdlCode),
            centroid: roundedCentroid,
          };

      if (record) {
        matched++;
      } else {
        geoOnly++;
      }

      return { ...geom, properties };
    }
  );

  const csvOnlyCount = records.filter((r) => !enrichedGeometries.some(
    (g) => (g.properties as RegionProperties).gdlCode === r.gdlCode
  )).length;

  const matchRate = matched / enrichedGeometries.length;
  log(`  Matched: ${matched}`);
  log(`  Geo-only: ${geoOnly}`);
  log(`  CSV-only: ${csvOnlyCount}`);
  log(`  Match rate: ${(matchRate * 100).toFixed(1)}%`);

  const outputTopology = {
    type: topology.type,
    arcs: topology.arcs,
    transform: (topology as unknown as Record<string, unknown>)['transform'],
    objects: {
      regions: {
        type: 'GeometryCollection',
        geometries: enrichedGeometries,
      },
    },
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(outputTopology));

  const stats = readFileSync(OUTPUT_PATH);
  log(`  Output: ${OUTPUT_PATH} (${(stats.length / 1024 / 1024).toFixed(1)} MB)`);

  log('Extracting HDI values...');
  const hdiValues = extractHdiValues(records);
  const hdiValuesPath = `${OUTPUT_DIR}/hdi-values.json`;
  writeFileSync(hdiValuesPath, JSON.stringify(hdiValues));
  const hdiStats = readFileSync(hdiValuesPath);
  log(`  Output: ${hdiValuesPath} (${(hdiStats.length / 1024).toFixed(1)} KB, ${Object.keys(hdiValues).length} regions)`);

  log('Building WHR values...');
  try {
    const whrWb = XLSX.readFile(`${SPIKE_DATA_DIR}/whr-2025-figure-2.1.xlsx`);
    const whrWs = whrWb.Sheets[whrWb.SheetNames[0]];
    const whrRows = XLSX.utils.sheet_to_json(whrWs) as WhrExcelRow[];
    const countryToIso: Record<string, string | null> = JSON.parse(
      readFileSync('pipeline/data/whr-country-to-iso.json', 'utf-8')
    );
    const whrValues = extractWhrValues(whrRows, countryToIso);
    const whrPath = `${OUTPUT_DIR}/whr-values.json`;
    writeFileSync(whrPath, JSON.stringify(whrValues));
    const whrStats = readFileSync(whrPath);
    log(`  Output: ${whrPath} (${(whrStats.length / 1024).toFixed(1)} KB, ${Object.keys(whrValues).length} countries)`);
  } catch (e) {
    log(`  WHR build skipped: ${e instanceof Error ? e.message : String(e)}`);
  }

  log('Building OECD BLI values...');
  try {
    const oecdWb = XLSX.readFile(`${SPIKE_DATA_DIR}/OECD-Regional-Well-Being-Data-File.xlsx`);
    const oecdWs = oecdWb.Sheets['Score_Last'];
    const oecdRaw = XLSX.utils.sheet_to_json(oecdWs, { header: 1 }) as unknown[][];
    const oecdRows: OecdExcelRow[] = oecdRaw.slice(8)
      .filter((r) => r[3])
      .map((r) => ({
        country: r[1] as string,
        region: r[2] as string,
        code: r[3] as string,
        income: r[4] as number,
        jobs: r[5] as number,
        housing: r[6] as number,
        education: r[7] as number,
        health: r[8] as number,
        environment: r[9] as number,
        safety: r[10] as number,
        civicEngagement: r[11] as number,
        accessToServices: r[12] as number,
        community: r[13] as number,
        lifeSatisfaction: r[14] as number,
      }));
    const oecdCountryToIso: Record<string, string> = JSON.parse(
      readFileSync('pipeline/data/oecd-country-to-iso.json', 'utf-8')
    );
    const oecdValues = extractOecdValues(oecdRows, oecdCountryToIso);
    const oecdPath = `${OUTPUT_DIR}/oecd-bli-values.json`;
    writeFileSync(oecdPath, JSON.stringify(oecdValues));
    const oecdStats = readFileSync(oecdPath);
    log(`  Output: ${oecdPath} (${(oecdStats.length / 1024).toFixed(1)} KB, ${Object.keys(oecdValues).length} countries)`);
  } catch (e) {
    log(`  OECD build skipped: ${e instanceof Error ? e.message : String(e)}`);
  }

  log('Pipeline build complete!');
};

run();
