import * as d3 from 'd3';
import { geoRobinson } from 'd3-geo-projection';
import type { RegionProperties } from './schemas/region-properties.schema';

type RegionFeature = GeoJSON.Feature<GeoJSON.Geometry, RegionProperties>;

type MapRendererOptions = {
  readonly container: HTMLElement;
  readonly regions: readonly RegionFeature[];
  readonly getColor: (hdi: number | null) => string;
  readonly onRegionHover?: (
    feature: RegionFeature | null,
    event: MouseEvent
  ) => void;
};

export type MapRenderer = {
  readonly render: () => void;
  readonly resize: () => void;
  readonly getSvg: () => SVGSVGElement;
  readonly highlightRegions: (filter: { min: number; max: number } | null) => void;
  readonly highlightSingle: (gdlCode: string | null) => void;
  readonly zoomToRegion: (gdlCode: string) => void;
};

export const createMapRenderer = (options: MapRendererOptions): MapRenderer => {
  const { container, regions, getColor, onRegionHover } = options;

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('display', 'block');

  const g = svg.append('g');

  const projection = geoRobinson();
  const pathGenerator = d3.geoPath().projection(projection);

  const oceanGroup = g.append('g').attr('class', 'ocean-layer');
  const graticuleGroup = g.append('g').attr('class', 'graticule-layer');
  const regionGroup = g.append('g').attr('class', 'region-layer');

  const graticule = d3.geoGraticule();

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 12])
    .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      g.attr('transform', event.transform.toString());
    });

  svg.call(zoom);

  const fitProjection = (): void => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    // D3 accepts { type: 'Sphere' } for fitSize but the type defs don't include it
    projection.fitSize([width, height], { type: 'Sphere' } as unknown as d3.GeoPermissibleObjects);
    pathGenerator.projection(projection);
  };

  const renderOcean = (): void => {
    oceanGroup.selectAll('path').remove();
    oceanGroup
      .append('path')
      .datum({ type: 'Sphere' } as unknown as GeoJSON.GeoJsonObject)
      .attr('d', pathGenerator as unknown as (d: unknown) => string)
      .attr('fill', '#1a1a4e')
      .attr('stroke', 'none');
  };

  const renderGraticule = (): void => {
    graticuleGroup.selectAll('path').remove();
    graticuleGroup
      .append('path')
      .datum(graticule() as unknown as GeoJSON.GeoJsonObject)
      .attr('d', pathGenerator as unknown as (d: unknown) => string)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.08)')
      .attr('stroke-width', 0.5);
  };

  const renderRegions = (): void => {
    regionGroup
      .selectAll<SVGPathElement, RegionFeature>('path')
      .data(regions as RegionFeature[], (d) => d.properties.gdlCode)
      .join('path')
      .attr('d', (d) => pathGenerator(d) ?? '')
      .attr('fill', (d) => getColor(d.properties.hdi))
      .attr('stroke', '#0a0a2e')
      .attr('stroke-width', 0.3)
      .attr('data-gdl-code', (d) => d.properties.gdlCode)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event: MouseEvent, d: RegionFeature) {
        d3.select(this)
          .raise()
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.5);
        onRegionHover?.(d, event);
      })
      .on('mousemove', function (event: MouseEvent, d: RegionFeature) {
        onRegionHover?.(d, event);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .attr('stroke', '#0a0a2e')
          .attr('stroke-width', 0.3);
        onRegionHover?.(null, {} as MouseEvent);
      });
  };

  const render = (): void => {
    fitProjection();
    renderOcean();
    renderGraticule();
    renderRegions();
  };

  const resize = (): void => {
    render();
  };

  const highlightRegions = (
    filter: { min: number; max: number } | null
  ): void => {
    regionGroup
      .selectAll<SVGPathElement, RegionFeature>('path')
      .attr('opacity', (d) => {
        if (filter === null) return 1;
        const hdi = d.properties.hdi;
        if (hdi === null) return 0.15;
        return hdi >= filter.min && hdi < filter.max ? 1 : 0.15;
      });
  };

  const highlightSingle = (gdlCode: string | null): void => {
    regionGroup
      .selectAll<SVGPathElement, RegionFeature>('path')
      .attr('opacity', (d) => {
        if (gdlCode === null) return 1;
        return d.properties.gdlCode === gdlCode ? 1 : 0.3;
      });

    if (gdlCode !== null) {
      regionGroup
        .selectAll<SVGPathElement, RegionFeature>('path')
        .filter((d) => d.properties.gdlCode === gdlCode)
        .raise()
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    }
  };

  const zoomToRegion = (gdlCode: string): void => {
    const feature = regions.find((r) => r.properties.gdlCode === gdlCode);
    if (!feature) return;

    const bounds = pathGenerator.bounds(feature);
    const [[x0, y0], [x1, y1]] = bounds;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scale = Math.min(8, 0.9 / Math.max(dx / width, dy / height));
    const midX = (x0 + x1) / 2;
    const midY = (y0 + y1) / 2;

    const transform = d3.zoomIdentity
      .translate(width / 2 - scale * midX, height / 2 - scale * midY)
      .scale(scale);

    svg
      .transition()
      .duration(750)
      .call(zoom.transform, transform);
  };

  return {
    render,
    resize,
    getSvg: () => svg.node()!,
    highlightRegions,
    highlightSingle,
    zoomToRegion,
  };
};
