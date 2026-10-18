---
name: Iconography & Logos
description: Uses one consistent Iconify icon set at fixed sizes, builds a crisp inline SVG logo mark and wordmark for the brand, and styles logo clouds so they look balanced.
author: Malik Johnson
source: glyphworks/brand-skills
tags: [icons, logos, branding, iconify]
views: 8900
uses: 410
---

## One icon set

- Use a single set for the whole page through `<iconify-icon>`. Default to `lucide:`. Use `solar:` duotone icons only if the brief asks for a richer look.
- Never mix outline and filled styles on the same page.
- Never use emoji as icons.

## Sizes

- Inline with text: 16px (`width="16"`) next to 14–16px text, 20px next to 18–20px text.
- Feature icons: 20–24px inside a 40–48px tile tinted with the accent: `flex size-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600` (swap in the page's accent).
- Align icons with text using `inline-flex items-center gap-2`. Never nudge them with margins.
- Keep one tile style for all feature icons.

## Meaning and accessibility

- Pick literal icons: `lucide:shield-check` for security, `lucide:zap` for speed, `lucide:users` for teams. Avoid abstract shapes.
- Decorative icons get `aria-hidden="true"`.
- Icon-only buttons get an `aria-label` and a 40×40px minimum hit area.

## The brand logo

- Build the logo as inline SVG: a simple geometric mark (2–3 shapes, `viewBox="0 0 32 32"`) using `currentColor`, followed by the wordmark in the heading font.
- Wordmark: semibold, `tracking-tight`, 18–20px in the nav.
- Mark and wordmark share a baseline: `flex items-center gap-2`.
- Reuse the same mark as the favicon (an inline SVG data URI) and in the footer.
- The mark must read clearly at 16px. Avoid thin strokes and fine detail.

## Logo clouds

- Use real company logos from Iconify Simple Icons (`simple-icons:stripe`, `simple-icons:linear`) only when the brief names real customers or integrations. Otherwise, build fictional wordmarks in varied fonts.
- Show 5–6 logos, all the same visual height (24–28px), not the same width.
- Make them monochrome: `text-zinc-500` with `opacity-70 hover:opacity-100 transition-opacity`.
- Label the row: "Trusted by teams at" in small muted text above it.
- For long lists, use a slow marquee with masked edges: `[mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]`.

## Don't

- Don't stretch or recolor real brand logos in brand colors on a monochrome strip.
- Don't put an icon on every heading and bullet. Icons should help scanning, not decorate.
- Don't use text-only "LOGO" placeholders.
- Don't render the brand logo as a raster image.
