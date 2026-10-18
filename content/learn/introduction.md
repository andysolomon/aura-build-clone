---
title: Introduction
description: What this app does, how a page gets made, and where everything lives.
group: Getting started
order: 1
icon: book-open
---

This is an AI landing page builder. You describe a page in plain words, pick a model, and get back a complete page. Then you can preview it, tweak it by hand, refine it with more prompts, and publish it. It runs on your own machine and uses the AI subscriptions you already have.

## What you get

Every generation is one self-contained HTML file. It uses:

- the Tailwind CSS CDN for styling
- Google Fonts for type
- Iconify for icons
- placeholder photos from picsum.photos

Because it's a single file, there's no build step. You can download it, copy it into another project, open it in a new tab, or publish it straight from the editor.

## How a page gets made

1. Start on the Create page (`/`) and type what you want in the composer.
2. If you like, shape the request: open the Prompt Builder, pick a design system, choose a model, `@`-mention templates, components, or skills, or attach images.
3. Press `Enter` to send. You land in the editor at `/build/:id` and the page appears in the preview.
4. Keep chatting to refine it. Each result is saved as a version you can restore.
5. Polish the details in Design mode or the Code view, then Export or Publish.

> Tip: A short, specific prompt beats a long, vague one. See Tips for prompting for examples.

## The composer toolbar

From left to right:

- **Prompt Builder** (square-pen icon): a visual panel that turns layout, style, type, and animation choices into prompt lines.
- **Enhance prompt** (wand): rewrites a rough prompt into a more detailed brief.
- **Design System**: pick one of six DESIGN.md presets.
- **Model**: choose which AI model writes the page.
- **`@`**: attach templates, components, or skills as references.
- **Attach images** (paperclip): add up to 4 images. You can also paste them or drag and drop them in.
- **Send**.

`Enter` sends. `Shift+Enter` adds a new line.

## Where things live

- **Create** (`/`): the home composer. `/create` opens the same page with the Prompt Builder already open.
- **Templates** (`/templates`): 8 original templates. Open one to preview it, or press **Remix** to start a new project from it.
- **Components** (`/components`): smaller building blocks you can reference with `@`.
- **Assets** (`/assets`).
- **Skills** (`/skills`): reusable instruction sets the model follows when you attach them.
- **Design systems** (`/design-systems`): the six presets, each with a button to copy its DESIGN.md.
- **Projects** (`/projects`): everything you've made, with version counts.
- **Prompt Enhancer** (`/resources/tools/prompt-enhancer`): a standalone tool for turning rough ideas into strong prompts.
- **Learn** (`/learn`), **Changelog** (`/changelog`), and **Pricing** (`/pricing`).

Published pages live at `/s/<slug>`.

## Your files stay yours

The app talks to AI tools such as the `claude` and `codex` command-line apps. It runs them headlessly in a temporary folder with their tools disabled or read-only. They write the page and hand it back. They can't edit files on your machine.

If no AI provider is available, an offline Demo generator still builds pages, so you can try everything without signing in to anything.

## Where to go next

- **Editing designs**: a tour of the editor.
- **Models & subscriptions**: connecting your AI accounts.
- **Prompt Builder**: building prompts visually.
- **Tips for prompting**: getting better results on the first try.
