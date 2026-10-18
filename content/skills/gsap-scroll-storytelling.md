---
name: Scroll Storytelling with GSAP
description: Builds pinned, scrubbed scroll sequences with GSAP ScrollTrigger that tell the product story section by section, with mobile and reduced-motion fallbacks.
author: Theo Lindqvist
source: scrollcraft/gsap-skills
tags: [gsap, scroll, animation, storytelling]
views: 18200
uses: 1460
---

## Setup

- This skill allows two library scripts. Load them before your inline script, at the end of `<body>`:
  - `<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>`
  - `<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>`
- Call `gsap.registerPlugin(ScrollTrigger)` first.
- Load no other animation libraries.

## Structure the story

- Plan 3 to 5 chapters. Each chapter states one idea: a problem, a feature, a result.
- Build one pinned "story" section, not a page that's pinned throughout. Normal sections come before and after it.
- Keep the copy readable at every scroll position. Each chapter's headline is visible for at least 40% of its scroll distance.

## Pinning and scrubbing

- Drive each pinned section with one timeline:
  `gsap.timeline({ scrollTrigger: { trigger: "#story", start: "top top", end: "+=300%", pin: true, scrub: 1 } })`
- Put the `scrollTrigger` on the timeline, never on tweens nested inside it.
- Use `scrub: 1` for a smooth, slightly lagged follow. Use `scrub: true` only for progress bars.
- Size `end` by chapter count: about `+=100%` per chapter.
- Use `autoAlpha` instead of `opacity` so hidden layers stop receiving clicks.
- Use labels (`tl.addLabel("chapter2")`) and `snap: "labelsDirectional"` when chapters should settle.

## Visible by default

- Write the HTML and CSS so every chapter is readable with no JavaScript, stacked vertically.
- Set starting states in JavaScript with `gsap.set()`, never in CSS.

## Responsive and reduced motion

- Use `gsap.matchMedia()`:
  - `"(min-width: 768px) and (prefers-reduced-motion: no-preference)"`: full pinned timeline.
  - `"(max-width: 767px)"`: no pinning. Simple fade-up reveals per chapter, `once: true`.
  - `"(prefers-reduced-motion: reduce)"`: no scroll-driven motion at all.
- After fonts and images load, call `ScrollTrigger.refresh()` (`document.fonts.ready.then(...)` and `window.load`).

## Don't

- Don't leave `markers: true` in the output.
- Don't pin more than two sections on one page.
- Don't hijack scroll speed or disable native scrolling.
- Don't animate `top`, `left`, `width`, or `height`. Use `x`, `y`, `scale`, `rotation`, and `autoAlpha`.
- Don't put essential content only inside an animation that requires scrolling backward to see.
