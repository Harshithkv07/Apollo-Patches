# Apollo Patches

A design guide to the crew emblems of Project Apollo. Each emblem is taken apart the same way: story, composition, iconography, colors and construction.

Built with [Astro](https://astro.build). Static output, with small vanilla-JS enhancements.

## Commands

| Command                                                  | What it does                                                        |
| :------------------------------------------------------- | :------------------------------------------------------------------ |
| `npm run dev`                                            | Dev server at `localhost:4321`                                      |
| `npm run build`                                          | Build the static site to `./dist/`                                  |
| `npx astro check`                                        | Type-check pages and validate mission content against the schema    |
| `node scripts/prepare-patch.mjs <scan.jpg> <slug> [--outline]` | Cut a NASA scan out as a clean asset and print ring, outline and color data |
| `node scripts/trace-icons.mjs <slug> [symbol-id] [--field=#hex,…]` | Auto-trace placeholder symbol art from the patch |
| `node scripts/make-starfield.mjs`                        | Regenerate the starfield tiles in `public/` (seeded, so the sky stays the same) |

## Adding a mission

1. Find the emblem in the [NASA Image and Video Library](https://images.nasa.gov/) and download the original scan into `source-scans/`.
2. `node scripts/prepare-patch.mjs source-scans/<file>.jpg apollo-<n>` writes `src/assets/patches/apollo-<n>.webp` and prints ring boundaries and a rough palette. For a patch that isn't a circle (shield, oval, triangle, irregular), add `--outline`: the script removes the paper around it, traces its silhouette and prints the path for the mission's `outline` field.
3. Copy an existing file in `src/content/missions/` to `apollo-<n>.md` and fill it in. The schema in `src/content.config.ts` lists every field; `npx astro check` flags anything missing. A mission that never flew uses `event` instead of `launch`.
4. With `npm run dev` running, open `/dev/apollo-<n>` to place hotspots by clicking around each symbol. This page only exists in dev. Hotspots can be circles, ellipses, rings, polygons (several parts separated by `|`) or raw SVG paths.
5. `node scripts/trace-icons.mjs apollo-<n>` generates placeholder symbol art in `src/assets/icons/apollo-<n>/`. If the field is light or mottled, pass its colors with `--field=#hex,#hex`. Replace any file with a hand-drawn SVG; fills should use `currentColor` or black.

## Coordinates

All artwork coordinates use a 1000 × 1000 box laid over the patch: `(500, 500)` is the center and `1000` is the diameter, **D**. Construction measurements are shown as fractions of D.

## Credits and rights

Patch artwork is by NASA and is reproduced for education and information. The site isn't affiliated with or endorsed by NASA and doesn't use the NASA insignia. Every mission page cites its sources; claims from non-NASA sources are listed in each file's `review` field.
