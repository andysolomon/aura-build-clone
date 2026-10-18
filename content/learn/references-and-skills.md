---
title: References & skills
description: Point the model at templates, components, skills, design systems, and images.
group: Getting started
order: 7
icon: at-sign
---

Words only go so far. When you want a specific look or a specific way of working, give the model something to follow. There are four ways to do that: `@` references, skills, design systems, and images.

## `@` references

Press the **`@`** button in the composer to attach references. You can attach:

- **Templates and components**: up to **2** at a time. Their HTML is sent to the model as a visual reference.
- **Skills**: up to 4. Their instructions are added to your request.

Reference pages are treated as inspiration for layout and quality. The model is told not to copy their brand or their copy, so you get the structure and feel, not a clone.

Good ways to use template and component references:

```
Use the attached template's hero and pricing layout, but for a dog-walking app with a warm, friendly style.
```

```
Add a testimonials section that follows the attached component.
```

> Tip: Name what you want from the reference. "Use its bento feature grid" works better than "make it like this."

## Skills

A skill is a reusable set of instructions written for the model, such as an accessibility checklist, a motion system, or copywriting rules. Browse them on the Skills page (`/skills`). Each skill has its own page at `/skills/:slug` that shows its instructions.

Attach a skill with `@` and the model follows it while it builds or edits the page. Skills are best for things you'd otherwise repeat in every prompt:

- quality rules, like "every button needs hover, focus, and pressed states"
- craft systems, like motion timing or a type scale
- checklists, like accessibility or SEO

You can attach several skills at once. Pick ones that don't contradict each other. A "maximal motion" skill and a "strict performance budget" skill will pull in opposite directions.

## Design systems

The **Design System** picker in the composer offers six presets, each written as a DESIGN.md:

- Mono Minimal
- Midnight Glow
- Editorial Serif
- Electric Lime
- Warm Organic
- Swiss Bold

When you pick one, its palette, typography, and component guidance are treated as **binding**. That makes design systems the most reliable way to get a consistent look across several pages.

Browse them on the Design Systems page (`/design-systems`), where you can also copy any preset's DESIGN.md to use elsewhere.

## Images

Attach up to **4 images** with the paperclip button, or paste or drag and drop them into the composer. The model treats them as visual references: screenshots, mood boards, sketches, or a page you like.

```
Match the layout and spacing of the attached screenshot, but use my product's copy and a dark theme.
```

Cursor can't receive attached images. If your prompt depends on an image, choose a different model.

## Which one should I use?

| You want... | Use |
| --- | --- |
| A consistent palette and type | A design system |
| A specific layout or section | A template or component reference |
| The model to follow rules or a process | A skill |
| To match something that isn't in the app | An image |

They combine well. A typical strong request uses a design system for the look, a template reference for the structure, one or two skills for quality, and a short, specific prompt for the content.

## Common mistakes

- **Attaching references without saying why.** Tell the model what to take from each one.
- **Conflicting instructions.** If a design system says serif headings, don't also ask for a sans-serif headline font.
- **Too many references.** Two templates or components is the limit for a reason. More reference HTML means more for the model to reconcile.
