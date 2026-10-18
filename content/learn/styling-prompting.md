---
title: Styling prompting
description: How to ask for color, surfaces, borders, and shadows the model can actually follow.
group: Prompting
order: 3
icon: palette
---

Style is where vague prompts hurt most. "Make it look nice" gets you the average of every landing page. Specific color names, surfaces, and effects get you a point of view.

## Vocabulary that works

- **Palette**: the set of colors on the page. A good one has a neutral base, one accent, and maybe one supporting color.
- **Neutral base**: the grays everything sits on. Tailwind's neutrals each have a temperature: `slate` (cool, blue), `zinc` (cool, neutral), `neutral` (pure gray), `stone` (warm).
- **Accent**: the color for buttons, links, and highlights. Name a Tailwind color and shade, like `indigo-500` or `lime-400`.
- **Surface**: the background of a card or panel, as opposed to the page.
- **Border**: thin lines that separate things. `1px` borders at low opacity (`white/10`, `black/5`) look refined.
- **Radius**: how round corners are. Sharp (`rounded-none`), soft (`rounded-xl`), pill (`rounded-full`).
- **Elevation**: how "lifted" something looks, through shadows or lighter surfaces.
- **Visual styles**: flat, outline, minimalist, glass (frosted, blurred backgrounds), iOS, material.

## Anatomy of a strong style prompt

```
Dark theme. Page background zinc-950, cards zinc-900 with a 1px white/10 border and rounded-2xl corners. Text zinc-100 for headings, zinc-400 for body. One accent: lime-400, used only for the primary button, links, and small highlights. No drop shadows; use a soft lime glow behind the hero mockup instead.
```

It covers the base, surfaces, borders, radius, text colors, a single accent with rules for where it goes, and one signature effect.

## Before and after

Before:

```
Make it more colorful.
```

After:

```
Keep the white background, but add a soft violet-to-sky gradient behind the hero, give feature icons violet-100 tiles with violet-600 icons, and make the primary button violet-600.
```

Before:

```
Make it look like Apple.
```

After:

```
Light theme with a stone-50 background, lots of whitespace, large centered headlines, product shots on rounded-3xl surfaces, very subtle shadows, and a single blue-600 accent for links.
```

## Design systems do this for you

The **Design System** picker has six presets: Mono Minimal, Midnight Glow, Editorial Serif, Electric Lime, Warm Organic, and Swiss Bold. Each one's palette and component guidance is treated as binding, so you get a consistent style without describing it.

Pick a preset when you want consistency across pages. Describe style yourself when you want something the presets don't cover.

## Using the Prompt Builder

The **Style** section lets you pick a visual style (Flat, Outline, Minimalist, Glass, iOS, Material), Light or Dark Mode, accent, background, and border colors from the Tailwind palette, and one of 15 shadow presets. The shadows range from standard Small to XXL, through soft layered "Beautiful" and "Light Blue" shadows, to Bevel, 3D, and Inner Shadow.

## Styling edits

Small style changes are often faster in Design mode: select the element and edit its Tailwind classes (`bg-white` to `bg-stone-50`, `rounded-lg` to `rounded-2xl`).

For page-wide changes:

```
Adapt the whole page to dark mode. Keep the accent color, but use the 400 shade instead of 600 so it stays readable.
```

```
Remove all drop shadows and use 1px borders to separate cards instead.
```

## Common mistakes

- **More than one accent.** Three bright colors competing for attention means none of them win. Use one accent and let neutrals do the rest.
- **Low-contrast gray text.** `gray-400` on white looks sleek and is hard to read. Ask for readable contrast, especially for body text.
- **Mixing styles.** Glass cards, material shadows, and outline buttons on the same page look accidental. Pick one visual style.
- **Mood-only descriptions.** "Energetic" could mean anything. "Orange-500 accent on a near-black background" means one thing.
- **Pure black and pure white in dark mode.** `zinc-950` and `zinc-100` are easier on the eyes than `#000` and `#fff`.
- **Fighting a design system.** If a preset is selected, don't ask for a different palette in the same prompt.
