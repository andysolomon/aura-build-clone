---
title: FAQ
description: Quick answers to the questions that come up most.
group: Reference
order: 1
icon: circle-help
---

## Do I need an API key?

No. The app uses AI subscriptions you may already have: your Claude Pro or Max plan through the `claude` CLI, your ChatGPT plan through `codex`, Cursor through `cursor-agent`, or OpenCode through `opencode`. An Anthropic API key is optional. The Anthropic API provider only shows up if `ANTHROPIC_API_KEY` is set. If nothing is available, the offline Demo generator still works.

## Why are some models greyed out with "sign-in needed"?

The app found that provider's CLI, but it isn't signed in. The picker shows steps to fix it. Sign in to the CLI in a terminal, then press the **refresh** button in the Model picker. Models stay greyed out until you refresh.

## Why don't I see code streaming in?

It depends on the provider. Claude Code and Cursor stream code as they write. Codex and OpenCode return the whole page when they finish, and a timer shows the elapsed time while you wait.

## Can the AI change files on my computer?

No. The app runs each CLI headlessly in a temporary folder, with its tools disabled or read-only. The model is asked for a page, writes it as text, and hands it back. It can't read or edit your files.

## Why did the model ignore my attached image?

Check which model you used. Cursor can't receive attached images. Switch to another provider and retry. Also check the count: you can attach up to 4 images per prompt.

## How many references can I attach with `@`?

Up to 2 templates or components, whose HTML is sent to the model as a visual reference. You can attach up to 4 skills, whose instructions are added to your request.

## What's the difference between a design system and a skill?

A **design system** is a visual spec: palette, typography, and component guidance. When you pick one, the model treats it as binding. A **skill** is a set of instructions about how to work, like an accessibility checklist or motion rules. You can use one design system and several skills together.

## How do I undo an AI change?

Every AI result is saved as a version card in the chat. Press **Restore** on the version you want to go back to. The editor's Undo and Redo (`Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`) are for manual edits you make in Design mode.

## How do I change just one part of the page?

Two ways. For small changes, use Design mode: click the element and edit its text, classes, link, or image. For bigger changes, select it and choose **Edit this element with AI**. An **Editing <tag>** chip appears in the composer, and your next prompt applies only to that element.

## What does the generated page depend on?

It's one self-contained HTML file. It loads Tailwind CSS from its CDN, fonts from Google Fonts, icons from Iconify, and placeholder photos from picsum.photos. So it needs an internet connection to look right, but no build step.

## How do I update a page I already published?

Make your changes and press **Publish** again. Publishing again updates the same `/s/<slug>` link, so there's nothing new to share.

## What is the Demo generator?

An offline page generator that's used when no AI provider is available. It isn't an AI model. It builds pages from built-in pieces and understands structured edits such as "make it dark", "use a blue accent", "add pricing", "remove the FAQ", "headline: ...", "rename it to ...", and "shuffle the style". It's a good way to learn the editor before connecting a model.
