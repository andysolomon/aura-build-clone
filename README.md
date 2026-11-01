<img src="assets/icon.svg" width="64" height="64" alt="">

# aura-build-clone

A working clone of [aura.build](https://www.aura.build/), the AI landing page builder. You describe a page,
Claude streams back a complete HTML + Tailwind document, and you refine it by chatting, by visual editing
in Design mode, or in the code view. When it's ready you export it or publish it to a shareable link.

The architecture was reconstructed from Aura's shipped frontend using REA; see
[docs/reverse-engineering.md](docs/reverse-engineering.md). This is an independent, educational project
and is not affiliated with Aura.

## Features

- **Create:** the home composer has a model picker with every model your subscriptions provide,
  DESIGN.md design-system presets, @-references to templates, image attachments (paste, drop or pick),
  and a prompt enhancer.
- **Prompt Builder** (`/create`, or the first composer button): about 200 visual options across
  layout, framing, style, typography and animation. Each choice becomes a precise instruction line,
  shown with a live preview. Toggle lines, pick from a snippet library or add custom lines, then
  "Add to Prompt". Pages can also be adapted from a template or pasted HTML.
- **Editor** (`/build/:id`):
  - Streaming generation with live reasoning and streaming code
  - Chat-driven edits, with every result saved as a version you can restore
  - **Design mode:** click to select an element, double-click to edit text inline, and adjust Tailwind
    classes, type size, weight and alignment. Elements can be moved, duplicated or deleted, or handed
    to the AI as a scoped edit.
  - **Code view:** syntax-highlighted source that you can also edit
  - Desktop, tablet and mobile previews, plus undo and redo
  - **Export:** download HTML, copy the code, or open it in a new tab
  - **Publish:** serves the page at `/s/:slug`; re-publishing updates the same link
- **Templates:** sixteen original templates with browse, search and filters, a detail preview, and Remix.
- **Components** (`/components`): original HTML/Tailwind components (heroes, buttons, cards, pricing,
  forms and more), each with a preview (white or black backdrop, device sizes), code view, copy,
  download, Remix, and "Use in prompt" as an `@` reference.
- **Assets** (`/assets`): 60 original procedural SVG backgrounds across 5 aspect ratios, with
  SVG/PNG download and "Attach to prompt". Regenerate them with `npm run assets`.
- **Skills** (`/skills`): agent skills (Markdown in `content/skills/`). Reference them with `@` and
  the server adds their instructions to the request.
- **Learn** (`/learn`): docs from `content/learn/`, with an "On this page" table of contents.
- **Prompt enhancer** (`/resources/tools/prompt-enhancer`) and **Changelog** (`/changelog`).
- **Projects**, **Pricing**, **DESIGN.md** systems, and light, dark and system themes.

## AI providers: use your own subscriptions

No API key is needed. The server detects these CLIs on your machine and runs them headlessly, so
each request is billed to the plan you're already signed in to:

| Provider | CLI | Sign in with | Notes |
|---|---|---|---|
| Claude Code | `claude` | `claude` (Claude Pro/Max) | Streams tokens; images supported |
| Codex | `codex` | `codex login` (ChatGPT plan) | Returns the page when finished; images supported |
| Cursor | `cursor-agent` | `cursor-agent login` | Streams tokens; no image input |
| OpenCode | `opencode` | `opencode auth login` | Any provider OpenCode is signed in to, plus its free models |
| Anthropic API | none | `ANTHROPIC_API_KEY` in `.env` | Optional, usage-billed |

Each run happens in a throwaway temp directory with tools disabled or read-only:
- Claude Code: `--tools ""`, no MCP, no user settings or hooks
- Codex: read-only sandbox
- Cursor: `ask` mode
- OpenCode: edit, bash and webfetch denied

API keys are stripped from the child environment, so Claude Code can't fall back to API billing.

Two opt-in features, both in the composer's globe menu, give the model the real world:
- **Import website URL** screenshots a site with local Chromium (desktop and mobile) into
  `data/captures/`, served at `/captures/<file>`. The shots are attached for vision, and their
  absolute URLs are given to the model so the page can embed the real screenshots.
- **Web access** turns on read-only web search and fetch for that request:
  - Claude Code: `WebFetch` and `WebSearch`, pre-approved
  - Codex: `--search`
  - OpenCode: `webfetch` allowed
  - Anthropic API: the `web_search` / `web_fetch` server tools
  - Cursor can't browse.
Models are discovered from each CLI and cached for five minutes; the refresh button in the model
picker re-detects them after you sign in. If nothing is available, the app falls back to an
**offline demo generator**, which composes pages from the prompt and supports structured edits
such as "make it dark", "use a blue accent", "add pricing", "remove the FAQ" and "headline: …".

## Running it

```bash
bun install          # or npm install
npm run dev          # API on 127.0.0.1:8787, web on 127.0.0.1:5180
```

Production build:

```bash
npm run build && npm start   # one server for the API and the built SPA
```

To view it over Tailscale: `tailscale serve --bg --https=8449 http://127.0.0.1:5180`.

## Layout

```
server/         Hono API: generation dispatch, prompts, demo generator, projects, publishing
server/providers/  One adapter per provider (claude-code, codex, cursor, opencode, anthropic) + discovery
shared/         Types shared by client and server: models, design systems, SSE protocol, project schema
src/pages/      Marketing pages: home, templates, pricing, design systems, projects
src/editor/     Editor: chat, preview frame and Design-mode bridge, inspector, code view, header
public/templates/  Original template HTML and thumbnails (re-render with `npm run thumbs`)
public/components/ Component library: HTML, thumbnails and index.json
public/assets/     Generated SVG assets (scripts/generate-assets.ts) and index.json
content/           Markdown for Learn docs and agent skills
data/           Runtime storage for projects and published pages (gitignored)
```

Every provider receives the same system prompt and request rendering (`server/prompts.ts`). The model
replies with `<summary>…</summary>` followed by the full document, which
`shared/protocol.ts#splitGeneration` parses. The Anthropic API adapter uses `client.beta.messages.stream`
with adaptive thinking, `effort: "medium"`, server-side refusal fallbacks and a cached system prompt.
