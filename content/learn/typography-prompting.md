---
title: Typography prompting
description: The words and patterns that get type looking deliberate instead of default.
group: Prompting
order: 2
icon: type
---

Type does most of the work on a landing page. When the model picks fonts on its own, you often get something safe and forgettable. A few specific words fix that.

## Vocabulary that works

- **Typeface**: name it. "Inter", "Instrument Serif", "Space Grotesk", "JetBrains Mono". Fonts load from Google Fonts, so any Google Fonts family name works.
- **Family**: sans, serif, monospace, condensed, expanded, rounded, handwritten.
- **Display vs. body**: display type is the big headline. Body is everything you read in paragraphs.
- **Weight**: 200 (ultralight) to 900 (black). Use the number or the name.
- **Tracking** (letter spacing): tight for large headlines, wide for small uppercase labels.
- **Leading** (line height): tight (1.0–1.1) for headlines, relaxed (1.5–1.7) for body text.
- **Measure** (line length): 60–75 characters per line is comfortable to read.
- **Eyebrow**: a small uppercase label above a heading.
- **Scale**: how big the jump is between sizes. Big jumps feel editorial. Small jumps feel like product UI.

## Anatomy of a strong typography prompt

```
Typography: headings in Instrument Serif, regular weight, 64–80px on desktop and 40px on mobile, tight tracking (-0.025em), line height 1.05. Body in Inter 16–18px, line height 1.6, max 65 characters per line. Small uppercase eyebrow labels above each section heading in Inter Medium 12px with wide tracking (0.1em).
```

It names the fonts, sizes, weights, and spacing, and adds one detail (the eyebrow) that gives the page character.

## Before and after

Before:

```
Use nice modern fonts.
```

After:

```
Use Space Grotesk for headings (semibold, tight tracking) and Inter for body text. Make the hero headline very large: about 72px on desktop, 40px on mobile.
```

Before:

```
Make the text look more premium.
```

After:

```
Switch headings to Playfair Display at regular weight, make them one size larger, and add more space between paragraphs. Keep the body font.
```

## Pairings to try

- **Serif display + sans body**: Instrument Serif + Inter, or Playfair Display + Manrope. Editorial and calm.
- **Grotesk + mono**: Space Grotesk + JetBrains Mono for labels and numbers. Technical, good for developer tools.
- **One family, weight contrast**: Geist Bold headings with Geist Regular body. Clean and product-focused.
- **Condensed headlines**: Barlow Condensed in uppercase. Bold and sporty.
- **Rounded**: Nunito or Quicksand. Friendly, good for consumer and kids' products.

Keep it to two families. A third (usually a mono) is fine for small labels and numbers only.

## Using the Prompt Builder

The **Typography** section of the Prompt Builder writes these lines for you. You can pick a typeface family, heading and body fonts, heading, subheading, and body sizes as pixel ranges (headings go from 20–32px up to 64–80px), heading weight from Ultralight to Black, and letter spacing from Tighter (-0.05em) to Widest (0.1em).

## Fixing type after generation

For one element, use Design mode. Select it and use **Smaller / Larger**, **Bold**, and alignment under Typography, or edit its Tailwind classes directly (for example `text-6xl` to `text-7xl`, or add `tracking-tight`).

For the whole page, prompt it:

```
Make all headings two sizes bigger and body text one size bigger.
```

```
Use tabular numbers in the pricing and stats sections.
```

## Common mistakes

- **Too many fonts.** Three display faces on one page reads as indecision.
- **Thin weights for small text.** 200–300 weights look elegant in a 72px headline and fragile in 14px body text.
- **Tight tracking on small text**, or wide tracking on big headlines. It's usually the other way around.
- **Long passages in all caps.** Save uppercase for short labels.
- **Centering long paragraphs.** Center a headline and a one-line subhead. Left-align anything longer.
- **Fighting the design system.** If a preset is selected, its typography takes priority. Leave fonts out of the prompt, or don't pick a design system.
