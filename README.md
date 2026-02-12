# Subnational Human Development Index Map

Interactive choropleth world map showing subnational Human Development Index (HDI) data for ~1,800 regions worldwide.

**[Live Demo](https://sssemil.github.io/hdi-map/)**

## Features

- **Subnational granularity** — ~1,800 regions from the Global Data Lab's SHDI v8.3 dataset
- **Robinson projection** — via D3.js with Plasma sequential color palette
- **Interactive tooltips** — hover any region to see HDI, education, health, and income indices
- **Legend filtering** — hover legend bins to highlight regions in that HDI range
- **Region search** — diacritics-insensitive search with keyboard shortcut (`/` or `Ctrl+K`)
- **Zoom and pan** — scroll to zoom, drag to pan, click search results to fly to a region

## Data Sources

- [Global Data Lab SHDI v8.3](https://globaldatalab.org/shdi/) (Subnational HDI, Zenodo DOI 17467221)
- [GDL Shapefiles V6.5](https://globaldatalab.org/shdi/) (subnational boundaries)

## Tech Stack

- TypeScript (strict mode) + D3.js + Vite
- Zod for data contract validation at trust boundaries
- Vitest for testing (92 tests)

## Development

```bash
npm install
npm test          # run tests
npm run typecheck # type checking
npm run dev       # dev server at localhost:5173
npm run build     # production build to dist/
```

### Data Pipeline

The data pipeline joins SHDI CSV data to GDL shapefiles and outputs enriched TopoJSON:

```bash
npm run build:data
```

This requires source files in `spike/data/` (SHDI CSV + simplified TopoJSON). The pre-built output is committed at `public/data/regions.topo.json`.

## License

[MIT](LICENSE)
