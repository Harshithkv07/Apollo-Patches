const long = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const short = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export const formatDate = (d: Date) => long.format(d);

/** The date a mission is placed by: its launch, or the event that defined it. */
export const missionDate = (d: { launch?: Date; event?: { date: Date } }) => (d.launch ?? d.event?.date)!;

export const shapeLabel: Record<string, string> = {
	circle: 'Circle',
	oval: 'Oval',
	shield: 'Shield',
	triangle: 'Rounded triangle',
	irregular: 'Irregular',
};
export const formatMonth = (d: Date) => short.format(d).toUpperCase();
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export function hexToRgb(hex: string) {
	const n = parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

export function hexToHsl(hex: string) {
	const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	if (max === min) return { h: 0, s: 0, l };
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
	h *= 60;
	return { h, s, l };
}

/** Text color that reads on top of a swatch. */
export const inkOn = (hex: string) => (hexToHsl(hex).l > 0.58 ? '#17160f' : '#f6f3ec');

/** Hue of the first clearly chromatic color in a palette; used for "sort by hue". */
export function signatureHue(colors: { hex: string }[]) {
	const c = colors.map((c) => hexToHsl(c.hex)).find((c) => c.s > 0.35 && c.l > 0.15 && c.l < 0.9);
	return c ? Math.round(c.h) : 360;
}
