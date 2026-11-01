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

# Reverse engineering agent UI libraries

Notes from studying three public agent UI libraries with REA, captured 2026-11-01. They informed
the Agent UI kit, the `agentic-interfaces` skill and the Prompt Builder's Agent UI section. The kit
was written from scratch and shares no code, copy or assets with these projects.

- [AI SDK Elements](https://elements.ai-sdk.dev)
- [assistant-ui](https://www.assistant-ui.com)
- [prompt-kit](https://www.prompt-kit.com)

## Method

1. Opened each site in local headless Chromium and ran REA's `inspect_web_page` over CDP for the
   DOM outline and accessibility tree, which gave each library's component inventory.
2. Ran `capture_browser_scenario` over 43 component and docs pages, keeping the rendered DOM and a
   1440×1000 screenshot after each step. A small script then printed tag and class trees to show
   each component's anatomy.
3. On assistant-ui's homepage, clicked one suggested prompt ("Weather in Tokyo") to watch a live
   stream. This sent one message to their public demo. Nothing else was submitted.

Scenario Evidence IDs from the REA session (the evidence bundle itself isn't checked in):

| Capture | Evidence ID |
|---|---|
| Elements, 25 pages | `ev_2a8521a2e7b3a08defd75831c0210d76e22a33bbcbd668bb6f6023ea46a2c8f8` |
| Elements, Tool page | `ev_a0665df0bfe99e0e6068f5fe4a5350e3d12619f0ed775caae38d7a7ae6a8e5b7` |
| prompt-kit, 15 pages | `ev_3ae9ceb1d8924b821196d12025ef3a1bd0e96243bc07148beb1525581e0129bf` |
| assistant-ui, home and components | `ev_475caab7245d98aafe6468624fab578a65ec8433f6646cfdd7f7a28b55583cef` |

Limits of this pass:

- Pages were captured in light mode with reduced motion, so animation timing wasn't measured.
- Some demos rendered empty in headless Chromium, including the Elements Persona (Rive) and Web
  Preview frame. Their anatomy comes from the docs text and controls, not from seeing them run.
- The Elements Canvas page shows no live preview at the top of the page, so the workflow anatomy
  comes from its docs and component names.
- No JavaScript bundles were analyzed, and no source was recovered. These findings cover rendered
  output only, not how the libraries work internally.

## Findings

**Inventory.** Elements lists 49 components in five groups: Chatbot, Code, Voice, Workflow and
Utilities. prompt-kit lists 19 components plus blocks such as "Full chat app" and "Sidebar with chat history".
assistant-ui organizes its catalog as Chat UI, Take actions, Data visualization and generative UI,
Backend and Agent tools, and advertises Streaming, Reasoning, Tools, Approval, Sources, Attachments,
Branching, Suggestions, Voice and Generative UI as what its runtime handles.

**Shared anatomy.** All three converge on the same pieces:

- **Thread:** right-aligned user bubbles, bubble-free assistant prose, and a scroll-to-latest button.
- **Composer:** a bordered card with a textarea above a toolbar of attach, model and submit. On
  assistant-ui the send button became a square stop button while streaming.
- **Reasoning:** a collapsible "Thinking…" trigger with shimmering text. Elements documents that it
  opens during streaming and closes when finished.
- **Tool call:** a collapsible card with a name, a status badge, and a parameters block. Elements
  shows seven states: Pending, Awaiting Approval, Responded, Running, Completed, Error and Denied.
- **Shimmer:** a moving gradient behind `background-clip: text`. prompt-kit's `Text Shimmer` runs at
  2 s, 4 s and 6 s durations.

**Other notes.**

- A banner on Elements said the project is moving to shadcn/ui and will be deprecated at the end of
  November 2026. The kit doesn't depend on it.
- Distribution differs from this project's. These libraries ship React components (Elements and
  prompt-kit through a shadcn-style install, assistant-ui through a CLI that copies UI source). This
  builder outputs a single HTML file, so the kit reimplements the patterns in HTML, Tailwind and
  vanilla JavaScript.

## What the clone implements

| Observed pattern | Clone |
|---|---|
| Conversation, Message, Branch, Suggestion, Scroll button | `agent-chat-thread` |
| Thread list, model selector, generative UI | `agent-app-shell` |
| Prompt input, attachments, Context, Model selector, Speech input, mentions and slash commands | `agent-prompt-composer` |
| Reasoning, Chain of Thought, Steps, Thinking Bar | `agent-reasoning-chain` |
| Tool, tool states, tool group, approval card | `agent-tool-calls` |
| Sources, Inline Citation, Source | `agent-sources-citations`, `agent-chat-widget` |
| Loader, Text Shimmer | `agent-loaders-shimmer` |
| Confirmation, Question, Checkpoint, System Message, Feedback Bar | `agent-human-in-the-loop` |
| Plan, Queue, Task | `agent-plan-queue` |
| Artifact, Web Preview, Terminal, Test Results, File Tree | `agent-artifact-workspace` |
| Agent, Schema Display, Context | `agent-run-inspector` |
| Persona, Transcription, Audio Player, Mic and Voice Selector | `agent-voice-mode` |
| Canvas, Node, Edge, Controls, Toolbar, Panel | `agent-workflow-canvas` |

The status color system, the scripted-run approach and the auto-attached skill are this project's
own design choices, not something observed in the libraries.

Not implemented: the runtime layer these libraries provide (real model streaming, backend adapters,
thread persistence, MCP). Generated agent interfaces simulate their runs with scripted JavaScript
and don't call a model. Also not built, among others: the Commit, Package Info, Sandbox, Snippet,
Environment Variables and JSX Preview components, and React output.
