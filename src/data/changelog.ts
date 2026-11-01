export type ChangeKind = "new" | "improved" | "fixed";

export interface Release {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: { kind: ChangeKind; text: string }[];
}

/** Release history of this clone, newest first. */
export const RELEASES: Release[] = [
  {
    version: "0.8.0",
    date: "2026-11-01",
    title: "Agentic interfaces",
    summary: "Build the interface an AI agent lives in: streaming threads, tool calls, approvals, sources and artifacts, simulated with a scripted run you can click through.",
    changes: [
      { kind: "new", text: "Agent UI page with starter briefs and a kit of 14 components, also available as @ references." },
      { kind: "new", text: "Agent UI section in the Prompt Builder: pick a surface, message parts and run behavior, with a live preview." },
      { kind: "new", text: "Agentic interfaces skill, attached automatically when a brief asks for a chat, copilot or agent interface." },
      { kind: "improved", text: "The prompt enhancer has an Agent interface project type, and the offline demo builds a working agent app for agent briefs." },
    ],
  },
  {
    version: "0.7.0",
    date: "2026-11-01",
    title: "A bigger library",
    summary: "Eight new landing page templates and 28 new components, all original and ready to remix, copy or @-reference.",
    changes: [
      { kind: "new", text: "Templates for team planning, edge deploys, skincare, a motion portfolio, guided treks, a seafood kitchen, coworking and a strength club." },
      { kind: "new", text: "Components in every category, including a command palette, 3D team carousel, multi-step onboarding form, event ticket and usage-based pricing slider." },
      { kind: "improved", text: "Longer pages can be @-referenced in full." },
    ],
  },
  {
    version: "0.5.0",
    date: "2026-10-18",
    title: "Real screenshots and web access",
    summary: "Show your actual product in generated pages, and let the model read the live web when you want it to.",
    changes: [
      { kind: "new", text: "Import website URL: screenshot a live site (desktop and mobile) and have the page embed the real screenshots." },
      { kind: "new", text: "Web access toggle: read-only web search and fetch for Claude Code, Codex, OpenCode and the Anthropic API." },
      { kind: "improved", text: "Web searches and page fetches show up in the Thinking panel while the model works." },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-10-18",
    title: "Components, assets, skills and Learn",
    summary:
      "The rest of Aura's library surface: a components library you can copy, remix or @-reference, a library of original backgrounds, agent skills the model follows, docs, a standalone prompt enhancer and this changelog.",
    changes: [
      { kind: "new", text: "Components library with previews, code, backdrop toggle and remix into a project." },
      { kind: "new", text: "Assets library: 60 original SVG backgrounds with ratio filters, PNG export and attach-to-prompt." },
      { kind: "new", text: "Agent skills: reference them with @ and their instructions are sent with your prompt." },
      { kind: "new", text: "Learn docs with an on-this-page table of contents." },
      { kind: "new", text: "Prompt enhancer tool page with project types and output styles." },
      { kind: "improved", text: "The @ menu now has Templates, Components and Skills tabs with search." },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-10-17",
    title: "Prompt Builder",
    summary: "Build precise prompts visually: layout, framing, style, typography and animation, with a live preview.",
    changes: [
      { kind: "new", text: "Prompt Builder at /create and from the first composer button." },
      { kind: "new", text: "Generated prompt lines you can toggle, a snippet library and custom lines." },
      { kind: "fixed", text: "Previews no longer wait forever if the preview bridge never reports ready." },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-10-17",
    title: "Bring your own subscription",
    summary: "Generate with the Claude Code, Codex, Cursor and OpenCode CLIs you are already signed in to. No API key needed.",
    changes: [
      { kind: "new", text: "Provider detection with a grouped, searchable model picker." },
      { kind: "new", text: "Retry with the selected model on failed or stopped generations." },
      { kind: "improved", text: "Models that fail to sign in are disabled with fix steps until you refresh." },
      { kind: "fixed", text: "Agent CLIs are terminated when the server restarts instead of running on as orphans." },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-10-17",
    title: "First release",
    summary: "The core builder: prompt to page, chat edits with versions, Design mode, code view, export and publishing.",
    changes: [
      { kind: "new", text: "Streaming generation with versions you can restore." },
      { kind: "new", text: "Design mode with inline text editing and a Tailwind inspector." },
      { kind: "new", text: "Templates gallery, DESIGN.md design systems, pricing and projects." },
      { kind: "new", text: "Publish to /s/:slug and export standalone HTML." },
    ],
  },
];
