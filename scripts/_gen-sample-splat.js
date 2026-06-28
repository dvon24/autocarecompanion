/**
 * Generate a dependency-free sample Gaussian-splat .ply so the /lab/3d page can
 * render real 3D-in-browser BEFORE SAM 3D is stood up. Writes a colorful sphere
 * of ~40k gaussians in the INRIA 3DGS .ply format the @mkkellogg viewer reads.
 *
 *   node scripts/_gen-sample-splat.js  ->  public/lab/sample-splat.ply
 *
 * Format notes (3DGS conventions the viewer expects):
 *  - color is SH degree-0: stored f_dc = (c - 0.5) / 0.28209479177387814
 *  - opacity stored as logit; scale stored as ln(scale); rot = normalized quat
 */
const fs = require('fs');
const path = require('path');

const N = 40000;
const C0 = 0.28209479177387814;
const dc = (c) => (c - 0.5) / C0;
const logit = (o) => Math.log(o / (1 - o));

// property order: x y z nx ny nz f_dc_0 f_dc_1 f_dc_2 opacity scale_0 scale_1 scale_2 rot_0 rot_1 rot_2 rot_3
const FLOATS = 17;
const buf = Buffer.alloc(N * FLOATS * 4);
let off = 0;
const w = (v) => { buf.writeFloatLE(v, off); off += 4; };

// deterministic pseudo-random (no Math.random — keep it reproducible)
let seed = 1337;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

function hsl(h) {
  // h in [0,1) -> vivid rgb
  const k = (n) => (n + h * 12) % 12;
  const f = (n) => 0.5 - 0.5 * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}

for (let i = 0; i < N; i++) {
  // even-ish sphere via spherical coords + jitter
  const u = rnd(); const v = rnd();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = 1.0 + (rnd() - 0.5) * 0.04;
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta);
  const [cr, cg, cb] = hsl((y + 1) / 2); // color by height
  w(x); w(y); w(z);
  w(0); w(0); w(0);                       // normals (unused)
  w(dc(cr)); w(dc(cg)); w(dc(cb));        // SH dc color
  w(logit(0.9));                          // opacity
  w(Math.log(0.012)); w(Math.log(0.012)); w(Math.log(0.012)); // isotropic scale
  w(1); w(0); w(0); w(0);                 // identity quaternion
}

const header =
  'ply\n' +
  'format binary_little_endian 1.0\n' +
  `element vertex ${N}\n` +
  'property float x\nproperty float y\nproperty float z\n' +
  'property float nx\nproperty float ny\nproperty float nz\n' +
  'property float f_dc_0\nproperty float f_dc_1\nproperty float f_dc_2\n' +
  'property float opacity\n' +
  'property float scale_0\nproperty float scale_1\nproperty float scale_2\n' +
  'property float rot_0\nproperty float rot_1\nproperty float rot_2\nproperty float rot_3\n' +
  'end_header\n';

const outDir = path.join('public', 'lab');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'sample-splat.ply');
fs.writeFileSync(outPath, Buffer.concat([Buffer.from(header, 'ascii'), buf]));
console.log(`Wrote ${outPath} (${N} gaussians, ${(buf.length / 1e6).toFixed(1)}MB)`);
