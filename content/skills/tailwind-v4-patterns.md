---
name: Tailwind v4 Patterns
description: Switches the page to the Tailwind v4 browser build and writes CSS-first theme tokens with v4 utility names, so the markup ports cleanly into a modern Tailwind project.
author: Jonas Ferreira
source: forge-labs/tailwind-recipes
tags: [tailwind, css, tokens]
views: 15800
uses: 930
---

## Setup

- Load Tailwind v4 with `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>` instead of the v3 `cdn.tailwindcss.com` script. Do not load both.
- Do not write a `tailwind.config` script block. Configure everything in CSS inside `<style type="text/tailwindcss">`.

## Theme tokens with `@theme`

- Define tokens as CSS variables in an `@theme` block. Each namespace generates utilities:
  - `--color-brand-500: oklch(0.65 0.2 265);` gives `bg-brand-500`, `text-brand-500`, `border-brand-500`.
  - `--font-display: "Instrument Serif", serif;` gives `font-display`.
  - `--radius-card: 1.25rem;` gives `rounded-card`.
  - `--ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);` gives `ease-out-soft`.
- Prefer `oklch()` colors for smooth, perceptually even shade ramps.
- Reference tokens in custom CSS with `var(--color-brand-500)`.

## Custom variants and utilities

- Class-based dark mode: `@custom-variant dark (&:where(.dark, .dark *));`
- Reusable utilities: `@utility container-page { margin-inline: auto; max-width: 72rem; padding-inline: 1.5rem; }`
- Use `@layer base` only for element defaults like `html { color-scheme: light dark; }`.

## Use v4 utility names

- Shadows and radii shifted one step: write `shadow-xs` (was `shadow-sm`), `shadow-sm` (was `shadow`), `rounded-xs` (was `rounded-sm`), `rounded-sm` (was `rounded`).
- `outline-hidden` replaces `outline-none`. `ring` is 1px now; write `ring-3` for the old default.
- Gradients: `bg-linear-to-r from-brand-500 to-sky-400`. Also available: `bg-radial`, `bg-conic`.
- Opacity: always use modifiers like `bg-black/50`. Never `bg-opacity-*`.
- CSS variable shorthand: `bg-(--brand)` instead of `bg-[var(--brand)]`.
- Always set border colors explicitly (`border border-zinc-200`). The v4 default is `currentColor`.

## Patterns worth using

- Container queries: `@container` on the card wrapper, then `@md:flex-row` inside it.
- Entry transitions: `transition-opacity starting:opacity-0` for elements that appear.
- 3D: `perspective-distant`, `transform-3d`, `rotate-x-12`.
- Any spacing number works without brackets: `mt-17`, `grid-cols-15`.
- `size-10` for square icons and avatars.

## Don't

- Don't use `@apply` for whole components. Keep utilities in the markup.
- Don't use removed v3 utilities: `flex-shrink-0` (use `shrink-0`), `overflow-ellipsis` (use `text-ellipsis`), `decoration-slice` (use `box-decoration-slice`).
- Don't define colors in hex inside class names when a theme token exists.
