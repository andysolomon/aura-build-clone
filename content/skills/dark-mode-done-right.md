---
name: Dark Mode Done Right
description: Designs dark themes with layered near-black surfaces, softened text, desaturated accents, and proper contrast, plus an optional flash-free light and dark toggle.
author: Ravi Menon
source: nightshift/theme-skills
tags: [dark-mode, color, theming]
views: 13600
uses: 880
---

## Surfaces

- Never use pure black. Page background: `zinc-950` (#09090b) or `neutral-950`.
- Build elevation with lighter surfaces, not shadows: page `zinc-950`, cards `zinc-900`, raised elements and menus `zinc-800`.
- Separate surfaces with 1px borders at `border-white/10`. Use `border-white/5` for subtle dividers.
- Add `color-scheme: dark` on `<html>` so scrollbars and form controls match.

## Text

- Never use pure white for body text. Headings `zinc-50` or `white/90`, body `zinc-400`, captions `zinc-500`.
- Check contrast: body text at least 4.5:1 on its actual surface. `zinc-400` on `zinc-900` passes; `zinc-500` on `zinc-900` does not for body text.
- Use slightly lighter weights than in light mode. Light text on dark backgrounds looks heavier.

## Accent colors

- Shift accents up the scale: use the 300–400 shades (`indigo-400`, `lime-300`) where a light theme would use 500–600.
- Keep saturated color to small areas: buttons, links, highlights, a single glow.
- Text on an accent-colored button is dark (`zinc-950`) when the accent is light.

## Glow and depth

- Replace drop shadows with soft glows: a blurred accent shape at 10–20% opacity behind the hero, `blur-3xl`.
- Use one glow per viewport at most.
- Inner highlight on cards: `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]`.

## Images

- Dim bright photos slightly: `brightness-90`.
- Product screenshots should be dark-themed too. Don't place a bright white screenshot in a dark hero without a frame or a dimming overlay.
- Logos in a logo strip: monochrome `text-zinc-400` with `opacity-70`.

## Optional toggle

- Only add a toggle if the brief asks for one or for both themes.
- Set `tailwind.config = { darkMode: 'class' }` and write light classes with `dark:` overrides.
- Prevent a flash: an inline script in `<head>` adds `dark` to `<html>` before paint, using `localStorage.theme` or falling back to `prefers-color-scheme`.
- The toggle is a `<button>` with `aria-pressed` and an accessible label.

## Don't

- Don't invert a light design and call it done. Rebuild the hierarchy.
- Don't use colored body text.
- Don't use large areas of saturated color or pure #000 backgrounds.
- Don't put thin 200–300 weight text below 18px on dark surfaces.
