---
name: Responsive QA
description: Builds the page mobile-first and checks it at seven widths from 375px to 1440px, fixing overflow, cramped type, hover-only interactions, and broken grids before returning.
author: Hannah Brooks
source: brooks/qa-skills
tags: [responsive, mobile, qa]
views: 6400
uses: 310
---

## Build mobile-first

- Write base classes for 375px, then layer `sm:` (640px), `md:` (768px), `lg:` (1024px), and `xl:` (1280px).
- Check layouts at these widths: 375, 390, 768, 834, 1024, 1280, 1440.

## No horizontal scroll

- Never use `w-screen` or `100vw` on elements inside padded containers.
- Clip decorative bleed (glows, blobs, rotated shapes) with `overflow-x-clip` on the section, not on `<body>`.
- Long words, URLs, and emails get `break-words`. Code blocks and tables sit in `overflow-x-auto` wrappers.
- Absolutely positioned decorations stay inside `relative overflow-hidden` parents.

## Hero

- Use `min-h-[100svh]` instead of `h-screen` so mobile browser bars don't cut off content.
- Headline scale: `text-4xl sm:text-5xl lg:text-7xl`. Check the longest word fits at 375px.
- Buttons stack full-width on mobile (`flex flex-col sm:flex-row`, buttons `w-full sm:w-auto`).
- Split heroes stack with text first, unless the brief says the visual comes first.

## Navigation

- Below `md`, collapse links into a menu button with `aria-expanded` and `aria-controls`. The open menu is reachable by keyboard and closes on Escape.
- Sticky headers stay under 64px tall on mobile.

## Grids and cards

- Multi-column grids drop to 1 column below `md`, or 2 columns for small items like logos and stats.
- Bento spans (`md:col-span-*`, `md:row-span-*`) apply only from `md` up.
- Cards in a row get equal height (`h-full` with `flex flex-col`) and push actions to the bottom (`mt-auto`).
- Images use `aspect-*` with `object-cover`, so they never stretch.

## Touch

- Every hover effect has a non-hover equivalent. Information shown on hover is also visible by default on touch.
- Tap targets are at least 44×44px with 8px between them.
- Carousels can be swiped and have buttons.

## Type and spacing

- Body text never goes below 16px on mobile.
- Reduce section padding on mobile: `py-16 md:py-28`. Keep side padding at least `px-5`.
- Limit line length with `max-w-prose` or `max-w-[65ch]`.

## Before returning

- Mentally render the page at 375px and 1440px, section by section. Fix any overflow, overlap, or orphaned single words in headings (`text-balance`).

## Don't

- Don't hide important content on mobile. Rearrange it.
- Don't rely on fixed pixel heights for text containers.
