# Reverse engineering aura.build

Notes from analyzing aura.build's publicly shipped frontend with
[REA (Reverse Engineer Anything)](https://github.com/morluto/rea), captured 2026-10-17.
These notes informed the clone's architecture. The clone shares no code or assets with Aura.

## Method

1. Downloaded the public `index.html`, the main bundle (`main-BbdlcdLU.js`, 1.5 MB) and CSS,
   then followed chunk references until all 331 lazy-loaded JavaScript chunks (~19 MB) were local.
2. Ran REA's static analyzer over the directory, with no code executed:

   ```bash
   npx -y rea-agents@latest analyze-javascript-application /tmp/aura/site \
     --integrity-policy record-and-continue --json > rea-analysis.json
   ```

   REA parsed all 331 files (3.9M AST nodes, 0 parse failures) and produced an application
   graph (1,265 nodes, 3,525 edges) plus a semantic graph with request, response, storage and
   boundary nodes. Coverage was reported as `partial` (the semantic graph was truncated by REA's limits).
3. Followed up on REA's request and endpoint evidence with targeted string searches across the
   chunks, and captured screenshots of the live UI with Playwright.

## Findings

**Frontend stack.** A Vite-built React SPA, with Tailwind (`tailwind-merge` config is inlined),
lucide icons (one chunk per icon), react-router (102 route paths), Sandpack for React previews,
Prism for code display, `html2canvas` and `jszip` for capture and export, Babel standalone for
in-browser JSX transforms, and ffmpeg.wasm for video.

**Backend.** Supabase (project `hoirqrkdgbmvpwutwuwj`) provides auth, Postgres, storage and edge functions:

- 58 tables, including `chats`, `messages`, `projects`, `shared_code`, `components`, `assets`, `profiles`,
  `code_sessions`, `react_projects`, `canvas_workspaces`, `cms_collections` and `skills`.
- 123 RPCs, including `consume_credits`, `check_usage_limits_with_reset`, `get_chat_access_role`,
  `create_canvas_review_link` and `get_checkpoint_snapshot`.
- Direct edge functions: `code-agent`, `generate-components`, `html-to-component`, `iterate-react-component`,
  `html-generation-recovery`, `describe-image`, `auto-fill-asset-metadata`, `add-custom-domain`,
  `fetch-analytics-data` and `generate-component-metadata`.

Supporting services: a screenshot service on Fly.io (`aura-screenshot-service.fly.dev/capture-screenshot`),
a self-hosted analytics script, and an MCP server at `mcp.aura.build`.

**Generation pipeline.** The HTML editor (`html-editor/1`) routes generation through a fixed set of
step endpoints: `generate-html`, `generate-html-v2`, `generate-edits`, `generate-edits-v2`,
`continue-generation` and `describe-image`. Each request carries a `requestId` and a `stepKey`, so an
interrupted generation can be resumed ("Saved output is unavailable. No paid generation was restarted.").
Responses are either JSON or `text/event-stream`, consumed into `{ content }`. Separate steps exist for
`generate-reasoning`, `generate-metadata`, `generate-image`, `generate-video` and a `prompt-enhancer`.

**Models.** The bundle references Claude (Fable 5.1, Opus 5.5, Sonnet 5.5 and older), GPT (5.x and 6.x
variants), Gemini 3.x and Grok 4.x model IDs. Every model costs one prompt credit.

**Product surface (routes).** These include `/` (create), `/build/:chatId` and `/editor/:chatId` (HTML editor),
`/code/:sessionId` (code agent), `/react/:chatId`, `/html-to-react/:chatId`, `/canvas/:workspaceId`,
`/templates/:slug`, `/components`, `/assets`, `/skills`, `/design-systems/:slug`, `/projects`, `/pricing`,
`/share/:slug` and `/s/:slug` (published sites with CMS sub-routes), `/cms/:slug`, `/learn/:pageId`,
`/changelog/:version`, `/mcp` and `/oauth/consent`, plus around 15 SEO comparison pages (`/aura-vs-*`).

**Editor UI.** The editor has a left chat panel (Chats dropdown, Pages, panel toggle) above a composer, and a
right preview with Preview / Design / Code tabs, desktop / tablet / mobile toggles, and Export, Team and
Publish buttons. The home composer offers a prompt builder, Design System picker, model picker,
@-references, attachments, URL import and Figma import.

## What the clone implements

| Aura | Clone |
|---|---|
| Supabase tables and edge functions | Hono API (`server/`) with JSON files in `data/` |
| `generate-html` / `generate-edits` SSE steps | `POST /api/generate` streaming SSE from your Claude Code, Codex, Cursor or OpenCode sign-in (or the Anthropic API), or an offline demo generator |
| `prompt-enhancer` | `POST /api/enhance` |
| Published sites at `/s/:slug` | `POST /api/publish` and `GET /s/:slug` |
| Chat, versions and projects | Server-stored projects with full version history |
| Design mode | Click-to-select, inline text editing and a Tailwind class inspector over a postMessage bridge |
| DESIGN.md systems | Six design-system presets injected into the prompt |
| `Components` / `ComponentView` chunks | Components library and detail (preview, white/black backdrop, code, copy, download, remix) |
| `Assets` / `AssetView` chunks | Assets library of original SVG backgrounds (ratio filters, download, attach to prompt) |
| `Skills` / `SkillDetail` chunks | Agent skills referenced with `@` and injected into the request |
| `Learn`, `Changelog`, `PromptEnhancer` chunks | Learn docs, changelog, and prompt enhancer tool |
| `PromptBuilderModal` chunk | Prompt Builder with the same option sets and line wording (layout configs, framing, Tailwind shadows, type scale, animation) |
| Templates and Remix | Eight original templates with remix-into-editor |

Not cloned: auth and billing, CMS, React/Canvas/Code-agent modes, user-submitted marketplace content,
image generation and upscaling, custom domains, team collaboration, Figma export and video generation.
