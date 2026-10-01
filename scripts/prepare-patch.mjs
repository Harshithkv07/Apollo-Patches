// Turns a NASA emblem scan into a clean web asset and prints measurements
// that feed the mission's `construction`, `outline` and `colors` data.
//
//   node scripts/prepare-patch.mjs source-scans/S69-34875_apollo-11.jpg apollo-11
//   node scripts/prepare-patch.mjs source-scans/s68-51093_apollo-8.jpg apollo-8 --outline
//
// Circle mode (default) fits a circle to the rim. Outline mode is for any other
// shape: it removes the white paper around the patch, traces the silhouette,
// and prints it as an SVG path for the mission's `outline` field.
//
// Either way the patch is centered in a square: the 1000-unit box that all
// hotspot and construction coordinates use. Writes src/assets/patches/<slug>.webp.
import sharp from 'sharp';
import path from 'node:path';
import potrace from 'potrace';

const args = process.argv.slice(2);
const outlineMode = args.includes('--outline');
const [input, slug] = args.filter((a) => !a.startsWith('--'));
if (!input || !slug) {
	console.error('usage: node scripts/prepare-patch.mjs <scan.jpg> <slug> [--outline]');
	process.exit(1);
}

const MAX_OUT = 2400;
const WHITE_THRESHOLD = 232; // scans sit on white paper; anything darker is patch

const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const px = (x, y) => {
	const i = (y * width + x) * 3;
	return [data[i], data[i + 1], data[i + 2]];
};
const isInk = (x, y) => Math.min(...px(x, y)) < WHITE_THRESHOLD;
const toHex = ([r, g, b]) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const r1 = (n) => Math.round(n * 10) / 10;

// Crop a square of the scan (padding with paper where it runs past the edges),
// resize it, cut the patch shape out as alpha and write webp. Sharp always
// applies extend after extract, so padding happens in its own pass.
async function writePatch(square, out, alphaSvg) {
	// Pad only as far as the square runs past the scan.
	const pad = Math.ceil(
		Math.max(0, -square.left, -square.top, square.left + square.side - width, square.top + square.side - height) + 2,
	);
	const { data: padded, info: pi } = await sharp(input)
		.removeAlpha()
		.extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#ffffff' })
		.raw()
		.toBuffer({ resolveWithObject: true });
	const file = path.join('src/assets/patches', `${slug}.webp`);
	await sharp(padded, { raw: { width: pi.width, height: pi.height, channels: pi.channels } })
		.extract({
			left: Math.round(square.left + pad),
			top: Math.round(square.top + pad),
			width: Math.round(square.side),
			height: Math.round(square.side),
		})
		.resize(out, out, { fit: 'fill' })
		.ensureAlpha()
		.composite([{ input: Buffer.from(alphaSvg), blend: 'dest-in' }])
		.webp({ quality: 90, alphaQuality: 100 })
		.toFile(file);
	console.log(`wrote ${file} (${out}px)`);
}

// The square (in scan pixels) that becomes the 1000-unit box, and a test for
// "is this scan pixel part of the patch" used by the palette sampler.
let box;
let inside;

if (outlineMode) {
	// 1. Flood-fill the paper from the scan's edges on a reduced copy.
	const W = 1600;
	const scale = W / Math.max(width, height);
	const w = Math.round(width * scale);
	const h = Math.round(height * scale);
	const small = await sharp(input).removeAlpha().resize(w, h).raw().toBuffer();
	const paper = new Uint8Array(w * h);
	const queue = new Int32Array(w * h);
	let head = 0, tail = 0;
	const light = (i) => Math.min(small[i * 3], small[i * 3 + 1], small[i * 3 + 2]) >= WHITE_THRESHOLD - 8;
	const seed = (i) => {
		if (!paper[i] && light(i)) {
			paper[i] = 1;
			queue[tail++] = i;
		}
	};
	for (let x = 0; x < w; x++) seed(x), seed((h - 1) * w + x);
	for (let y = 0; y < h; y++) seed(y * w), seed(y * w + w - 1);
	while (head < tail) {
		const i = queue[head++];
		const x = i % w;
		const y = (i - x) / w;
		if (x > 0) seed(i - 1);
		if (x < w - 1) seed(i + 1);
		if (y > 0) seed(i - w);
		if (y < h - 1) seed(i + w);
	}

	// 2. Bounding box of the patch, then a centered square around it.
	let x0 = w, y0 = h, x1 = 0, y1 = 0;
	for (let i = 0; i < w * h; i++) {
		if (paper[i]) continue;
		const x = i % w, y = (i - x) / w;
		if (x < x0) x0 = x;
		if (x > x1) x1 = x;
		if (y < y0) y0 = y;
		if (y > y1) y1 = y;
	}
	const side = Math.max(x1 - x0 + 1, y1 - y0 + 1);
	const sx = (x0 + x1 + 1) / 2 - side / 2;
	const sy = (y0 + y1 + 1) / 2 - side / 2;
	box = { left: sx / scale, top: sy / scale, side: side / scale };

	// 3. Trace the patch silhouette (black on white) and map it into the box.
	const mask = Buffer.alloc(w * h);
	for (let i = 0; i < w * h; i++) mask[i] = paper[i] ? 255 : 0;
	// Blur and re-threshold first: it rounds off scan noise along the edge so
	// the traced path stays short.
	const png = await sharp(mask, { raw: { width: w, height: h, channels: 1 } }).blur(4).threshold(128).png().toBuffer();
	const tracer = new potrace.Potrace();
	await new Promise((res, rej) => tracer.loadImage(png, (err) => (err ? rej(err) : res())));
	tracer.setParameters({ threshold: 128, turdSize: 400, alphaMax: 1.2, optTolerance: 2 });
	const rawPath = tracer.getPathTag().match(/ d="([^"]+)"/)[1];
	let k = 0;
	const outline = rawPath
		.replace(/-?\d+(\.\d+)?/g, (n) => {
			const v = Number(n);
			const mapped = k++ % 2 === 0 ? ((v - sx) / side) * 1000 : ((v - sy) / side) * 1000;
			return String(r1(mapped));
		})
		.replace(/\s+/g, ' ')
		.trim();

	console.log(`scan ${width}×${height}  patch box ${(x1 - x0 + 1) / scale | 0}×${(y1 - y0 + 1) / scale | 0}px`);
	console.log(
		`extent in box units: x ${r1(((x0 - sx) / side) * 1000)}–${r1(((x1 + 1 - sx) / side) * 1000)}, y ${r1(((y0 - sy) / side) * 1000)}–${r1(((y1 + 1 - sy) / side) * 1000)}`,
	);
	console.log(`outline (${outline.length} chars):\n${outline}`);

	inside = (x, y) => {
		const i = Math.round(y * scale) * w + Math.round(x * scale);
		return i >= 0 && i < w * h && !paper[i];
	};

	// 4. Crop the square (padding past the scan edges with white), resize, and
	//    cut the silhouette out as the alpha channel.
	const out = Math.min(MAX_OUT, Math.round(box.side));
	await writePatch(
		box,
		out,
		`<svg xmlns="http://www.w3.org/2000/svg" width="${out}" height="${out}" viewBox="0 0 1000 1000"><path d="${outline}" fill="#fff" fill-rule="evenodd"/></svg>`,
	);
} else {
	// 1. Bounding box of everything darker than the paper.
	let minX = width, minY = height, maxX = 0, maxY = 0;
	for (let y = 0; y < height; y += 2) {
		for (let x = 0; x < width; x += 2) {
			if (isInk(x, y)) {
				if (x < minX) minX = x;
				if (x > maxX) maxX = x;
				if (y < minY) minY = y;
				if (y > maxY) maxY = y;
			}
		}
	}

	// 2. Cast rays from the box center, keep the outermost non-white pixel on
	//    each ray, and least-squares fit a circle through those rim points
	//    (Kåsa fit). The bounding box alone is thrown off by stray marks.
	const bx = (minX + maxX) / 2;
	const by = (minY + maxY) / 2;
	const reach = Math.max(maxX - minX, maxY - minY) * 0.6;
	const rim = [];
	for (let deg = 0; deg < 360; deg += 1) {
		const rad = (deg * Math.PI) / 180;
		for (let d = reach; d > 0; d -= 1) {
			const x = Math.round(bx + Math.cos(rad) * d);
			const y = Math.round(by + Math.sin(rad) * d);
			if (x < 0 || y < 0 || x >= width || y >= height) continue;
			// require a short solid run so JPEG specks don't count as rim
			if (isInk(x, y) && isInk(Math.round(bx + Math.cos(rad) * (d - 4)), Math.round(by + Math.sin(rad) * (d - 4)))) {
				rim.push([x, y]);
				break;
			}
		}
	}
	const fitCircle = (points) => {
		let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0, sz = 0;
		for (const [x, y] of points) {
			const z = x * x + y * y;
			sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
			sxz += x * z; syz += y * z; sz += z;
		}
		const n = points.length;
		// Solve the 3×3 normal equations for x² + y² + Dx + Ey + F = 0
		const A = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]];
		const B = [-sxz, -syz, -sz];
		const det = (m) =>
			m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
			m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
			m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
		const d0 = det(A);
		const col = (i) => A.map((row, r) => row.map((v, c) => (c === i ? B[r] : v)));
		const [D, E, F] = [0, 1, 2].map((i) => det(col(i)) / d0);
		const cx = -D / 2, cy = -E / 2;
		return { cx, cy, r: Math.sqrt(cx * cx + cy * cy - F) };
	};
	// Fit once, drop outliers (dents in the scan), fit again.
	let fit = fitCircle(rim);
	const inliers = rim.filter(([x, y]) => Math.abs(Math.hypot(x - fit.cx, y - fit.cy) - fit.r) < fit.r * 0.01);
	fit = fitCircle(inliers);
	const { cx, cy, r: radius } = fit;
	console.log(`scan ${width}×${height}  circle c=(${cx.toFixed(0)}, ${cy.toFixed(0)}) r=${radius.toFixed(0)}  (${inliers.length}/${rim.length} rim points)`);
	box = { left: cx - radius, top: cy - radius, side: radius * 2 };
	inside = (x, y) => Math.hypot(x - cx, y - cy) < radius * 0.97;

	// 3. Crop to the circle, mask everything outside it, write webp.
	const out = Math.min(MAX_OUT, Math.round(radius * 2));
	await writePatch(
		box,
		out,
		`<svg xmlns="http://www.w3.org/2000/svg" width="${out}" height="${out}"><circle cx="${out / 2}" cy="${out / 2}" r="${out / 2 - 2}" fill="#fff"/></svg>`,
	);

	// 4. Radial profile: walk from the rim inward along a few angles and report
	//    where the color changes sharply. These are the ring boundaries, as a
	//    fraction of the radius (1 = outer edge).
	for (const deg of [200, 250, 290, 340]) {
		const rad = (deg * Math.PI) / 180;
		const edges = [];
		let prev = null;
		for (let f = 0.999; f > 0.8; f -= 0.001) {
			const x = Math.round(cx + Math.cos(rad) * radius * f);
			const y = Math.round(cy + Math.sin(rad) * radius * f);
			if (x < 0 || y < 0 || x >= width || y >= height) continue;
			const c = px(x, y);
			if (prev && dist(c, prev) > 60) edges.push(`${f.toFixed(3)} ${toHex(prev)}→${toHex(c)}`);
			prev = c;
		}
		console.log(`angle ${deg}°: ${edges.join(' | ') || '(no sharp edges)'}`);
	}
}

// Rough palette: k-means over pixels inside the patch.
const samples = [];
const step = Math.max(4, Math.round(Math.max(width, height) / 480));
for (let y = 0; y < height; y += step) {
	for (let x = 0; x < width; x += step) {
		if (inside(x, y)) samples.push(px(x, y));
	}
}
let centers = Array.from({ length: 9 }, (_, i) => samples[Math.floor((i + 0.5) * (samples.length / 9))]);
let counts = [];
for (let iter = 0; iter < 15; iter++) {
	const sums = centers.map(() => [0, 0, 0]);
	counts = centers.map(() => 0);
	for (const s of samples) {
		let best = 0, bestD = Infinity;
		centers.forEach((c, i) => {
			const d = dist(s, c);
			if (d < bestD) { bestD = d; best = i; }
		});
		sums[best][0] += s[0]; sums[best][1] += s[1]; sums[best][2] += s[2];
		counts[best]++;
	}
	centers = sums.map((s, i) => (counts[i] ? s.map((v) => v / counts[i]) : centers[i]));
}
const total = counts.reduce((a, b) => a + b, 0);
console.log('palette:', centers
	.map((c, i) => ({ hex: toHex(c), share: counts[i] / total }))
	.sort((a, b) => b.share - a.share)
	.map((c) => `${c.hex} ${(c.share * 100).toFixed(1)}%`)
	.join('  '));
