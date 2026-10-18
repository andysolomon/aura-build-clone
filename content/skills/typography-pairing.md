---
name: Typography Pairing
description: Chooses a deliberate two-family type pairing from Google Fonts, sets a consistent scale with tuned tracking and leading, and loads only the weights the page uses.
author: Clara Voss
source: voss/type-lab
tags: [typography, fonts, google-fonts]
views: 10200
uses: 590
---

## Choose a pairing

Pick one pairing that fits the brief's tone, and use it everywhere:

- Editorial, premium: Instrument Serif headings with Inter body.
- Warm, literary: Fraunces headings with Work Sans body.
- Technical, developer: Space Grotesk headings with JetBrains Mono for labels and numbers, Inter for body.
- Product, neutral: Geist for everything, with Geist Mono for code and data.
- Bold, sporty: Barlow Condensed uppercase headings with Manrope body.
- Friendly, consumer: Nunito headings and body, with weight contrast.

Use two families at most. A mono is allowed as a third only for labels, numbers, and code.

## Scale

- Product pages: 1.25 ratio (16, 20, 25, 31, 39, 49, 61px).
- Editorial pages: 1.333 ratio (16, 21, 28, 38, 50, 67px).
- Hero headline: `text-5xl md:text-7xl` for product, up to `md:text-8xl` for editorial.
- Body: 16–18px. Never below 16px for paragraphs.

## Leading and tracking

- Display headings: `leading-[1.05]` and `tracking-tight` (-0.025em) at 48px and up. Serif display faces can use `tracking-normal`.
- Section headings: `leading-tight`.
- Body: `leading-relaxed` (1.625).
- Eyebrow labels: 12px, uppercase, `tracking-[0.12em]`, medium weight.
- Line length: `max-w-[65ch]` for paragraphs, `max-w-[18ch]` for hero headlines.

## Weights

- Load only what you use: at most 3 weights per family.
- Serif display: regular (400) looks more refined than bold.
- Sans display: 500–600 for clean, 700–800 for punchy. Body: 400, with 500 for emphasis.

## Loading

- One Google Fonts `<link>` with every family in it, ending in `&display=swap`.
- Add `<link rel="preconnect">` for `fonts.googleapis.com` and `fonts.gstatic.com` (with `crossorigin`).
- Register families in `tailwind.config` as `fontFamily.display` and `fontFamily.sans`, with system fallbacks.

## Details

- `text-balance` on headings, `text-pretty` on paragraphs.
- `tabular-nums` on prices, stats, and tables.
- Use real typographic characters: curly quotes, en dashes in ranges (10–50), and an ellipsis character.
- Italic serif for one emphasized word in a headline is a strong move. Use it once per page.

## Don't

- Don't pair two similar sans-serifs, like Inter with Roboto.
- Don't set long paragraphs in a display face, mono, or all caps.
- Don't center paragraphs longer than two lines.
- Don't use more than five sizes on one page.
