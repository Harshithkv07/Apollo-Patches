import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// All artwork coordinates live in a 1000 × 1000 box laid over the patch:
// (0, 0) is the top-left of the patch's bounding square, (500, 500) its center.
const num = z.number();

const hotspot = z.union([
	z.object({ circle: z.tuple([num, num, num]) }), // cx, cy, r
	z.object({ ellipse: z.array(num).min(4).max(5) }), // cx, cy, rx, ry, rotate°
	z.object({ ring: z.tuple([num, num, num, num]) }), // cx, cy, outer r, inner r
	z.object({ polygon: z.string() }), // "x,y x,y …", several parts separated by " | "
	z.object({ path: z.string() }), // raw SVG path (M/L/C/Z), filled even-odd
]);

const feature = z.discriminatedUnion('kind', [
	z.object({ kind: z.literal('circle'), label: z.string(), cx: num, cy: num, r: num }),
	z.object({
		kind: z.literal('ellipse'),
		label: z.string(),
		cx: num,
		cy: num,
		rx: num,
		ry: num,
		rotate: num.default(0),
	}),
	z.object({ kind: z.literal('line'), label: z.string(), segments: z.array(z.tuple([num, num, num, num])) }),
	// Lettering baseline or other arc. Angles in degrees, SVG convention (0° = 3
	// o'clock, clockwise positive), around (cx, cy), the patch center by default.
	// `cap` is the cap height, drawn toward `capToward`.
	z.object({
		kind: z.literal('arc'),
		label: z.string(),
		r: num,
		from: num,
		to: num,
		cx: num.default(500),
		cy: num.default(500),
		cap: num.optional(),
		capToward: z.enum(['center', 'rim']).default('rim'),
	}),
	z.object({ kind: z.literal('points'), label: z.string(), points: z.array(z.tuple([num, num])) }),
]);

const missions = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/missions' }),
	schema: ({ image }) =>
		z.object({
			mission: z.string(),
			number: z.number().int(),
			tagline: z.string(),
			patch: image(),
			patchAlt: z.string(),
			patchSource: z.object({ id: z.string(), url: z.url() }),
			launch: z.coerce.date().optional(),
			splashdown: z.coerce.date().optional(),
			// For a mission that never launched (Apollo 1): the date that defines it.
			event: z.object({ date: z.coerce.date(), label: z.string() }).optional(),
			// Apollo 7 and 8 flew without spacecraft names.
			callsigns: z.object({ csm: z.string().optional(), lm: z.string().optional() }).default({}),
			crew: z.array(z.object({ name: z.string(), role: z.string(), note: z.string().optional() })),
			designers: z.array(z.string()).default([]),
			lettering: z.array(z.string()),
			namesOnPatch: z.boolean(),
			shape: z.enum(['circle', 'oval', 'shield', 'triangle', 'irregular']),
			// Silhouette of a non-circular patch as an SVG path in the 1000-unit box.
			outline: z.string().optional(),
			composition: z.string(),
			colors: z
				.array(
					z.object({
						name: z.string(),
						hex: z.string().regex(/^#[0-9a-f]{6}$/i),
						note: z.string().optional(),
					}),
				)
				.min(2),
			iconography: z
				.array(
					z.object({
						id: z.string().regex(/^[a-z0-9-]+$/),
						symbol: z.string(),
						denotes: z.string(),
						note: z.string().optional(),
						hotspot,
					}),
				)
				.min(1),
			construction: z.object({
				// Concentric bands from the rim inward, as fractions of the diameter D.
				// Circular patches only.
				bands: z.array(z.object({ name: z.string(), outer: num, inner: num })).default([]),
				features: z.array(feature),
				notes: z.array(z.string()).default([]),
			}),
			sources: z.array(z.object({ title: z.string(), publisher: z.string(), url: z.url().optional() })).min(1),
			// Claims that rest on secondary sources and want a human check.
			review: z.array(z.string()).default([]),
		}).superRefine((d, ctx) => {
			if (d.shape !== 'circle' && !d.outline)
				ctx.addIssue({ code: 'custom', path: ['outline'], message: 'Non-circular patches need an outline path.' });
			if (!d.launch && !d.event)
				ctx.addIssue({ code: 'custom', path: ['launch'], message: 'Give a launch date, or an event for a mission that never flew.' });
		}),
});

export const collections = { missions };
