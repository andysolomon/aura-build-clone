---
name: Bento Grid Layouts
description: Lays out feature sections as balanced bento grids with a clear hero tile, varied but consistent tile sizes, a real visual in every tile, and a clean mobile stack.
author: Amara Nwosu
source: nwosu/layout-skills
tags: [layout, bento, grid, features]
views: 19400
uses: 1310
---

## Grid setup

- Use `grid grid-cols-1 md:grid-cols-6 gap-4` with `auto-rows-[minmax(220px,auto)]`.
- Use 5 to 7 tiles. Fewer looks empty, more looks crowded.
- Use at most 3 tile sizes:
  - Hero tile: `md:col-span-4 md:row-span-2`
  - Wide tile: `md:col-span-3` or `md:col-span-4`
  - Small tile: `md:col-span-2`
- Every row adds up to 6 columns. No gaps or ragged edges.

## Tile anatomy

- One idea per tile: a title of 5 words or fewer, one line of supporting text, and one visual.
- Padding: `p-6 md:p-8`. Radius: `rounded-3xl`. Same border and background on every tile: `border border-zinc-200 bg-white` (or `border-white/10 bg-zinc-900` in dark themes).
- Text sits at the top. The visual fills the bottom or bleeds off the edge with `overflow-hidden` on the tile and a negative margin or `translate` on the visual.
- Make every tile `flex flex-col`, with the visual pushed down using `mt-auto`.

## Visuals

- Every tile gets a visual. Good options: a mini UI mockup built in HTML (a chart, a list, a chat bubble, a toggle row), a stat with a sparkline, an icon cluster, or a cropped product screenshot.
- The hero tile carries the most important feature and the richest visual.
- Vary visual types across tiles. Don't repeat the same chart twice.
- Keep visuals in the page palette, with the accent used in at most two tiles.

## Rhythm

- Alternate the hero tile's position between sections: left in one grid, right in the next.
- Use the same `gap-4` everywhere. Inner spacing never exceeds the gap between tiles by much.

## Mobile

- Below `md`, stack tiles in one column in order of importance, hero tile first.
- Reduce `auto-rows` to `minmax(180px,auto)` and keep visuals, cropped smaller. Don't hide them.

## Accessibility

- DOM order matches visual order. Don't use `grid-flow-dense` if it reorders tiles away from reading order.
- Clickable tiles are single links with a visible focus ring.
- Text contrast is at least 4.5:1, including text placed over visuals.

## Don't

- Don't use text-only tiles.
- Don't mix tile radii or border styles within one grid.
- Don't squeeze tiny text into small tiles. If the copy doesn't fit, the tile is too small.
- Don't use more than one bento grid section per page.
