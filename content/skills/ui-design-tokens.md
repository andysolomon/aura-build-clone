---
name: UI Design Tokens
description: Builds the page on a small, named token system for spacing, color, radius, type, and elevation, so every section feels like part of one product.
author: Priya Raman
source: raman/token-kit
tags: [design-system, tokens, tailwind]
views: 21300
uses: 1180
---

## Set up tokens first

- Before writing any section, define tokens in a `tailwind.config` script block under `theme.extend`.
- Declare colors as CSS variables in `:root` and map them so opacity modifiers work: `brand: 'rgb(var(--brand) / <alpha-value>)'`.
- Use semantic names, not hue names: `ink` (primary text), `muted` (secondary text), `surface` (cards), `canvas` (page), `line` (borders), `brand` (accent), `brand-ink` (text on accent).
- Use exactly one accent hue. Neutrals carry everything else.

## Spacing

- Use a 4px scale only: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 (Tailwind `1, 2, 3, 4, 6, 8, 12, 16, 24, 32`).
- Section padding: `py-20 md:py-28`. Container: `mx-auto max-w-6xl px-6`.
- Gap inside cards: `gap-4`. Gap between cards: `gap-6`. Heading to body: `mt-4`. Body to actions: `mt-8`.

## Radius

- Pick one radius family and keep it: controls `rounded-lg` (8px), cards `rounded-2xl` (16px), large media `rounded-3xl` (24px), pills `rounded-full`.
- Nested elements get a smaller radius than their parent: inner radius = outer radius minus padding.

## Type scale

- Use a 1.25 ratio: 12, 14, 16, 20, 24, 32, 40, 48, 64px.
- Map to roles: `display` (48–64px), `h2` (32–40px), `h3` (20–24px), `body` (16px), `small` (14px), `caption` (12px).
- Body line height 1.6. Display line height 1.05–1.1.

## Elevation

- Three levels only: flat (border `border-line`), raised (`shadow-sm` plus border), overlay (`shadow-xl`, for menus and modals).
- In dark themes, express elevation with lighter surfaces instead of shadows.

## Components

- Buttons: heights `h-9` (small), `h-11` (default), `h-12` (large), horizontal padding `px-4` to `px-6`.
- Inputs match default button height, `h-11`, so they align in a row.
- One primary button per view. Secondary buttons use `border-line bg-transparent`.

## Do

- Reuse the same class combination for the same role everywhere.
- Check that `ink` on `canvas` reaches at least 7:1 and `muted` on `canvas` at least 4.5:1.

## Don't

- Don't use arbitrary values like `mt-[37px]` or `text-[17px]`.
- Don't mix more than two radii in one component.
- Don't introduce a second accent color for "variety".
- Don't hardcode hex colors in class names once a token exists.
