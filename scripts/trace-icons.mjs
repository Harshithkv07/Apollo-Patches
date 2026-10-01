// Auto-traces placeholder line art for every iconography symbol of a mission.
// Each symbol is cut out of the patch with its hotspot shape, the field color
// is knocked out to paper, and the remaining tones are posterized into three
// ink layers. Refine the output by hand in Figma or Illustrator.
//
//   node scripts/trace-icons.mjs apollo-11 [symbol-id] [--field=#rrggbb[,#rrggbb…]]
//
// --field overrides which colors count as background (default: the darkest
// color in the mission's palette), for light or mottled fields.
//
// Writes src/assets/icons/<slug>/<id>.svg (fills use currentColor).
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { load as parseYaml } from 'js-yaml';
import potrace from 'potrace';
import { hotspotExtent, hotspotPath } from '../src/lib/geometry.ts';

const args = process.argv.slice(2);
const fieldArg = args.find((a) => a.startsWith('--field='))?.slice(8);
const [slug, only] = args.filter((a) => !a.startsWith('--'));
if (!slug) {
	console.error('usage: node scripts/trace-icons.mjs <slug> [symbol-id] [--field=#rrggbb[,#rrggbb…]]');
	process.exit(1);
}

const SCALE = 1.25; // trace from a 1250px render of the 1000-unit patch box
const SIZE = 1000 * SCALE;
const PAD = 8;

const md = await fs.readFile(`src/content/missions/${slug}.md`, 'utf8');
const data = parseYaml(md.split(/^---$/m)[1]);
const patchFile = path.resolve('src/content/missions', data.patch);

// Background colors: anything close to one of these becomes paper.
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const fields = fieldArg
	? fieldArg.split(',').map(rgb)
	: [data.colors.map((c) => rgb(c.hex)).sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]))[0]];

const { data: pixels } = await sharp(patchFile)
	.resize(SIZE, SIZE)
	.flatten({ background: '#ffffff' })
	.raw()
	.toBuffer({ resolveWithObject: true });

function bbox(h) {
	const e = hotspotExtent(h);
	const clamp = (v) => Math.min(1000, Math.max(0, v));
	return { x0: clamp(e.x0 - PAD), y0: clamp(e.y0 - PAD), x1: clamp(e.x1 + PAD), y1: clamp(e.y1 + PAD) };
}

// Symbols that sit on a light ground (the olive branch on the lunar surface)
// also need light pixels knocked out.
const KNOCK_OUT_LIGHT = new Set(['apollo-11/olive-branch']);
// White-on-dark symbols read better with their tones inverted.
const INVERT = new Set(['apollo-17/eagle', 'apollo-17/stars']);

const posterize = (buf, opts) =>
	new Promise((resolve, reject) => potrace.posterize(buf, opts, (err, svg) => (err ? reject(err) : resolve(svg))));

const outDir = `src/assets/icons/${slug}`;
await fs.mkdir(outDir, { recursive: true });

for (const item of data.iconography) {
	if (only && item.id !== only) continue;
	const b = bbox(item.hotspot);
	const left = Math.round(b.x0 * SCALE);
	const top = Math.round(b.y0 * SCALE);
	const w = Math.round((b.x1 - b.x0) * SCALE);
	const h = Math.round((b.y1 - b.y0) * SCALE);

	const knockLight = KNOCK_OUT_LIGHT.has(`${slug}/${item.id}`);

	// Hotspot ∩ patch circle, rendered as a mask.
	const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 1000 1000">
		<clipPath id="c">${data.outline ? `<path d="${data.outline}"/>` : '<circle cx="500" cy="500" r="498"/>'}</clipPath>
		<path d="${hotspotPath(item.hotspot)}" fill="#fff" fill-rule="evenodd" clip-path="url(#c)"/></svg>`;
	const { data: mask } = await sharp(Buffer.from(maskSvg))
		.extract({ left, top, width: w, height: h })
		.greyscale()
		.raw()
		.toBuffer({ resolveWithObject: true });

	// Luminance of every subject pixel; -1 marks paper (outside the mask, or
	// close to the field color).
	const lum = new Float32Array(w * h);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const o = y * w + x;
			const i = ((top + y) * SIZE + (left + x)) * 3;
			const r = pixels[i], g = pixels[i + 1], bl = pixels[i + 2];
			const nearField = fields.some((f) => Math.hypot(r - f[0], g - f[1], bl - f[2]) < 42);
			const light = knockLight && Math.min(r, g, bl) > 185;
			lum[o] = mask[o] < 128 || nearField || light ? -1 : 0.2126 * r + 0.7152 * g + 0.0722 * bl;
		}
	}

	// Stretch the subject's tones to the full ink range (2nd–98th percentile)
	// so pale symbols like the gold horses still get three distinct layers.
	// Values stop at 205 so even the lightest subject pixel is traced.
	const subject = Array.from(lum.filter((v) => v >= 0)).sort((a, b) => a - b);
	const lo = subject[Math.floor(subject.length * 0.02)] ?? 0;
	const hi = subject[Math.floor(subject.length * 0.98)] ?? 255;
	const invert = INVERT.has(`${slug}/${item.id}`);
	const gray = Buffer.alloc(w * h);
	for (let o = 0; o < lum.length; o++) {
		if (lum[o] < 0) {
			gray[o] = 255;
			continue;
		}
		const t = Math.min(1, Math.max(0, (lum[o] - lo) / Math.max(1, hi - lo)));
		gray[o] = Math.round((invert ? 1 - t : t) * 205);
	}
	const png = await sharp(gray, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();

	let svg = await posterize(png, {
		steps: [70, 135, 206],
		color: '#000000',
		background: 'transparent',
		turdSize: 10,
		optTolerance: 0.8,
	});
	svg = svg
		.replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true">`)
		.replace(/fill="#000000"/g, 'fill="currentColor"')
		.replace(/<rect[^>]*fill="transparent"[^>]*\/>/g, '')
		// whole-unit path coordinates are plenty at icon sizes and halve the file
		.replace(/ d="([^"]+)"/g, (_, d) => ` d="${d.replace(/\d+\.\d+/g, (n) => String(Math.round(Number(n))))}"`);
	const file = path.join(outDir, `${item.id}.svg`);
	await fs.writeFile(file, svg);
	console.log(`${file}  ${w}×${h}  ${(svg.length / 1024).toFixed(0)} KB`);
}
