---
title: Publishing & export
description: Share a live link, download the HTML, or copy the code into another project.
group: Getting started
order: 4
icon: globe
---

When a page is ready, you have two ways to get it out of the editor: **Publish** it to a link, or **Export** the code. Both buttons are at the right end of the editor's top bar.

## Publish

Press **Publish** to serve the page at `/s/<slug>`. You get a link you can open and share.

- Publishing again updates the **same link**. Make changes, press Publish, and anyone with the link sees the new version.
- The published page is the page as it is when you press Publish. Later edits don't go live until you publish again.
- The link is served by this app, so it's reachable wherever your copy of the app is reachable.

> Tip: Publish early. Having a real link makes it easy to check the page on your phone or send it to someone for feedback.

## Export

The **Export** menu has three options:

- **Download HTML** saves the page as a single `.html` file.
- **Copy code** copies the full HTML to your clipboard.
- **Open in new tab** opens the page on its own, outside the editor, so you can see it at full size.

You can also copy the code from the **Code** tab using its **Copy** button.

## What's in the file

The export is one self-contained HTML file. It loads a few things from the web:

- **Tailwind CSS** from its CDN, for all the styling
- **Google Fonts**, for the typefaces
- **Iconify**, for icons
- **picsum.photos**, for placeholder photos

That means the file works anywhere you can open a web page, with no build step. It also means it needs an internet connection to look right. Offline, it shows unstyled content.

## Before you share a page

A quick checklist:

- **Replace placeholder photos.** In Design mode, select each image and paste your own URL into **Image URL**.
- **Fix the links.** Generated buttons and nav links often point to `#`. Select each one and set its **Link URL**.
- **Read every word.** The AI writes realistic-sounding copy, but names, numbers, and quotes are made up. Swap in real ones.
- **Check every device size.** Use the desktop, tablet, and mobile toggles in the top bar.
- **Check the page title.** Open the Code tab and look at the `<title>` tag near the top.

## Moving the page into another project

Because the export is plain HTML with Tailwind classes, it's easy to reuse:

- **As a static site**: drop the downloaded file into any static host as `index.html`.
- **In a Tailwind project**: copy sections from the Code tab into your own components. The classes carry over. Remove the CDN script tag, since your project builds its own CSS.
- **Fonts and icons**: keep the Google Fonts `<link>` tags and the Iconify script, or swap them for your project's own setup.

## Updating a published page

1. Open the project from the Projects page.
2. Make your changes with prompts, Design mode, or the Code view.
3. Press **Publish** again.

The link stays the same, so there's nothing to re-share.
