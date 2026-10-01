// Writes the tiling starfield layers used behind the night-side theme.
//
//   node scripts/make-starfield.mjs
//
// Three seeded layers (so the sky is the same on every build) that repeat at
// different sizes, which keeps the tiling from showing:
//   stars-far.svg      many faint pinpoints
//   stars-near.svg     fewer, brighter stars, some with a soft glow
//   stars-twinkle.svg  a sparse bright layer the CSS fades in and out
import fs from 'node:fs/promises';

// mulberry32: small seeded PRNG
function rng(seed) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const tint = (r) => (r < 0.72 ? '#ffffff' : r < 0.86 ? '#cddcff' : '#ffe6c4'); // white, blue-white, warm
const f = (n) => Math.round(n * 100) / 100;

function layer({ seed, size, count, rMin, rMax, oMin, oMax, glow = 0 }) {
	const rand = rng(seed);
	const pad = 4; // keep stars off the tile edge so they never get cut at the seam
	let body = '';
	for (let i = 0; i < count; i++) {
		const x = f(pad + rand() * (size - pad * 2));
		const y = f(pad + rand() * (size - pad * 2));
		const r = f(rMin + rand() ** 2 * (rMax - rMin)); // most stars small, a few larger
		const o = f(oMin + rand() * (oMax - oMin));
		const c = tint(rand());
		if (rand() < glow) body += `<circle cx="${x}" cy="${y}" r="${f(r * 4)}" fill="url(#g)" opacity="${f(o * 0.5)}"/>`;
		body += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o}"/>`;
	}
	const defs = glow
		? '<defs><radialGradient id="g"><stop offset="0" stop-color="#dfe8ff" stop-opacity=".9"/><stop offset="1" stop-color="#dfe8ff" stop-opacity="0"/></radialGradient></defs>'
		: '';
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs}${body}</svg>\n`;
}

const layers = {
	'stars-far.svg': { seed: 11, size: 512, count: 120, rMin: 0.35, rMax: 0.8, oMin: 0.2, oMax: 0.65 },
	'stars-near.svg': { seed: 13, size: 1024, count: 34, rMin: 0.7, rMax: 1.35, oMin: 0.55, oMax: 0.95, glow: 0.25 },
	'stars-twinkle.svg': { seed: 17, size: 768, count: 14, rMin: 0.9, rMax: 1.5, oMin: 0.7, oMax: 1, glow: 0.5 },
};

for (const [file, opts] of Object.entries(layers)) {
	const svg = layer(opts);
	await fs.writeFile(`public/${file}`, svg);
	console.log(`public/${file}  ${(svg.length / 1024).toFixed(1)} KB`);
}
