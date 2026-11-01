---
title: Agentic interfaces
description: Build working chat, copilot and agent UIs with tool calls, approvals, sources and artifacts.
group: Prompting
order: 6
icon: bot
---

Aura Clone can build the interface an AI agent lives in, not just a page about one. The result is a single HTML file with no backend, so the agent's behavior is a **scripted run**: you send a message and it streams a believable reply, runs tools, asks for approval and cites sources.

To connect a real model later, replace the scripted run with calls to your own API. The UI stays the same.

## Three ways to start

- **Describe it.** Mention a chatbot, copilot, AI assistant, AI agent or agent interface in your prompt. The Agentic interfaces skill is attached for you.
- **Use a starter.** [Agent UI](/agent-ui) has briefs for common agents. Each one opens the composer with the prompt, a matching component and the skill attached.
- **Use the Prompt Builder.** Open the **Agent UI** section, pick a surface and the message parts you want, and see them in the live preview.

## Pick a surface

| Surface | Good for |
|---|---|
| Chat thread | A focused assistant with one conversation |
| App shell | A full product with saved threads and a model menu |
| Copilot sidebar | An assistant docked beside an existing product |
| Chat + artifact | Agents that produce code, documents or previews |
| Floating widget | Support or docs chat on top of a website |
| Voice agent | Spoken conversations with a live transcript |
| Workflow canvas | Editing multi-step agent workflows |
| Agent console | Inspecting runs, traces, tokens and cost |

## Name the message parts

A reply can be much more than text. Ask for the parts you want to see:

- **Reasoning:** shimmers "Thinking…" while it streams, then settles to "Thought for 6 seconds".
- **Tool calls:** cards with a tool name, a status pill and JSON parameters and results.
- **Approvals:** an approve or deny prompt before a sensitive action.
- **Generative UI:** tool results shown as cards, charts or tables instead of JSON.
- **Sources:** inline citation pills with hover cards and a "Used 4 sources" list.
- **Plan and queue:** a step checklist that ticks off, and queued messages and todos.
- **Branching:** regenerate creates a new version with a `‹ 2 / 2 ›` picker.
- **Context meter:** a ring showing how full the context window is, with a token and cost breakdown.

## Write the script into your prompt

The more specific the scenario, the more convincing the run. Name the agent, its tools and what happens along the way:

> Build a working support copilot for Harbor, an online homewares store. When I ask about an order, it calls `lookup_order`, shows the delivery status as a card, then asks for approval before calling `issue_refund`. If I deny, it offers store credit instead. Answers cite the help center.

Good details to include:

- **Real tool names**, such as `search_tickets` or `create_invoice`.
- **At least one thing that needs a decision**, such as an approval or a question.
- **What goes wrong**: a tool that errors, or a refund that's denied. Failure states make an interface feel real.
- **A first view:** ask for one complete exchange to be on screen when the page loads.

## Reference the kit

Use `@` in the composer to reference components from the [Agent UI kit](/agent-ui), such as **Tool Call Lifecycle** or **Chat + Artifact Workspace**. The model follows their structure and states without copying their brand. You can attach up to two at a time.

## Edit like any other page

Agent interfaces are ordinary pages, so chat edits, Design mode, the code view and publishing all work. Try:

- "Add an error state to the search tool"
- "Show the plan before the agent starts"
- "Make the thread list collapsible"
- "Replace the JSON result with a table"

Without a signed-in model, the offline demo still builds a working agent for support, coding, research or data briefs. It can restyle one with edits like "make it dark", "use a blue accent" or "rename it to Atlas".
