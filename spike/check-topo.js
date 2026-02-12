const topo = require('./data/gdl_2pct.topo.json');
const obj = Object.keys(topo.objects)[0];
const geoms = topo.objects[obj].geometries;
console.log('Object name:', obj);
console.log('Feature count:', geoms.length);
console.log('Sample properties:', JSON.stringify(geoms[0].properties));
console.log('Geometry types:', [...new Set(geoms.map(g => g.type))]);

let degenerate = 0;
for (const g of geoms) {
    if (!g.arcs || g.arcs.length === 0) degenerate++;
}
console.log('Degenerate (no arcs):', degenerate);
