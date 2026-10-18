---
title: Design mode
description: Click any element to edit its text, classes, links, and images, or hand it to the AI.
group: Getting started
order: 3
icon: mouse-pointer-2
---

Design mode lets you edit a generated page directly, without writing a prompt. Open it with the **Design** tab in the editor's top bar.

## Selecting elements

- **Click** any element on the page to select it. The Inspector panel shows what you can change.
- Use **select parent** to move the selection up to the element that contains it. This is handy when you click a word but meant to select the whole card.
- Press `Escape` to clear the selection.

## Editing text inline

**Double-click** any text to edit it right on the page. Type your change, then press `Enter` or `Escape` to finish.

For elements that contain only plain text, the Inspector also has a **Text** field you can edit instead.

> Tip: Inline editing is the fastest way to fix copy. Use it for headlines, button labels, and prices instead of spending a prompt on them.

## The Inspector

When an element is selected, the Inspector shows these sections:

### Typography

- **Smaller / Larger** steps the text size down or up.
- **Bold** toggles bold.
- **Align** left, center, or right.

### Tailwind classes

The element's full class list, editable. This is the most powerful control in Design mode, because every visual detail on the page is a Tailwind class. A few examples:

- `py-16` to `py-24` for more vertical space
- `rounded-xl` to `rounded-3xl` for rounder corners
- `text-zinc-500` to `text-zinc-400` for lighter text
- add `shadow-lg` to give a card some depth

### Link URL

Shown for links. Change where the link points, for example from `#` to your real sign-up page.

### Image URL

Shown for images. Swap a placeholder photo for your own image by pasting its URL.

### Element actions

- **Move up** and **Move down** reorder the element among its siblings.
- **Duplicate** makes a copy right after it. Good for adding another card, feature, or testimonial.
- **Delete** removes it.

## Editing an element with AI

Sometimes a change is too big to make by hand but too small to describe for the whole page. Select the element and choose **Edit this element with AI**.

A chip that says **Editing <tag>** (for example, `Editing section`) appears in the composer. Your next prompt is scoped to that element, and the model is told to keep its changes inside it.

```
Turn this into a three-column grid with an icon above each title.
```

```
Rewrite this testimonial so it mentions a specific result, like hours saved per week.
```

Selecting a whole section before prompting usually works better than selecting a single small element, because the model has more context to work with.

## Undo and redo

Manual edits in Design mode can be undone and redone:

- Undo: `Ctrl/Cmd+Z`
- Redo: `Ctrl/Cmd+Shift+Z`

AI edits are saved as versions instead, so use **Restore** on a version card to roll one back.

## When to use Design mode vs. a prompt

Use Design mode for:

- fixing a word, a price, or a link
- swapping an image
- nudging spacing, size, or color on one element
- reordering, duplicating, or removing items

Use a prompt for:

- adding new sections
- restyling the whole page
- rewriting lots of copy at once
- layout changes that touch many elements

Check your edits on smaller screens with the device toggles. A class change that looks right on desktop can look different at 390px.
