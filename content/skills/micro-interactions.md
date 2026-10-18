---
name: Micro-interactions
description: Gives every interactive element considered hover, pressed, focus, and loading states with fast, consistent timing, plus a few tasteful signature effects.
author: Yuki Tanaka
source: tanaka/interaction-kit
tags: [interaction, hover, buttons, polish]
views: 14900
uses: 960
---

## Timing

- Hover and press feedback: 120–180ms, `ease-out`.
- Open and close (menus, accordions, tabs): 200–250ms.
- Transition named properties only: `transition-colors`, `transition-transform`, `transition-opacity`, or `transition-[transform,box-shadow]`. Never `transition-all`.
- Animate only `transform`, `opacity`, `color`, `background-color`, `border-color`, and `box-shadow`.

## Buttons

- Every button has four states: hover, pressed, focus-visible, and disabled. Add a loading state for form submits.
- Primary: `hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]`.
- Secondary: change border and background on hover. Don't lift.
- Focus: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2` in the accent color.
- Loading: swap the label for a spinner plus short text ("Sending…"), keep the button width fixed, set `aria-busy="true"` and `disabled`.
- Trailing arrow icons slide 2–4px right on hover: `group-hover:translate-x-1`.

## Cards and links

- Clickable cards: border shifts to a stronger color and the media scales to 1.03 over 500ms. The whole card is one link.
- Text links: animated underline using `bg-[length:0%_1px] hover:bg-[length:100%_1px] bg-no-repeat bg-left-bottom bg-gradient-to-r from-current to-current transition-[background-size]`.

## Forms

- Inputs: border and ring change on focus, 150ms.
- Validate on blur, not on every keystroke. Show success with a check icon, errors with text.
- Toggles use `role="switch"` and `aria-checked`, with the knob sliding 150ms.

## Feedback

- Copy buttons switch to "Copied" with a check icon for 1.5s, then revert.
- Accordions use `<details>` and `<summary>`, with a chevron rotating 180°.
- Pricing toggles (monthly or yearly) animate the price change with a 150ms fade, and show the saving.

## Signature effects

Use at most two on one page:

- Cursor spotlight on cards: update `--x` and `--y` CSS variables on `pointermove` inside `requestAnimationFrame`, and paint `radial-gradient(400px circle at var(--x) var(--y), rgba(255,255,255,0.08), transparent 40%)`.
- A 1px light beam traveling around a pill button's border on hover.
- Magnetic primary CTA, moving at most 6px toward the pointer.

## Accessibility

- Every hover effect has a matching `focus-visible` style.
- Under `prefers-reduced-motion: reduce`, keep color changes and drop movement.
- Disable pointer-only effects on touch devices with `@media (hover: hover)`.

## Don't

- Don't hide essential information behind hover.
- Don't make hover feedback on buttons, links, and inputs slower than 200ms. Only decorative image zooms may run longer, up to 500ms.
- Don't animate on page load what should respond to the user.
