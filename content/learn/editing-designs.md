---
title: Editing designs
description: A tour of the editor, from chatting and versions to the preview and top bar.
group: Getting started
order: 2
icon: pencil
---

After you send your first prompt, you land in the editor at `/build/:id`. This is where you refine a page until it's ready to ship.

## The layout

- **Chat panel** on the left: your prompts and the AI's results, in order.
- **Canvas** on the right: the Preview, Design, or Code tab.
- **Top bar** across the top, with project and page controls.

## The top bar

From left to right:

- **Back** takes you out of the editor.
- **Project title**: click it to rename the project.
- **Chats** switcher: move between the chats in this project.
- **Sidebar toggle**: hide or show the chat panel to give the canvas more room.
- **Preview / Design / Code** tabs.
- **Device toggles**: desktop, tablet (834px), and mobile (390px).
- **Undo / Redo** for manual edits (`Ctrl/Cmd+Z` and `Ctrl/Cmd+Shift+Z`).
- **Export** and **Publish**. See Publishing & export.

## Refining with chat

Type follow-up requests in the composer at the bottom of the chat panel. The model gets your current page along with the request, and it keeps everything you didn't ask to change.

Good follow-ups are small and specific:

```
Shorten the hero headline to under eight words and add a secondary "See pricing" button.
```

**Suggestion chips** above the composer offer quick next steps. Click one to use it.

While a model is working, a **Stop** button appears. Claude Code and Cursor stream code in as they write it. Codex and OpenCode show a timer with the elapsed time and return the page when they're done.

## Versions

Every AI result becomes a **version card** in the chat. Each card has a **Restore** button, so you can go back to any earlier result if a change goes the wrong way.

If a generation fails or you stop it, its card shows **Retry with the selected model**. If one model keeps struggling with a request, switch to another model first and then retry.

> Tip: Don't be afraid to experiment. Try a bold change, and if you don't like it, restore the previous version.

## Preview, Design, and Code

- **Preview** shows the page the way visitors will see it. Use the device toggles to check tablet and mobile widths.
- **Design** lets you click elements and edit them directly. See Design mode for the full guide.
- **Code** shows the page's full HTML with syntax highlighting. **Copy** copies all of it. **Edit** turns the view into a text editor. Press **Save** or `Ctrl/Cmd+S` to apply your changes.

## Manual edits vs. AI edits

There are two ways to change a page, and they work well together:

- **AI edits** (prompts) are good for structure, new sections, restyling, and rewriting copy. Each one becomes a version you can restore.
- **Manual edits** (Design mode and Code view) are good for small fixes: a word, a link, an image URL, a class. Use Undo and Redo to step through them.

A common rhythm: let the AI build the page and handle the big moves, then fix the small things yourself. It's faster than writing a prompt for a typo.

To point the AI at one specific element, select it in Design mode and choose **Edit this element with AI**. Your next prompt then applies only to that element.

## Projects

Every project is listed on the Projects page (`/projects`), with its version count. Open one to pick up where you left off. To start from a template instead, open it on the Templates page and press **Remix**. That creates a new project you can edit freely.
