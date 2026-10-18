---
name: SEO & Meta Tags
description: Fills the head with a complete, correct set of SEO, social sharing, and structured data tags, and writes the page so its headings and links make sense to search engines.
author: Luis Ortega
source: ortega/seo-kit
tags: [seo, meta, open-graph, structured-data]
views: 7300
uses: 350
---

## Required head tags

- `<meta charset="utf-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1">` first.
- `<title>`: 50–60 characters, format "Primary benefit | Brand". Unique, no keyword stuffing.
- `<meta name="description">`: 140–160 characters, a plain-language summary that ends with a reason to click.
- `<link rel="canonical">`: use `https://example.com/` unless the brief gives a domain.
- `<meta name="robots" content="index, follow">`.
- `<meta name="theme-color">` matching the page background.
- A favicon as an inline SVG data URI that matches the logo mark: `<link rel="icon" href="data:image/svg+xml,...">`.

## Social sharing

- Open Graph: `og:type` (`website`), `og:title`, `og:description`, `og:url`, `og:image`, `og:site_name`.
- `og:image` is 1200×630. Use `https://picsum.photos/seed/<brand>/1200/630` as the placeholder and add `og:image:width` and `og:image:height`.
- Twitter card: `twitter:card` set to `summary_large_image`, plus `twitter:title` and `twitter:description`.
- OG titles can be shorter and punchier than the `<title>`. Keep them under 60 characters.

## Structured data

- Add one `<script type="application/ld+json">` block.
- Use `Organization` with `name`, `url`, and `logo` for every page.
- Add `SoftwareApplication` for apps (with `applicationCategory` and `offers`), or `Product` for physical goods.
- If the page has an FAQ section, add `FAQPage` with the exact visible questions and answers.
- Structured data must match visible content. Never mark up things that aren't on the page.

## On-page content

- One `<h1>` that contains the main topic in natural language.
- `<h2>` for each section, written as a descriptive phrase, not a single word like "Features".
- Link text describes the destination: "See pricing plans", never "Click here".
- Every `<img>` has `alt`, `width`, and `height` attributes.
- Put the main copy in HTML text, not inside images or canvas.

## Do

- Write the description and title from the visitor's point of view.
- Keep URLs in links lowercase and hyphenated.

## Don't

- Don't use `<meta name="keywords">`.
- Don't repeat the brand name more than once in the title.
- Don't hide text with `display: none` for search engines.
- Don't add `noindex` unless the brief asks for it.
