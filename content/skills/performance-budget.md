---
name: Performance Budget
description: Keeps the landing page fast by capping fonts, images, scripts, and expensive effects, so it hits good Core Web Vitals on a mid-range phone.
author: Ingrid Halvorsen
source: halvorsen/perf-skills
tags: [performance, core-web-vitals, speed]
views: 5600
uses: 270
---

## Targets

- Largest Contentful Paint under 2.5s, Cumulative Layout Shift under 0.1, Interaction to Next Paint under 200ms, on a mid-range phone over 4G.
- Treat these as hard limits. Cut decoration before cutting content.

## Fonts

- At most 2 families and 4 weight files in total.
- One Google Fonts `<link>` ending in `&display=swap`, with `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` (`crossorigin`).
- Include system fallbacks in every font stack so text renders before fonts arrive.

## Images

- Request picsum images at the size they display, at most 2× that: a 400px-wide card gets `/800/600`, not `/2000/1500`.
- Every `<img>` has `width` and `height` attributes, or sits in an `aspect-*` box, so nothing shifts as it loads.
- Below the fold: `loading="lazy" decoding="async"`.
- The hero image, if any, is not lazy and gets `fetchpriority="high"`.
- At most 8 photos on the page. Use CSS gradients, SVG, and HTML mockups for decoration instead of images.
- No autoplaying video.

## Scripts

- Inline JavaScript under 5KB, at the end of `<body>`.
- No third-party scripts beyond Tailwind, Iconify, and fonts, unless another attached skill requires one. Then load it with `defer` and only one animation library.
- Use `IntersectionObserver` for reveals and lazy effects. Never run work in a `scroll` listener.
- Pointer and scroll listeners are `{ passive: true }`, and visual updates are batched in `requestAnimationFrame`.

## Expensive effects

- At most 3 elements with `backdrop-blur`, and none larger than the nav bar or a card.
- Large blurred glow shapes use a static `blur-3xl` and are never animated.
- Avoid animating `box-shadow` or `filter` on more than a few elements at once.
- No animation runs on elements outside the viewport. Pause loops when they leave view.

## DOM

- Keep the page under about 1,500 elements.
- Marquees duplicate their content once, not five times.
- Use `<details>` for FAQs rather than JavaScript accordions.

## Layout stability

- Reserve space for anything that loads late: logos, icons (set `width` on `<iconify-icon>`), and embeds.
- Don't insert banners or bars above existing content after load.

## Don't

- Don't import a library for something CSS can do: fades, hovers, marquees, accordions.
- Don't use `will-change` broadly. Apply it only during an active animation.
