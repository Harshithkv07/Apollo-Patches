import type { CollectionEntry } from 'astro:content';

type Mission = CollectionEntry<'missions'>['data'];
export type Hotspot = Mission['iconography'][number]['hotspot'];

const round = (n: number) => Math.round(n * 10) / 10;

/** The patch silhouette in the 1000-unit box: its traced outline, or the full circle. */
export const outlinePath = (d: { outline?: string }) =>
	d.outline ?? 'M0,500a500,500 0 1,0 1000,0a500,500 0 1,0 -1000,0Z';

const circlePath = (cx: number, cy: number, r: number) =>
	`M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 ${-r * 2},0Z`;

/**
 * Any hotspot shape → an SVG path `d` in the 1000-unit patch box. Paths are
 * meant to be filled even-odd, which is how rings and banded shapes get holes.
 */
export function hotspotPath(h: Hotspot): string {
	if ('circle' in h) return circlePath(...h.circle);
	if ('ring' in h) {
		const [cx, cy, outer, inner] = h.ring;
		return circlePath(cx, cy, outer) + circlePath(cx, cy, inner);
	}
	if ('path' in h) return h.path;
	if ('ellipse' in h) {
		const [cx, cy, rx, ry, rot = 0] = h.ellipse;
		// Sample the ellipse so rotation can be baked into the path.
		const t = (rot * Math.PI) / 180;
		const pts: string[] = [];
		for (let i = 0; i < 48; i++) {
			const a = (i / 48) * Math.PI * 2;
			const x = rx * Math.cos(a);
			const y = ry * Math.sin(a);
			pts.push(`${round(cx + x * Math.cos(t) - y * Math.sin(t))},${round(cy + x * Math.sin(t) + y * Math.cos(t))}`);
		}
		return `M${pts.join('L')}Z`;
	}
	return h.polygon
		.split('|')
		.map((part) => `M${part.trim().split(/\s+/).join('L')}Z`)
		.join('');
}

/** Rough bounding box of a hotspot, for sizing and cropping. */
export function hotspotExtent(h: Hotspot) {
	if ('circle' in h || 'ring' in h) {
		const [cx, cy, r] = 'circle' in h ? h.circle : h.ring;
		return { x0: cx - r, y0: cy - r, x1: cx + r, y1: cy + r };
	}
	if ('ellipse' in h) {
		const [cx, cy, rx, ry] = h.ellipse;
		const m = Math.max(rx, ry);
		return { x0: cx - m, y0: cy - m, x1: cx + m, y1: cy + m };
	}
	if ('path' in h) return pathExtent(h.path);
	const pts = h.polygon
		.split(/[\s|]+/)
		.filter(Boolean)
		.map((p) => p.split(',').map(Number));
	const xs = pts.map((p) => p[0]);
	const ys = pts.map((p) => p[1]);
	return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

/**
 * Bounding box of a path drawn with absolute M, L, C and Z commands (what the
 * outline tracer emits). Curves are sampled, so control points that sit off
 * the curve don't inflate the box.
 */
export function pathExtent(d: string) {
	const tokens = d.match(/[MLCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? [];
	let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
	const add = (x: number, y: number) => {
		x0 = Math.min(x0, x); y0 = Math.min(y0, y);
		x1 = Math.max(x1, x); y1 = Math.max(y1, y);
	};
	let cmd = 'M';
	let cx = 0, cy = 0;
	for (let i = 0; i < tokens.length; ) {
		if (/[MLCZ]/i.test(tokens[i])) {
			cmd = tokens[i++].toUpperCase();
			if (cmd === 'Z') continue;
		}
		const n = () => Number(tokens[i++]);
		if (cmd === 'C') {
			const p = [n(), n(), n(), n(), n(), n()];
			for (let t = 0.1; t <= 1.0001; t += 0.1) {
				const u = 1 - t;
				add(
					u * u * u * cx + 3 * u * u * t * p[0] + 3 * u * t * t * p[2] + t * t * t * p[4],
					u * u * u * cy + 3 * u * u * t * p[1] + 3 * u * t * t * p[3] + t * t * t * p[5],
				);
			}
			[cx, cy] = [p[4], p[5]];
		} else {
			[cx, cy] = [n(), n()];
			add(cx, cy);
		}
	}
	return { x0, y0, x1, y1 };
}

/** Point on the patch circle at `deg` (SVG angle convention) and radius `r`. */
export function polar(r: number, deg: number, cx = 500, cy = 500) {
	const a = (deg * Math.PI) / 180;
	return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** SVG arc path along radius r around (cx, cy) from angle `from` to `to` (degrees). */
export function arcPath(r: number, from: number, to: number, cx = 500, cy = 500) {
	const a = polar(r, from, cx, cy);
	const b = polar(r, to, cx, cy);
	const sweep = to > from ? 1 : 0;
	const large = Math.abs(to - from) > 180 ? 1 : 0;
	return `M${round(a.x)},${round(a.y)}A${r},${r} 0 ${large},${sweep} ${round(b.x)},${round(b.y)}`;
}

/** Express a length in patch units (1000 = D) as a fraction of the diameter. */
export const inD = (units: number, digits = 3) => (units / 1000).toFixed(digits);
