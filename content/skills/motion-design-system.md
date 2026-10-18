---
name: Motion Design System
description: Gives every animation on the page a shared set of duration, easing, and distance tokens, with scroll reveals that never hide content and full reduced-motion support.
author: Mara Ellison
source: ellison/motion-kit
tags: [motion, animation, css]
views: 12400
uses: 640
---

## Define motion tokens

Declare these in `:root` and use them for every transition and animation:

- Durations: `--dur-instant: 100ms`, `--dur-fast: 150ms`, `--dur-base: 250ms`, `--dur-slow: 400ms`, `--dur-enter: 700ms`.
- Easing: `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` for entrances, `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)` for movement between states, `--ease-in: cubic-bezier(0.55, 0, 1, 0.45)` for exits.
- Distances: `--rise: 16px` for reveals, `--nudge: 2px` for hover lifts.

## Rules for what moves

- Animate only `transform`, `opacity`, and, sparingly, `filter: blur()`.
- Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`.
- Hover and focus feedback: `--dur-fast`. Opening menus, accordions, tabs: `--dur-base`. Scroll entrances: `--dur-enter`.
- Exits are about 30% faster than entrances.

## Scroll reveals

- Use one `IntersectionObserver` with `threshold: 0.15` and `rootMargin: "0px 0px -10% 0px"`. Reveal once, then `unobserve`.
- Gate the hidden starting state behind a class set by JavaScript: add `js` to `<html>` in the head, and style only `.js .reveal { opacity: 0; transform: translateY(var(--rise)); }`. Without JavaScript, content is visible.
- Use `animation-fill-mode: both` on keyframe animations. Never leave content at `opacity: 0`.
- Stagger siblings by 60–100ms using a `--i` index variable: `transition-delay: calc(var(--i) * 80ms)`. Cap a stagger at 6 items; reveal the rest together.

## One signature moment

- Give the hero one memorable motion: a word-by-word headline reveal, a slow gradient drift, or a mockup that settles into place.
- Keep everything else quiet and consistent.

## Loops

- Loop only decorative elements, like marquees and ambient glows. A marquee cycle is at least 20s.
- Anything that moves for more than 5 seconds needs a pause control or must pause on hover and focus.

## Reduced motion

- Wrap transforms in `@media (prefers-reduced-motion: no-preference)`.
- Under `reduce`, keep only opacity fades of 150ms or less, and stop all loops.

## Don't

- Don't use `transition-all`. List the properties.
- Don't use bounce or elastic easing on text.
- Don't delay above-the-fold content by more than 300ms.
- Don't animate every element on scroll. Animate section groups.
