---
title: Prompt Builder
description: Build a precise prompt by picking layout, framing, style, type, and motion options.
group: Getting started
order: 6
icon: square-pen
---

The Prompt Builder is a visual panel for writing precise prompts without memorizing design vocabulary. Every choice you make becomes a plain instruction line, and you decide which lines go into your prompt.

Open it with the **Prompt Builder** button (square-pen icon) at the left end of the composer toolbar. You can also go to `/create`, which opens the home page with the builder already showing.

## How it works

1. Pick options in any of the sections below. You don't have to touch all of them.
2. Each choice adds an instruction line to **Generated Prompts**.
3. Untick any line you don't want, or add your own with the custom-line input.
4. Check the live preview.
5. Press **Add to Prompt** to send the lines to the composer. Add your brief and send.

## Start from

Adapt an existing design instead of starting blank. Pick a template, or paste HTML. This is useful when you like a structure and want new content or a new style on top of it.

## Layout

- **Web or Mobile** sets the platform. The other options change to match.
- **Layout type** is the kind of screen: Landing Page, Hero, Features, Pricing, Dashboard, Login, Blog, FAQ, and more.
- **Layout configuration** is how the content is arranged: cards, lists, tables, sidebars, splits (1-1, 2-1, 1-2), bento grids (1/3 2/3, Feature Bento, 1×4), a 3-3 grid, carousels, modals, and more.

## Agent UI

Use this section to build a working agent interface instead of a marketing page. See [Agentic interfaces](/learn/agentic-interfaces) for how these fit together.

- **Surface** is the overall shape: chat thread, app shell, copilot sidebar, chat + artifact, floating widget, voice agent, workflow canvas, or agent console.
- **Message parts** are what each reply shows: reasoning, tool calls, approvals, generative UI, sources, plans, and more. Pick as many as you like.
- **Run** sets how the scripted agent plays: when you send a message, automatically on load, or as a static snapshot.

The live preview switches to a miniature agent interface as soon as you pick a surface or a part.

## Framing

How the design is presented:

- **Web**: Full Screen, Card, Browser, Mac App, Clay Web
- **Mobile**: iPhone, Android, iPad, Clay Mobile

Framing is great for showcase shots, like a dashboard inside a browser window or an app screen inside a phone.

## Style

- **Visual style**: Flat, Outline, Minimalist, Glass, iOS, or Material
- **Theme**: Light Mode or Dark Mode
- **Accent, background, and border colors**, picked from the Tailwind palette
- **Shadow**: 15 presets, from None and Small up through soft layered shadows, Bevel, 3D, and Inner Shadow

## Typography

- **Typeface family**: sans, serif, monospace, condensed, expanded, rounded, or handwritten
- **Heading font** and **body font**
- **Sizes** for headings, subheadings, and body text, as pixel ranges
- **Heading weight**, from Ultralight to Black
- **Letter spacing**, from Tighter to Widest

## Animation

- **Type**: fade, slide, scale, rotate, blur, 3D, and more
- **Scene**: All at once, Sequence, Word by word, or Letter by letter
- **Duration** and **delay** sliders
- **Timing**: easing curves such as Ease Out, Spring, and Bounce
- **Iterations**: Once, Twice, Thrice, or Infinite
- **Direction**: Normal, Reverse, Alternate, or Alternate Reverse

Press **Replay Animation** in the preview to watch your motion settings again.

## Generated Prompts

This list is the output of the builder. Each line is a specific instruction, for example a line describing a "1-2 Split" layout or a heading font and size.

- **Untick** a line to leave it out without losing the setting.
- Use the **custom-line input** to add your own instruction to the list.
- Open the **prompt library** for reusable snippets, grouped by topic: structure, icons and brand, layout details, motion, and polish. Examples:

```
Make every section fully responsive from 375px to 1440px
Reveal headings word by word with a masked clip animation
Give every button layered hover, pressed, focus-visible and loading states
```

When it looks right, press **Add to Prompt**.

> Tip: The builder is about precision, not quantity. Three or four well-chosen lines usually beat twenty.

## Using it with other tools

- **Design systems**: if you've picked a design system, its palette and typography are treated as binding. Skip the builder's color and font options so they don't fight it, and use the builder for layout, framing, and motion instead.
- **Enhance prompt**: after adding lines, the wand can expand your brief further. Read the result before sending to make sure your lines survived.
- **`@` references**: combine builder lines with a referenced template, for example "use this layout configuration with the hero from the attached template."
- **Start from vs. `@`**: use **Start from** when you want to adapt one design closely. Use `@` when you want a design to inform a new page more loosely.
