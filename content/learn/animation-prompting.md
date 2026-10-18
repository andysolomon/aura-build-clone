---
title: Animation prompting
description: Ask for motion that feels intentional, with the right timing and no broken pages.
group: Prompting
order: 4
icon: sparkles
---

Good motion makes a page feel alive and guides the eye. Bad motion makes it feel slow, or worse, leaves content invisible. The difference is mostly in how specific you are.

## Vocabulary that works

- **Entrance / reveal**: how an element appears, often when it scrolls into view.
- **Fade, slide, scale, blur**: the basic entrance types. They combine well, like "fade and slide up 16px".
- **Stagger / sequence**: items animate one after another instead of all at once.
- **Word by word / letter by letter**: text reveals piece by piece. Best for a single headline.
- **Duration**: how long one animation takes. 0.4–0.8s feels natural for entrances.
- **Delay**: the wait before it starts. Stagger delays of 60–100ms between items look smooth.
- **Easing / timing**: the speed curve. `ease-out` feels natural for entrances. Spring and bounce add personality.
- **Iterations**: once, a few times, or infinite (loops).
- **Marquee**: a continuously scrolling row, often for logos.
- **Parallax**: background layers moving slower than the foreground while scrolling.
- **Scroll-triggered**: animations that start, or are scrubbed, by scroll position.

## Anatomy of a strong animation prompt

```
Motion: on scroll, fade and slide each section's content up 16px as it enters the viewport, 0.6s ease-out, once. Stagger cards in a grid by 80ms. Reveal the hero headline word by word. Buttons lift 2px on hover with a 150ms transition. Respect prefers-reduced-motion, and never leave content at opacity 0 if the animation doesn't run.
```

It covers what moves, how it moves, timing, a single signature moment (the headline), interaction states, and a safety rule.

## Before and after

Before:

```
Add some animations.
```

After:

```
Fade, slide and blur elements in one by one as they scroll into view, 0.7s ease-out, 100ms apart.
```

Before:

```
Make the logos move.
```

After:

```
Turn the logo strip into an infinite marquee, slow (about 30 seconds per loop), with soft faded edges on both sides. Pause it on hover.
```

## Using the Prompt Builder

The **Animation** section turns choices into exact lines:

- **Type**: fade, slide, scale, rotate, blur, 3D, and more
- **Scene**: All at once, Sequence, Word by word, or Letter by letter
- **Duration** and **delay** sliders
- **Timing**: Linear, Ease, Ease In, Ease Out, Ease In Out, Spring, or Bounce
- **Iterations**: Once, Twice, Thrice, or Infinite
- **Direction**: Normal, Reverse, Alternate, or Alternate Reverse

Press **Replay Animation** in the live preview to compare settings before you add them. The **prompt library** has ready-made motion lines too, such as masked word-by-word headline reveals, cursor-following spotlights on cards, and a sticky scroll story with GSAP ScrollTrigger.

## Signature moments

Pick one place for something memorable, usually the hero. Ideas:

```
Add a 1px beam of light that travels around the primary pill button on hover.
```

```
Add a cursor-following spotlight on the feature cards' backgrounds and borders.
```

Then keep the rest of the page calm.

## Checking your animation

- Switch to the **Preview** tab and scroll through the whole page.
- Check the mobile size with the device toggles. Large slides can push content sideways on small screens.
- If something doesn't appear at all, ask: "Make sure every animated element is visible by default and the animation only enhances it."

## Common mistakes

- **Animating everything.** If every element moves, nothing stands out.
- **Slow entrances.** Anything over about 1s makes visitors wait for content.
- **Infinite loops on content.** Loop decorative things, like a marquee or a glow, never text you're meant to read.
- **Letter-by-letter on long text.** Use it for a short headline only.
- **No fallback.** Content that starts at opacity 0 and relies on JavaScript to appear can stay invisible. Ask for animations that only enhance visible content.
- **Ignoring reduced motion.** Some people turn motion off in their system settings. Ask the model to respect `prefers-reduced-motion`.
- **Asking for a library without saying so.** Pages use small vanilla JavaScript by default. If you want GSAP or a 3D scene, ask for it by name, or attach a skill that covers it.
