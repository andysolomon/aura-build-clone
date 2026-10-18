---
title: Models & subscriptions
description: Use the AI plans you already pay for, and pick the right model for the job.
group: Getting started
order: 5
icon: cpu
---

This app doesn't come with its own AI. Instead, it uses the subscriptions and tools you already have: your Claude plan, your ChatGPT plan, Cursor, OpenCode, or an API key. You choose which one writes each page with the **Model** picker in the composer.

## Providers

| Provider | How it connects | Notes |
| --- | --- | --- |
| Claude Code | Your Claude Pro or Max subscription, through the `claude` CLI | Streams code live |
| Codex | Your ChatGPT plan, through the `codex` CLI | Returns the page when finished |
| Cursor | Through the `cursor-agent` CLI | Streams code live. Can't receive attached images |
| OpenCode | Through the `opencode` CLI | Any provider OpenCode is signed in to, plus its free models. Returns the page when finished |
| Anthropic API | Only if `ANTHROPIC_API_KEY` is set | |
| Demo | Built in, offline | Used when nothing else is available |

## The Model picker

- Models are **grouped by provider**.
- A **search box** filters the list.
- A **refresh button** re-detects providers. Press it after you sign in to a CLI.

If a provider is installed but not signed in, its models are greyed out with **sign-in needed**, along with steps to fix it. They stay greyed out until you press refresh.

## Setting up a provider

1. Install the provider's CLI (`claude`, `codex`, `cursor-agent`, or `opencode`).
2. Sign in to it once in a terminal, the way it normally asks you to.
3. Open the Model picker and press **refresh**.

For the Anthropic API, set the `ANTHROPIC_API_KEY` environment variable before you start the app.

## Streaming vs. finished results

- **Claude Code and Cursor** stream code into the editor as they write it, so you watch the page build.
- **Codex and OpenCode** return the whole page when they're done. A timer shows how long they've been working.

Both kinds produce the same thing in the end: one complete HTML page.

> Tip: If a generation is taking a long time or heading the wrong way, press **Stop**. The card then offers **Retry with the selected model**, so you can switch models and try again.

## Images and Cursor

You can attach up to 4 images to a prompt. Cursor can't receive attached images, so if your prompt depends on a screenshot, pick a different provider.

## Your files are safe

The app runs these CLIs headlessly in a temporary folder, with their tools disabled or read-only. They're asked for one thing, the page, and they hand it back as text. They can't read or edit your files. The only tools that can ever be turned on are read-only web search and web fetch, and only when you switch on **Web access**.

## Web access and real screenshots

By default the model can't browse, so it only knows what's in your prompt. Two options in the composer's globe menu change that:

- **Import website URL** screenshots a live site on this machine, at desktop (1440×900) and mobile (390×844) sizes. The shots are attached so the model can see your real product, and the model gets hosted links so it can put the actual screenshots in the page instead of drawing a mockup. You can import up to 2 sites per prompt.
- **Web access** lets the model search the web and read pages (read-only) while it works. Use it when you want accurate product details or copy pulled from a live site. Claude Code, Codex, OpenCode and the Anthropic API support it. Cursor can't browse, so the request runs without web access.

Even with web access on, the model still can't read or edit your files or run commands.

> Tip: combine both. Import your app's URL for the screenshots, turn on web access, and ask for a page that "uses the real screenshots and checks the live site for features."

## The Demo generator

When no provider is available, the offline Demo generator builds pages. It's not an AI model. It assembles pages from built-in pieces and understands structured edits like:

```
make it dark
use a blue accent
add pricing
remove the FAQ
headline: Ship your docs in a day
rename it to Lumen
shuffle the style
```

It's a good way to learn the editor before you connect a real model.

## Choosing a model

There's no single best model. Some practical advice:

- **For your first draft**, a model that streams (Claude Code or Cursor) is nice, because you can stop early if it's going the wrong way.
- **For a second opinion**, retry the same prompt with a different provider. Different models have different taste.
- **For edits**, any model works. Small, specific requests give the most consistent results.
- **For image-based prompts**, use a provider other than Cursor.
