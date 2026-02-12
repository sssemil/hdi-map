import * as d3 from 'd3';
import { geoRobinson } from 'd3-geo-projection';
import * as topojson from 'topojson-client';

const container = document.getElementById('map-container');
const info = document.getElementById('info');
const tooltip = document.getElementById('tooltip');
const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select(container).append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`);

const g = svg.append('g');

const projection = geoRobinson()
  .fitSize([width - 40, height - 40], { type: "Sphere" })
  .translate([width / 2, height / 2]);

const pathGenerator = d3.geoPath(projection);

const graticule = d3.geoGraticule10();

const zoom = d3.zoom()
  .scaleExtent([1, 12])
  .on('zoom', (event) => {
    g.attr('transform', event.transform);
  });

svg.call(zoom);

document.getElementById('zoom-in').addEventListener('click', () => {
  svg.transition().duration(300).call(zoom.scaleBy, 1.5);
});
document.getElementById('zoom-out').addEventListener('click', () => {
  svg.transition().duration(300).call(zoom.scaleBy, 1 / 1.5);
});
document.getElementById('zoom-reset').addEventListener('click', () => {
  svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
});

const colorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0.25, 0.95]);

async function loadAndRender(url) {
  info.textContent = 'Loading...';
  const t0 = performance.now();

  const response = await fetch(url);
  const tFetch = performance.now();

  const topoData = await response.json();
  const tParse = performance.now();

  const objName = Object.keys(topoData.objects)[0];
  const features = topojson.feature(topoData, topoData.objects[objName]).features;

  g.selectAll('*').remove();

  g.append('path')
    .datum({ type: 'Sphere' })
    .attr('class', 'ocean')
    .attr('d', pathGenerator);

  g.append('path')
    .datum(graticule)
    .attr('class', 'graticule')
    .attr('d', pathGenerator);

  const tRenderStart = performance.now();

  g.selectAll('.region')
    .data(features)
    .join('path')
    .attr('class', 'region')
    .attr('d', pathGenerator)
    .attr('fill', d => {
      const code = d.properties.gdlcode || '';
      const hash = Array.from(code).reduce((a, c) => a + c.charCodeAt(0), 0);
      const fakeHdi = 0.3 + (hash % 70) / 100;
      return colorScale(fakeHdi);
    })
    .on('mouseenter', function(event, d) {
      d3.select(this).raise().attr('stroke', '#fff').attr('stroke-width', 2);
      tooltip.style.display = 'block';
      tooltip.textContent = `${d.properties.gdlcode} (${d.properties.iso_code})`;
    })
    .on('mousemove', (event) => {
      tooltip.style.left = (event.clientX + 12) + 'px';
      tooltip.style.top = (event.clientY - 20) + 'px';
    })
    .on('mouseleave', function() {
      d3.select(this).attr('stroke', '#222').attr('stroke-width', 0.3);
      tooltip.style.display = 'none';
    });

  const tRenderEnd = performance.now();

  info.innerHTML = [
    `<b>${features.length} features</b> | File: ${url.split('/').pop()}`,
    `<br>Fetch: ${(tFetch - t0).toFixed(0)}ms`,
    `| Parse: ${(tParse - tFetch).toFixed(0)}ms`,
    `| Render: ${(tRenderEnd - tRenderStart).toFixed(0)}ms`,
    `| <b>Total: ${(tRenderEnd - t0).toFixed(0)}ms</b>`,
  ].join(' ');
}

document.getElementById('file-select').addEventListener('change', (e) => {
  svg.call(zoom.transform, d3.zoomIdentity);
  loadAndRender(e.target.value);
});

loadAndRender('data/gdl_2pct.topo.json');
