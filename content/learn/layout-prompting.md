---
title: Layout prompting
description: Describe structure, grids, and spacing so the page is arranged the way you picture it.
group: Prompting
order: 5
icon: layout-grid
---

Layout is the skeleton of a page: what goes where, how big it is, and how it changes on smaller screens. It's also the easiest thing to describe precisely, once you know the words.

## Vocabulary that works

- **Section**: one horizontal band of the page, like the hero, features, or pricing.
- **Container**: the max width content sits inside. Narrow (`max-w-3xl`) feels like an article. Wide (`max-w-7xl`) feels like a product site.
- **Columns / grid**: content side by side. "3-column grid on desktop, 1 column on mobile."
- **Split**: two columns of content. "1-1 split" is equal halves. "2-1 split" is a wider left column.
- **Bento grid**: tiles of different sizes in one grid, like a bento box. Great for feature sections.
- **Sidebar**: a narrow column beside the main content.
- **Full-bleed**: content that goes edge to edge, ignoring the container.
- **Sticky**: stays in place while you scroll, like a nav bar or a side image.
- **Above the fold**: what's visible before scrolling.
- **Spacing / rhythm**: the vertical space between and inside sections. Consistent spacing makes a page feel designed.

## Anatomy of a strong layout prompt

```
Layout: max-w-6xl container. Hero is a 1-1 split, headline and CTAs on the left, a product mockup on the right; it stacks on mobile with the mockup below. Features use a bento grid: one large tile spanning 2 columns and 2 rows, four small tiles around it. Pricing is 3 equal columns with the middle plan highlighted. Generous vertical spacing, about 96px between sections on desktop.
```

It covers the container, how each key section is arranged, what happens on mobile, and spacing.

## Before and after

Before:

```
Put the features in a nice layout.
```

After:

```
Show the features as a bento grid: a large tile on the left with a dashboard screenshot, and two stacked tiles on the right. Below that, a row of three equal tiles. On mobile, one column.
```

Before:

```
Make the hero better.
```

After:

```
Make the hero full height with the headline centered, a short subhead under it, two buttons side by side, and a wide product screenshot below that overlaps the next section.
```

## Using the Prompt Builder

The **Layout** section turns choices into precise lines:

- **Web or Mobile** sets the platform.
- **Layout type** sets the kind of page or section: Landing Page, Hero, Features, Pricing, Testimonials, Dashboard, Login, Blog, FAQ, Footer, and more.
- **Layout configuration** sets the arrangement: Card, List, Table, Sidebar Left or Right, 1-1, 2-1 and 1-2 Splits, 1-1-1 Equal, several bento grids (1/3 2/3, 2/3 1/3, 1×4, Feature Bento), 3-3 Grid, Header Focus, Carousel, Modal, and more.

The **Framing** section presents the result in a frame: Full Screen, Card, Browser, Mac App, or Clay Web for web, and iPhone, Android, iPad, or Clay Mobile for mobile.

## Say what happens on mobile

Desktop layouts don't shrink on their own. The model makes pages responsive by default, but it helps to be explicit about anything important:

```
On mobile, stack the split hero with the image first, turn the 3-column features into a horizontal swipe row, and collapse the nav into a menu button.
```

Then check with the device toggles in the editor: tablet (834px) and mobile (390px).

## Layout edits in Design mode

Some layout fixes are quicker by hand:

- **Move up / Move down** to reorder sections or cards.
- **Duplicate** to add another card, then edit its text.
- **Delete** to drop a section.
- Edit **Tailwind classes** to change columns (`md:grid-cols-3` to `md:grid-cols-4`) or spacing (`py-16` to `py-24`).

For anything bigger, select the section and use **Edit this element with AI**.

## Common mistakes

- **Too many sections.** A focused page with six strong sections beats one with fourteen.
- **Every section the same.** Three centered text blocks in a row feel flat. Alternate splits, grids, and full-width bands.
- **Forgetting mobile.** A 4-column grid needs a plan for 390px.
- **Bento grids with text-only tiles.** Bento tiles look best when each one has a visual: a screenshot, a chart, or an icon cluster.
