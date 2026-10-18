---
name: Accessibility Checklist (WCAG 2.2 AA)
description: Makes the page meet WCAG 2.2 AA, covering contrast, focus, target size, semantics, motion, and forms, and checks each item before returning the page.
author: Sofia Marchetti
source: a11y-collective/checklists
tags: [accessibility, wcag, a11y]
views: 11100
uses: 700
---

## Structure

- Set `<html lang="en">` (or the brief's language).
- Use landmarks: one `<header>`, one `<nav>` per menu with an `aria-label`, one `<main>`, one `<footer>`.
- Add a skip link as the first focusable element: `<a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>`.
- Use exactly one `<h1>`. Never skip heading levels.
- Keep DOM order the same as visual order. Don't reorder with `order-*` or `grid-flow-dense` in ways that change reading sequence.

## Color and contrast

- Body text: at least 4.5:1 against its background.
- Large text (24px and up, or 18.66px bold and up): at least 3:1.
- Icons, input borders, and focus indicators: at least 3:1 against adjacent colors.
- Check text placed over images or gradients at its lowest-contrast point. Add a scrim (`bg-black/50`) when needed.
- Never use color alone to convey meaning. Pair it with text or an icon.

## Keyboard and focus

- Every interactive element is reachable with Tab and works with Enter or Space.
- Use real `<button>` and `<a href>` elements. Never put click handlers on `<div>`.
- Visible focus on everything: `focus-visible:outline-2 focus-visible:outline-offset-2`.
- A sticky header must not cover the focused element. Add `scroll-padding-top` equal to the header height.
- Menus and dialogs close on Escape and return focus to their trigger.

## Pointer targets

- Targets are at least 24×24 CSS px. Aim for 44×44 on primary actions and mobile nav.
- Any drag interaction, like a carousel or slider, also has buttons.

## Images and icons

- Informative images get meaningful `alt` text. Decorative images get `alt=""`.
- Decorative icons get `aria-hidden="true"`. Icon-only buttons get an `aria-label`.

## Motion

- Anything that moves for more than 5 seconds, like a marquee or autoplay carousel, needs a pause control.
- Respect `prefers-reduced-motion: reduce`. Nothing flashes more than 3 times per second.

## Forms

- Every input has a visible `<label>`. Placeholders are not labels.
- Use correct `type` and `autocomplete` values (`email`, `name`, `current-password`).
- Allow pasting in all fields. No puzzle or memory tests on login pages.
- Show errors in text next to the field, linked with `aria-describedby`.

## Layout

- Content reflows at 320px wide with no horizontal scrolling.
- Text stays readable when users increase letter, word, and line spacing. Don't fix heights on text containers.

## Before returning

- Walk through each section above and fix anything that fails.
