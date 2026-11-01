---
name: Agentic interfaces
description: Builds working AI agent and chat interfaces (threads, composers, reasoning, tool calls, approvals, sources, artifacts) as one HTML file with a believable scripted run.
author: Aura Clone
source: aura-clone/agent-ui
tags: [agent, chat, ai, interface, streaming]
views: 9800
uses: 1240
---

When the brief asks for an agent or chat interface, the page is the working interface itself. When it markets an agent product, use these patterns for its product mockups (the hero demo, feature visuals) and keep them interactive. Either way there is no backend: simulate the agent's run in vanilla JS so it feels real.

## Anatomy

- **Thread** (`role="log" aria-live="polite"`):
  - User turns are right-aligned bubbles (subtle fill, `rounded-2xl`, max-w ~75%).
  - Assistant turns have no bubble: full-width prose with headings, lists, tables and code blocks. Code blocks get a language label plus copy.
- **Message actions** under assistant turns: copy, regenerate, thumbs up/down. Under user turns: edit.
  - Regenerating adds a branch; show a `‹ 2 / 3 ›` picker.
- **Composer**: a rounded bordered card. Auto-growing textarea on top; toolbar below.
  - Left of the toolbar: attach `+`, web toggle, model chip. Right: mic, then submit.
  - Submit states: ready (arrow-up), submitted (spinner), streaming (square **stop**), error.
  - Attachments sit above the textarea as tiles with a × remove badge.
- **Empty state**: a greeting plus 3–6 suggestion pills or cards. Clicking one sends it.
- **Scroll to latest**: a round arrow button that fades in above the composer when the user scrolls up during a stream.

## Message parts (render inside the assistant turn, in order)

1. **Reasoning**: a disclosure button (brain icon, shimmering "Thinking…", chevron).
   - Opens while thinking streams and collapses when the answer starts, relabeled "Thought for 6s".
   - Body: small muted paragraphs.
2. **Tool calls**: a bordered collapsible card. Header: icon, mono tool name, status pill, chevron.
   - Body: a `PARAMETERS` micro-label with JSON, then `RESULT` (or an `ERROR` box tinted red).
   - Collapse several finished calls into "Used 3 tools ⌄".
   - While running, a one-line variant works: `icon search_docs · Searching…`.
3. **Approval** (human in the loop):
   - Inline card: "This tool wants to `refund_order #4821` ($182.00). Approve?" with Deny and Approve.
   - Resolve to a green "Approved" or orange "Denied" line with a time. The run continues or stops accordingly.
4. **Generative UI**: render tool results as real UI (weather card, metric with sparkline, table, order tracker), not raw JSON.
5. **Answer**: streamed prose.
6. **Sources**: inline citation pills after sentences (`docs.acme.dev +2`); hover or focus opens a card with title, URL and snippet. End with a "Used 4 sources ⌄" disclosure.
7. **Follow-ups**: 2–3 suggestion pills.

Optional parts:
- **Plan**: card with title, description, step checklist and a "Build ⌘↵" button.
- **Queue**: queued messages and todos; done items struck through.
- **Task**: disclosure of steps with file chips.
- **Checkpoint**: hairline with "Restore checkpoint".
- **Question**: multi-select chips, textarea, Answer disabled until input.
- **System message**: centered info, warning or error note.
- **Feedback bar**: "Was this helpful? 👍 👎".
- **Context meter**: ring plus `31%`; hover breaks down input, output, reasoning and cache tokens and cost.

## Status system (use everywhere)

| Status | Color | Icon |
|---|---|---|
| pending | zinc | `lucide:circle` |
| running / streaming | sky | spinning `lucide:loader-circle` |
| awaiting approval | amber | `lucide:clock` |
| approved | indigo | — |
| completed | emerald | `lucide:circle-check` |
| error | red | `lucide:circle-x` |
| denied | orange | `lucide:ban` |

Pills: `rounded-full px-2 py-0.5 text-[11.5px] font-medium ring-1` on a 50-tint background.

## Surfaces

- **Chat thread**: centered column, max-w 720–780px.
- **App shell**: thread-list sidebar (New thread, search, Today / Previous 7 days, hover ⋯ menu), header with a model menu, thread, composer. The sidebar becomes a drawer under 768px.
- **Copilot sidebar**: a 380–420px panel docked beside a product UI.
- **Chat + artifact split**: chat on the left; artifact on the right with tabs Preview / Code / Terminal / Tests.
  - Preview gets browser chrome (back, forward, reload, URL) and a console drawer.
- **Floating widget**: launcher bubble at bottom-right opening a ~380×600 panel; full-screen on mobile.
- **Voice agent**: animated orb with idle, listening, thinking and speaking states, live transcript with the spoken word highlighted, and mic and end buttons.
- **Workflow canvas**: dotted grid, node cards with handles, bezier SVG edges, animated dashes on the active path, zoom controls.
- **Agent console**: agent card (model, instructions, tools, output schema) beside a run-trace waterfall and token and cost stats.

## The scripted run (vanilla JS)

- Keep the run as data: an array of steps such as `{type:'reasoning', text}`, `{type:'tool', name, args, result, approval?}`, `{type:'text', text}`, `{type:'sources', items}`.
- Play the steps with an async loop:
  - `await sleep()` between steps.
  - Stream text word by word at about 25–40ms per token, with a blinking caret, then remove the caret.
- Pick the reply by keywords in the user's message, with a sensible default. Never echo the input back as the answer.
- **Stop** aborts the loop through a flag or `AbortController`. Keep the partial text and add a muted "Stopped" note.
- Keyboard:
  - Enter sends; Shift+Enter inserts a newline; Esc stops.
  - Disable submit while the input is empty.
- Stick to bottom only when the user was already near the bottom (within 80px). Never yank them while they read.
- Pre-render one complete exchange so the first paint is rich. Never show a blank thread or leave content at opacity 0.

## Craft

- Typography:
  - UI font: Geist, Inter or Manrope.
  - Mono for tool names, JSON, tokens and timers (Geist Mono or JetBrains Mono), with `tabular-nums`.
  - Body 14–15px, line-height 1.6.
- Shimmer for in-progress labels: a moving gradient highlight over muted text with `background-clip: text`.
- Accessibility:
  - Disable shimmer, pulse and slide under `prefers-reduced-motion`.
  - Disclosures are `<button aria-expanded aria-controls>`.
  - Icon-only buttons get `aria-label`.
  - Visible `focus-visible` rings.
  - Set `aria-busy="true"` on the streaming message.
- Copy reads like a real product:
  - Concrete agent names, tool names (`search_tickets`, `create_invoice`) and realistic data.
  - No lorem ipsum.
  - No "As an AI…" filler.
- One accent color, used sparingly on submit, active states and links. Neutral surfaces with 1px borders. Status colors carry meaning.
- Mobile: hide or collapse side panels, keep the composer pinned to the bottom with safe-area padding, and keep tap targets at least 40px.
