// Offline demo for agent briefs: a working agent app (thread list, thread, composer) whose
// replies come from a scripted run of reasoning, a tool call, a streamed answer and sources.
// Like the landing-page demo, the spec is embedded in the HTML so later edits can restyle it.

export type AgentDomain = "support" | "coding" | "research" | "data";

export interface AgentDemoSpec {
  v: 1;
  kind: "agent";
  domain: AgentDomain;
  brand: string;
  accent: string;
  dark: boolean;
}

interface Turn {
  user: string;
  thinking: string;
  tool: { name: string; args: Record<string, string | number>; result: string };
  /** Paragraphs separated by blank lines; [n] marks a citation of sources[n-1]. */
  answer: string;
  sources: { title: string; domain: string }[];
}

interface Pack {
  brand: string;
  role: string;
  greeting: string;
  suggestions: string[];
  threads: string[];
  /** turns[0] is pre-rendered; replies pick a turn by keyword, else rotate. */
  turns: Turn[];
  keywords: [RegExp, number][];
  accent: string;
}

const PACKS: Record<AgentDomain, Pack> = {
  support: {
    brand: "Harbor",
    role: "Support copilot",
    accent: "#6366f1",
    greeting: "Which customer are we helping?",
    suggestions: ["Where is order #4821?", "Refund the damaged lamp", "Summarize today's tickets", "Which customers are at risk?"],
    threads: ["Damaged lamp, order #4821", "Address change before dispatch", "Bulk discount for Nordlicht", "Late delivery, Lisbon"],
    keywords: [[/refund|money back|reply/, 1], [/ticket|summar|today|queue/, 2], [/risk|churn|unhappy/, 3]],
    turns: [
      {
        user: "Where is order #4821, and can we refund the damaged item?",
        thinking: "The customer reports a damaged item. I'll pull the order and carrier status first, then check the damaged-goods policy before proposing a refund amount.",
        tool: { name: "lookup_order", args: { order_id: "4821" }, result: "Delivered Oct 29 by UPS · 3 items · $182.00 · damage photo attached" },
        answer: "Order #4821 was delivered on October 29 by UPS, and the customer attached a photo of the cracked ceramic lamp [1].\n\nDamaged items qualify for a full refund without a return within 30 days [2], so I'd refund the lamp ($64.00) and leave the rest of the order as is. Want me to issue it and draft the reply?",
        sources: [{ title: "Order #4821 timeline", domain: "admin.harbor.shop" }, { title: "Returns and damaged goods", domain: "help.harbor.shop" }],
      },
      {
        user: "",
        thinking: "Policy allows a no-return refund for damage. I'll refund only the lamp line item and write a short, warm reply that confirms the amount and timing.",
        tool: { name: "issue_refund", args: { order_id: "4821", amount: 64, reason: "damaged_in_transit" }, result: "Refund re_9Qx2 created · $64.00 · 3–5 business days" },
        answer: "Done: $64.00 is on its way back to the customer's Visa, usually within 3–5 business days [1].\n\nDraft reply: “Hi Ana, I'm sorry the lamp arrived cracked. I've refunded $64.00 to your card, and there's no need to send it back. Thanks for the photo, it helps our packing team.” [2]",
        sources: [{ title: "Refund re_9Qx2", domain: "dashboard.stripe.com" }, { title: "Tone guide for apologies", domain: "help.harbor.shop" }],
      },
      {
        user: "",
        thinking: "I'll pull today's open tickets, cluster them by reason, and surface anything that needs a human today.",
        tool: { name: "search_tickets", args: { status: "open", since: "today" }, result: "27 open · 11 shipping · 8 returns · 5 billing · 3 product" },
        answer: "You have 27 open tickets today: 11 about shipping delays (mostly the Lisbon hub), 8 returns, 5 billing questions and 3 product questions [1].\n\nTwo need a human first: a duplicate charge of $412 and a VIP customer whose replacement is a week late [2].",
        sources: [{ title: "Open tickets, today", domain: "desk.harbor.shop" }, { title: "Lisbon hub status", domain: "status.harbor.shop" }],
      },
      {
        user: "",
        thinking: "Risk signals: repeat complaints, refunds in the last 30 days, and negative sentiment in the latest replies. I'll rank accounts by those.",
        tool: { name: "score_accounts", args: { window_days: 30, limit: 5 }, result: "5 accounts above risk 0.7 · top: Nordlicht GmbH (0.91)" },
        answer: "Five accounts look at risk this month. Nordlicht GmbH is the clearest, with three late deliveries and a frustrated last reply [1].\n\nI'd offer Nordlicht free expedited shipping on their next order and have their account manager call this week [2].",
        sources: [{ title: "Account health scores", domain: "insights.harbor.shop" }, { title: "Nordlicht GmbH conversation", domain: "desk.harbor.shop" }],
      },
    ],
  },
  coding: {
    brand: "Forge",
    role: "Coding agent",
    accent: "#10b981",
    greeting: "What should we build or fix?",
    suggestions: ["Why is the checkout test failing?", "Fix the coupon bug", "Explain the payments module", "Write tests for applyCoupon"],
    threads: ["Checkout test failing on main", "Upgrade to React 19", "Flaky auth e2e", "Add rate limiting"],
    keywords: [[/fix|patch|repair/, 1], [/explain|how does|module|architecture/, 2], [/test|coverage|spec/, 3]],
    turns: [
      {
        user: "Why is the checkout test failing on main?",
        thinking: "Run the failing spec first to get the real error, then trace the stack into the handler and look at the most recent change to that code path.",
        tool: { name: "run_tests", args: { path: "tests/checkout.spec.ts" }, result: "1 failed · expected 200, received 500 · TypeError: cannot read 'percent' of null" },
        answer: "The checkout test fails because `applyCoupon` started returning `null` for expired codes in yesterday's commit, and the order handler still reads `coupon.percent` [1].\n\nThe test uses the fixture code SPRING24, which expired on Oct 31 [2], so the request hits that path and returns a 500. Want me to guard the null and add a test for expired coupons?",
        sources: [{ title: "src/payments/coupons.ts", domain: "github.com" }, { title: "tests/fixtures/coupons.json", domain: "github.com" }],
      },
      {
        user: "",
        thinking: "Guard the null in the handler, return a 422 with a clear message, and update the fixture so the happy-path test uses a valid code.",
        tool: { name: "apply_patch", args: { files: 2, branch: "fix/expired-coupon" }, result: "2 files changed · +14 −3 · tests passing (48/48)" },
        answer: "Fixed on `fix/expired-coupon`: the handler now returns 422 “This code has expired” instead of crashing [1], and the fixture uses a code that's still valid [2].\n\nAll 48 checkout tests pass. Shall I open a pull request?",
        sources: [{ title: "src/orders/handler.ts", domain: "github.com" }, { title: "tests/fixtures/coupons.json", domain: "github.com" }],
      },
      {
        user: "",
        thinking: "Map the payments module: entry points, how coupons and taxes are applied, and where the provider client lives.",
        tool: { name: "read_files", args: { glob: "src/payments/**" }, result: "6 files · 812 lines · entry: createCheckout()" },
        answer: "Payments starts at `createCheckout()`, which prices the cart, applies coupons, then taxes, in that order [1].\n\nThe provider client is isolated in `gateway.ts`, so tests mock it and never call the network [2].",
        sources: [{ title: "src/payments/checkout.ts", domain: "github.com" }, { title: "src/payments/gateway.ts", domain: "github.com" }],
      },
      {
        user: "",
        thinking: "Cover valid, expired, unknown and stacked coupons, plus rounding on percentage discounts.",
        tool: { name: "write_file", args: { path: "tests/coupons.spec.ts" }, result: "+64 lines · 6 tests · all passing" },
        answer: "Added six tests for `applyCoupon`: valid, expired, unknown, case-insensitive, stacked and cent rounding [1].\n\nCoverage for the coupons module goes from 61% to 94% [2].",
        sources: [{ title: "tests/coupons.spec.ts", domain: "github.com" }, { title: "Coverage report", domain: "ci.forge.dev" }],
      },
    ],
  },
  research: {
    brand: "Lumen",
    role: "Research assistant",
    accent: "#f59e0b",
    greeting: "What do you want to understand today?",
    suggestions: ["How do heat pumps work in cold climates?", "Compare the top e-bike batteries", "What changed in EU AI rules?", "Summarize this week's climate news"],
    threads: ["Heat pumps below −15°C", "E-bike battery chemistry", "EU AI Act timeline", "Sleep and memory studies"],
    keywords: [[/battery|bike|compare/, 1], [/eu|law|rule|regulat/, 2], [/news|week|summar/, 3]],
    turns: [
      {
        user: "Do heat pumps still work in really cold climates?",
        thinking: "Look for field data rather than marketing claims: cold-climate COP measurements, and how backup heat is used below rated temperatures.",
        tool: { name: "web_search", args: { query: "cold climate heat pump field study COP -20C" }, result: "8 results · 3 field studies · 2 government reports" },
        answer: "Yes. Modern cold-climate heat pumps keep delivering heat down to about −25°C, though efficiency drops as it gets colder [1].\n\nField studies in Maine and Norway measured a seasonal efficiency of 2 to 3 times that of resistance heating, with backup heat used on only a handful of the coldest days [2].",
        sources: [{ title: "Cold-climate heat pump field study", domain: "nrel.gov" }, { title: "Heat pumps in Nordic homes", domain: "iea.org" }],
      },
      {
        user: "",
        thinking: "Compare by chemistry, energy density, cycle life and cold performance, using manufacturer datasheets and independent tests.",
        tool: { name: "web_search", args: { query: "e-bike battery NMC vs LFP cycle life test" }, result: "6 results · 2 independent lab tests" },
        answer: "Most e-bikes use NMC cells, which are lighter for the range, while LFP packs are heavier but last roughly twice as many cycles [1].\n\nFor daily commuting with charging every day, LFP's longer life usually wins. For long rides where weight matters, NMC is the better fit [2].",
        sources: [{ title: "Battery cycle-life lab test", domain: "batteryuniversity.com" }, { title: "E-bike pack comparison", domain: "electrek.co" }],
      },
      {
        user: "",
        thinking: "Pull the official timeline and separate obligations by risk tier and date.",
        tool: { name: "web_fetch", args: { url: "https://digital-strategy.ec.europa.eu" }, result: "Timeline page · 4 milestones" },
        answer: "The EU AI Act phases in obligations: bans on unacceptable-risk uses first, then rules for general-purpose models, then high-risk systems [1].\n\nMost companies building on existing models mainly need transparency labeling and documentation of how the model is used [2].",
        sources: [{ title: "AI Act implementation timeline", domain: "europa.eu" }, { title: "What the AI Act means for deployers", domain: "iapp.org" }],
      },
      {
        user: "",
        thinking: "Gather the week's most-cited climate stories and group them by theme.",
        tool: { name: "web_search", args: { query: "climate news this week", freshness: "7d" }, result: "24 results · 5 themes" },
        answer: "Three themes led the week: record solar additions in India, a new methane-tracking satellite, and heat-pump sales recovering in Europe [1].\n\nThe methane satellite matters most long term, because it gives regulators independent leak data for the first time [2].",
        sources: [{ title: "Weekly climate briefing", domain: "carbonbrief.org" }, { title: "Methane satellite first data", domain: "nature.com" }],
      },
    ],
  },
  data: {
    brand: "Atlas",
    role: "Analytics agent",
    accent: "#0ea5e9",
    greeting: "What do you want to know about your numbers?",
    suggestions: ["Why did signups drop last week?", "Revenue by plan this quarter", "Which features drive retention?", "Build a weekly KPI report"],
    threads: ["Signup dip, week 43", "Q4 revenue by plan", "Retention drivers", "Weekly KPI report"],
    keywords: [[/revenue|plan|quarter|mrr/, 1], [/retention|churn|feature/, 2], [/report|kpi|weekly|dashboard/, 3]],
    turns: [
      {
        user: "Why did signups drop last week?",
        thinking: "Break signups down by channel and day, then compare with the previous four weeks to isolate where the drop came from.",
        tool: { name: "run_sql", args: { query: "select channel, count(*) from signups where week = 43 group by 1" }, result: "1,284 signups (−18% WoW) · paid search −46% · organic +3%" },
        answer: "Signups fell 18% last week, and almost all of the drop came from paid search, down 46%, while organic held steady [1].\n\nThe paid-search dip lines up with the budget cap that kicked in on Tuesday, when daily spend fell from $2,400 to $900 [2].",
        sources: [{ title: "signups by channel, week 43", domain: "warehouse.atlas.dev" }, { title: "Ad spend log", domain: "ads.google.com" }],
      },
      {
        user: "",
        thinking: "Aggregate MRR by plan for the quarter and compare with last quarter.",
        tool: { name: "run_sql", args: { query: "select plan, sum(mrr) from subscriptions group by 1" }, result: "$412k MRR · Team $214k · Pro $131k · Starter $67k" },
        answer: "MRR is $412k this quarter, up 9%. Team is the largest plan at $214k and grew fastest, at 14% [1].\n\nStarter is flat at $67k, and its upgrade rate to Pro fell from 6.1% to 4.8% [2].",
        sources: [{ title: "subscriptions, Q4", domain: "warehouse.atlas.dev" }, { title: "Upgrade funnel", domain: "warehouse.atlas.dev" }],
      },
      {
        user: "",
        thinking: "Compare 60-day retention for users who adopted each feature in their first week, controlling for plan.",
        tool: { name: "run_sql", args: { query: "retention_by_feature(first_week => true)" }, result: "Shared dashboards +21pts · Alerts +12pts · Exports +2pts" },
        answer: "Users who share a dashboard in their first week retain 21 points better at 60 days, the strongest signal by far [1].\n\nAlerts add 12 points. Exports barely move retention, so they're a weaker onboarding goal [2].",
        sources: [{ title: "retention by first-week feature", domain: "warehouse.atlas.dev" }, { title: "Onboarding experiment notes", domain: "notion.so" }],
      },
      {
        user: "",
        thinking: "Assemble the core KPIs (signups, activation, MRR, churn) with week-over-week deltas, and schedule it for Monday mornings.",
        tool: { name: "create_report", args: { name: "Weekly KPIs", schedule: "Mon 08:00" }, result: "Report rep_51 created · 6 charts · emailed to #leadership" },
        answer: "Your weekly KPI report is set for Mondays at 08:00, with signups, activation, MRR, churn, NPS and support volume [1].\n\nEach chart shows the week-over-week change and flags anything that moves more than 10% [2].",
        sources: [{ title: "Report rep_51", domain: "atlas.dev" }, { title: "KPI definitions", domain: "notion.so" }],
      },
    ],
  },
};

const DOMAIN_WORDS: [AgentDomain, RegExp][] = [
  ["coding", /\b(cod(e|ing)|developer|repo|pull request|ide|debug|engineer)/],
  ["data", /\b(data|analytics?|sql|metrics?|kpi|dashboard|bi)\b/],
  ["support", /\b(support|customer|help ?desk|tickets?|service|e-?commerce|orders?)\b/],
  ["research", /\b(research|search|answer|study|knowledge|learn)\b/],
];

export const AGENT_SPEC_MARKER = /<!-- aura-demo-agent (\{.*?\}) -->/;

export function initialAgentSpec(prompt: string, found: { brand?: string; accent?: string }): AgentDemoSpec {
  const text = prompt.toLowerCase();
  const domain = DOMAIN_WORDS.find(([, pattern]) => pattern.test(text))?.[0] ?? "research";
  const pack = PACKS[domain];
  return {
    v: 1,
    kind: "agent",
    domain,
    brand: found.brand ?? pack.brand,
    accent: found.accent ?? pack.accent,
    dark: /\b(dark|night|black)\b/.test(text),
  };
}

export function readAgentSpec(html: string): AgentDemoSpec | undefined {
  const match = AGENT_SPEC_MARKER.exec(html);
  if (!match) return undefined;
  try {
    return JSON.parse(match[1]) as AgentDemoSpec;
  } catch {
    return undefined;
  }
}

/** Structured edits for the agent demo: theme, accent and brand name. */
export function applyAgentEdit(spec: AgentDemoSpec, prompt: string, accent: string | undefined): string[] {
  const notes: string[] = [];
  const text = prompt.toLowerCase();
  const rename = /(?:rename(?: it| the agent| the brand)?|call it|name it)\s+(?:to\s+)?["“]?([\w&.' -]{2,30}?)["”]?\s*$/i.exec(prompt);
  if (rename) {
    spec.brand = rename[1].trim();
    notes.push(`renamed the agent to ${spec.brand}`);
  }
  if (/\b(dark|night)\b/.test(text) && !/\blight\b/.test(text)) {
    notes.push(spec.dark ? "kept the dark theme (it was already dark)" : "switched to a dark theme");
    spec.dark = true;
  } else if (/\b(light|white|bright)\b/.test(text) && !/\bdark\b/.test(text)) {
    notes.push(spec.dark ? "switched to a light theme" : "kept the light theme (it was already light)");
    spec.dark = false;
  }
  if (accent && !rename) {
    spec.accent = accent;
    notes.push(`changed the accent color to ${accent}`);
  }
  return notes;
}

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** JSON for an inline <script> or HTML comment: "</script>" and "-->" in the data can't end it early. */
const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

function onAccent(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.62 ? "#111111" : "#ffffff";
}

export function renderAgentDemo(spec: AgentDemoSpec): string {
  const pack = PACKS[spec.domain];
  const brand = esc(spec.brand);
  const theme = spec.dark
    ? { bg: "#09090b", surface: "#111113", raised: "#18181b", subtle: "rgba(255,255,255,.06)", border: "rgba(255,255,255,.09)", fg: "#fafafa", muted: "#a1a1aa", faint: "#71717a" }
    : { bg: "#fafafa", surface: "#ffffff", raised: "#ffffff", subtle: "#f4f4f5", border: "#e4e4e7", fg: "#18181b", muted: "#71717a", faint: "#a1a1aa" };
  const data = { brand: spec.brand, greeting: pack.greeting, suggestions: pack.suggestions, turns: pack.turns, keywords: pack.keywords.map(([re, i]) => [re.source, i]) };
  const threads = pack.threads
    .map((t, i) => `<button class="thread w-full truncate rounded-lg px-3 py-2 text-left text-[13px] ${i === 0 ? "bg-[var(--subtle)] text-[var(--fg)]" : "text-[var(--muted)] hover:bg-[var(--subtle)] hover:text-[var(--fg)]"}">${esc(t)}</button>`)
    .join("\n          ");

  return `<!DOCTYPE html>
<!-- aura-demo-agent ${safeJson(spec)} -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${brand} · ${esc(pack.role)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config = { theme: { extend: { fontFamily: { sans: ['Geist', 'ui-sans-serif', 'system-ui'], mono: ['"Geist Mono"', 'ui-monospace', 'monospace'] } } } };</script>
<script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"></script>
<style>
  :root { --bg:${theme.bg}; --surface:${theme.surface}; --raised:${theme.raised}; --subtle:${theme.subtle}; --border:${theme.border}; --fg:${theme.fg}; --muted:${theme.muted}; --faint:${theme.faint}; --accent:${spec.accent}; --on-accent:${onAccent(spec.accent)}; }
  body { background: var(--bg); color: var(--fg); -webkit-font-smoothing: antialiased; }
  .shimmer { background: linear-gradient(90deg, var(--muted) 35%, var(--fg) 50%, var(--muted) 65%) 0 0 / 250% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: shimmer 2.4s linear infinite; }
  @keyframes shimmer { from { background-position: 100% 0 } to { background-position: -150% 0 } }
  .caret::after { content: ""; display: inline-block; width: 2px; height: 1em; margin-left: 2px; vertical-align: -0.15em; background: var(--fg); animation: blink 1s steps(1) infinite; }
  @keyframes blink { 50% { opacity: 0 } }
  .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg) } }
  .rise { animation: rise .35s cubic-bezier(.2,.8,.2,1) both; } @keyframes rise { from { opacity: 0; transform: translateY(6px) } }
  .cite { display:inline-flex; align-items:center; height:18px; padding:0 6px; margin:0 2px; border-radius:999px; background:var(--subtle); border:1px solid var(--border); font-size:11px; color:var(--muted); vertical-align:1px; font-family:'Geist Mono',monospace; }
  .cite:hover { color: var(--fg); }
  @media (prefers-reduced-motion: reduce) { .shimmer, .caret::after, .spin, .rise { animation: none; } .shimmer { color: var(--muted); } }
</style>
</head>
<body class="font-sans">
<div class="flex h-[100dvh]">
  <aside id="sidebar" class="fixed inset-y-0 left-0 z-30 flex w-[264px] -translate-x-full flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform md:static md:translate-x-0">
    <div class="flex h-14 items-center gap-2.5 px-4">
      <span class="grid h-7 w-7 place-items-center rounded-lg bg-[var(--accent)] text-[var(--on-accent)]"><iconify-icon icon="lucide:sparkles" width="15"></iconify-icon></span>
      <span class="text-[14px] font-semibold tracking-tight">${brand}</span>
    </div>
    <div class="px-3">
      <button id="newChat" class="flex h-9 w-full items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-[13px] font-medium hover:bg-[var(--subtle)]"><iconify-icon icon="lucide:square-pen" width="15"></iconify-icon>New chat</button>
    </div>
    <div class="mt-5 px-4 text-[11px] font-medium uppercase tracking-wide text-[var(--faint)]">Recent</div>
    <nav class="mt-1.5 space-y-0.5 overflow-y-auto px-2" aria-label="Threads">
          ${threads}
    </nav>
    <div class="mt-auto flex items-center gap-2.5 border-t border-[var(--border)] p-3 text-[12.5px]">
      <span class="grid h-7 w-7 place-items-center rounded-full bg-[var(--subtle)] font-medium">JR</span>
      <span class="min-w-0"><span class="block truncate font-medium">Jordan Reyes</span><span class="block truncate text-[var(--muted)]">${esc(pack.role)}</span></span>
    </div>
  </aside>
  <div id="scrim" class="fixed inset-0 z-20 hidden bg-black/40 md:hidden"></div>

  <main class="flex min-w-0 flex-1 flex-col">
    <header class="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
      <div class="flex items-center gap-2">
        <button id="menu" class="grid h-8 w-8 place-items-center rounded-lg hover:bg-[var(--subtle)] md:hidden" aria-label="Open threads"><iconify-icon icon="lucide:menu" width="18"></iconify-icon></button>
        <span class="text-[14px] font-medium">${brand} <span class="text-[var(--muted)]">· ${esc(pack.role)}</span></span>
      </div>
      <span class="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[11.5px] text-[var(--muted)]"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>demo-model</span>
    </header>

    <div id="scroller" class="relative min-h-0 flex-1 overflow-y-auto">
      <div id="thread" role="log" aria-live="polite" class="mx-auto w-full max-w-[760px] space-y-7 px-4 py-8"></div>
      <button id="toLatest" class="pointer-events-none sticky bottom-3 mx-auto grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--raised)] opacity-0 shadow-lg transition-opacity" aria-label="Scroll to latest"><iconify-icon icon="lucide:arrow-down" width="16"></iconify-icon></button>
    </div>

    <div class="shrink-0 px-4 pb-4">
      <form id="composer" class="mx-auto w-full max-w-[760px] rounded-2xl border border-[var(--border)] bg-[var(--raised)] p-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,.18)] focus-within:border-[var(--muted)]">
        <label for="input" class="sr-only">Message ${brand}</label>
        <textarea id="input" rows="1" placeholder="Message ${brand}…" class="block max-h-48 w-full resize-none bg-transparent px-2.5 py-2 text-[14.5px] outline-none placeholder:text-[var(--faint)]"></textarea>
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-1 text-[var(--muted)]">
            <button type="button" class="grid h-8 w-8 place-items-center rounded-lg hover:bg-[var(--subtle)] hover:text-[var(--fg)]" aria-label="Attach file"><iconify-icon icon="lucide:plus" width="17"></iconify-icon></button>
            <button type="button" id="web" aria-pressed="false" class="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12.5px] hover:bg-[var(--subtle)] hover:text-[var(--fg)]"><iconify-icon icon="lucide:globe" width="15"></iconify-icon>Search</button>
          </div>
          <button id="send" type="submit" disabled class="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition hover:opacity-90 disabled:opacity-35" aria-label="Send message"><iconify-icon id="sendIcon" icon="lucide:arrow-up" width="17"></iconify-icon></button>
        </div>
      </form>
      <p class="mx-auto mt-2 max-w-[760px] text-center text-[11.5px] text-[var(--faint)]">Demo run: replies are scripted. Enter to send, Shift+Enter for a new line, Esc to stop.</p>
    </div>
  </main>
</div>
<script>
const DATA = ${safeJson(data)};
const thread = document.getElementById('thread');
const scroller = document.getElementById('scroller');
const input = document.getElementById('input');
const send = document.getElementById('send');
const sendIcon = document.getElementById('sendIcon');
const toLatest = document.getElementById('toLatest');
let running = false, stopped = false, nextTurn = 1;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const nearBottom = () => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 80;
const follow = (force) => { if (force || nearBottom()) scroller.scrollTop = scroller.scrollHeight; };
function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
function format(text, sources) {
  return text.split(/\\n\\n/).map((p) => '<p>' + escapeHtml(p)
    .replace(/\`([^\`]+)\`/g, '<code class="rounded bg-[var(--subtle)] px-1 font-mono text-[13px]">$1</code>')
    .replace(/\\[(\\d)\\]/g, (m, n) => { const s = sources[n - 1]; return s ? '<a href="#" class="cite" title="' + escapeHtml(s.title) + '">' + escapeHtml(s.domain) + '</a>' : ''; }) + '</p>').join('');
}
function userBubble(text) {
  return el('<div class="rise flex justify-end"><div class="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-[var(--subtle)] px-4 py-2.5 text-[14.5px] leading-relaxed">' + escapeHtml(text) + '</div></div>');
}
function assistantShell() {
  return el('<div class="rise space-y-3" aria-busy="true">'
    + '<button class="reason flex items-center gap-2 text-[13px] text-[var(--muted)] hover:text-[var(--fg)]" aria-expanded="false"><iconify-icon icon="lucide:brain" width="15"></iconify-icon><span class="label shimmer">Thinking…</span><iconify-icon class="chev transition-transform" icon="lucide:chevron-down" width="14"></iconify-icon></button>'
    + '<div class="reason-body hidden border-l-2 border-[var(--border)] pl-3 text-[13px] leading-relaxed text-[var(--muted)]"></div>'
    + '<div class="tool hidden overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"></div>'
    + '<div class="answer space-y-3 text-[14.5px] leading-[1.65]"></div>'
    + '<div class="after hidden"></div></div>');
}
function toolCard(tool, state) {
  const badge = state === 'done'
    ? '<span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11.5px] font-medium text-emerald-600 ring-1 ring-emerald-600/20"><iconify-icon icon="lucide:circle-check" width="12"></iconify-icon>Completed</span>'
    : '<span class="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11.5px] font-medium text-sky-600 ring-1 ring-sky-600/20"><iconify-icon class="spin" icon="lucide:loader-circle" width="12"></iconify-icon>Running</span>';
  return '<button class="tool-head flex w-full items-center justify-between gap-3 px-3 py-2.5" aria-expanded="false"><span class="flex min-w-0 items-center gap-2"><iconify-icon icon="lucide:wrench" width="14" class="text-[var(--muted)]"></iconify-icon><span class="truncate font-mono text-[12.5px]">' + tool.name + '</span>' + badge + '</span><iconify-icon icon="lucide:chevron-down" width="14" class="text-[var(--muted)]"></iconify-icon></button>'
    + '<div class="tool-body hidden space-y-2 border-t border-[var(--border)] p-3"><div class="text-[10.5px] font-medium uppercase tracking-wide text-[var(--faint)]">Parameters</div><pre class="overflow-x-auto rounded-lg bg-[var(--subtle)] p-2.5 font-mono text-[12px]">' + escapeHtml(JSON.stringify(tool.args, null, 2)) + '</pre>'
    + (state === 'done' ? '<div class="text-[10.5px] font-medium uppercase tracking-wide text-[var(--faint)]">Result</div><p class="font-mono text-[12px] text-[var(--muted)]">' + escapeHtml(tool.result) + '</p>' : '') + '</div>';
}
function finish(node, turn, seconds) {
  node.removeAttribute('aria-busy');
  const label = node.querySelector('.reason .label');
  label.classList.remove('shimmer');
  label.textContent = 'Thought for ' + seconds + (seconds === 1 ? ' second' : ' seconds');
  const after = node.querySelector('.after');
  after.classList.remove('hidden');
  after.innerHTML = '<div class="flex flex-wrap items-center gap-1 text-[var(--muted)]">'
    + ['copy:Copy', 'refresh-cw:Regenerate', 'thumbs-up:Good response', 'thumbs-down:Bad response'].map((a) => { const p = a.split(':'); return '<button class="act grid h-7 w-7 place-items-center rounded-md hover:bg-[var(--subtle)] hover:text-[var(--fg)]" data-act="' + p[0] + '" aria-label="' + p[1] + '"><iconify-icon icon="lucide:' + p[0] + '" width="14"></iconify-icon></button>'; }).join('')
    + '<details class="ml-2 text-[12.5px]"><summary class="cursor-pointer list-none text-[var(--accent)]">Used ' + turn.sources.length + ' sources</summary><ul class="mt-2 space-y-1">' + turn.sources.map((s, i) => '<li class="flex items-center gap-2"><span class="font-mono text-[11px] text-[var(--faint)]">' + (i + 1) + '</span>' + escapeHtml(s.title) + ' <span class="text-[var(--faint)]">' + escapeHtml(s.domain) + '</span></li>').join('') + '</ul></details></div>';
}
function renderComplete(turn) {
  thread.appendChild(userBubble(turn.user));
  const node = assistantShell();
  node.querySelector('.reason-body').textContent = turn.thinking;
  const tool = node.querySelector('.tool');
  tool.innerHTML = toolCard(turn.tool, 'done');
  tool.classList.remove('hidden');
  node.querySelector('.answer').innerHTML = format(turn.answer, turn.sources);
  thread.appendChild(node);
  finish(node, turn, 4);
}
async function streamText(target, text) {
  const words = text.split(/(\\s+)/);
  let out = '';
  target.classList.add('caret');
  for (const w of words) {
    if (stopped) break;
    out += w;
    target.textContent = out;
    follow();
    await sleep(w.trim() ? 28 : 0);
  }
  target.classList.remove('caret');
  return out;
}
function pickTurn(text) {
  const lower = text.toLowerCase();
  for (const [source, index] of DATA.keywords) if (new RegExp(source).test(lower)) return DATA.turns[index];
  const turn = DATA.turns[nextTurn];
  nextTurn = nextTurn % (DATA.turns.length - 1) + 1;
  return turn;
}
function setRunning(on) {
  running = on;
  sendIcon.setAttribute('icon', on ? 'lucide:square' : 'lucide:arrow-up');
  send.setAttribute('aria-label', on ? 'Stop' : 'Send message');
  send.disabled = !on && !input.value.trim();
}
async function run(text) {
  const empty = document.getElementById('empty');
  if (empty) empty.remove();
  thread.appendChild(userBubble(text));
  follow(true);
  const turn = pickTurn(text);
  const node = assistantShell();
  thread.appendChild(node);
  stopped = false;
  setRunning(true);
  const started = Date.now();
  const body = node.querySelector('.reason-body');
  const reason = node.querySelector('.reason');
  body.classList.remove('hidden');
  reason.setAttribute('aria-expanded', 'true');
  await streamText(body, turn.thinking);
  body.classList.add('hidden');
  reason.setAttribute('aria-expanded', 'false');
  const thought = Math.max(1, Math.round((Date.now() - started) / 1000));
  const label = reason.querySelector('.label');
  label.classList.remove('shimmer');
  label.textContent = 'Thought for ' + thought + (thought === 1 ? ' second' : ' seconds');
  const tool = node.querySelector('.tool');
  if (!stopped) {
    tool.innerHTML = toolCard(turn.tool, 'running');
    tool.classList.remove('hidden');
    follow();
    await sleep(1100);
    tool.innerHTML = toolCard(turn.tool, 'done');
  }
  const answer = node.querySelector('.answer');
  const p = document.createElement('p');
  answer.appendChild(p);
  const said = await streamText(p, turn.answer);
  if (stopped) {
    answer.insertAdjacentHTML('beforeend', '<p class="text-[12.5px] text-[var(--faint)]">Stopped</p>');
    p.textContent = said;
  } else {
    answer.innerHTML = format(turn.answer, turn.sources);
  }
  finish(node, turn, thought);
  setRunning(false);
  follow();
}
function emptyState() {
  thread.innerHTML = '<div id="empty" class="rise pt-[12vh] text-center"><h1 class="text-[26px] font-semibold tracking-tight">' + escapeHtml(DATA.greeting) + '</h1><div class="mx-auto mt-6 grid max-w-[560px] gap-2 sm:grid-cols-2">'
    + DATA.suggestions.map((s) => '<button class="suggest rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left text-[13.5px] hover:bg-[var(--subtle)]">' + escapeHtml(s) + '</button>').join('') + '</div></div>';
}
document.getElementById('composer').addEventListener('submit', (e) => {
  e.preventDefault();
  if (running) { stopped = true; return; }
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  input.style.height = '';
  run(text);
});
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 192) + 'px';
  if (!running) send.disabled = !input.value.trim();
});
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('composer').requestSubmit(); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && running) stopped = true; });
thread.addEventListener('click', (e) => {
  const t = e.target.closest('button, a');
  if (!t) return;
  if (t.classList.contains('cite')) { e.preventDefault(); return; }
  if (t.classList.contains('suggest')) { run(t.textContent); return; }
  if (t.classList.contains('reason')) {
    const body = t.nextElementSibling;
    const open = body.classList.toggle('hidden') === false;
    t.setAttribute('aria-expanded', String(open));
    t.querySelector('.chev').style.transform = open ? 'rotate(180deg)' : '';
    return;
  }
  if (t.classList.contains('tool-head')) {
    const open = t.nextElementSibling.classList.toggle('hidden') === false;
    t.setAttribute('aria-expanded', String(open));
    return;
  }
  if (t.dataset.act === 'copy') {
    const text = t.closest('[aria-live] > div').querySelector('.answer').innerText;
    navigator.clipboard && navigator.clipboard.writeText(text);
    t.innerHTML = '<iconify-icon icon="lucide:check" width="14"></iconify-icon>';
    setTimeout(() => { t.innerHTML = '<iconify-icon icon="lucide:copy" width="14"></iconify-icon>'; }, 1200);
  } else if (t.dataset.act === 'thumbs-up' || t.dataset.act === 'thumbs-down') {
    t.classList.toggle('text-[var(--accent)]');
  } else if (t.dataset.act === 'refresh-cw' && !running) {
    const prev = t.closest('[aria-live] > div').previousElementSibling;
    if (prev) run(prev.innerText.trim());
  }
});
scroller.addEventListener('scroll', () => {
  const show = !nearBottom();
  toLatest.style.opacity = show ? '1' : '0';
  toLatest.style.pointerEvents = show ? 'auto' : 'none';
});
toLatest.addEventListener('click', () => scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' }));
document.getElementById('newChat').addEventListener('click', () => { if (!running) emptyState(); });
const sidebar = document.getElementById('sidebar'), scrim = document.getElementById('scrim');
const drawer = (open) => { sidebar.classList.toggle('-translate-x-full', !open); scrim.classList.toggle('hidden', !open); };
document.getElementById('menu').addEventListener('click', () => drawer(true));
scrim.addEventListener('click', () => drawer(false));
const web = document.getElementById('web');
web.addEventListener('click', () => { const on = web.getAttribute('aria-pressed') !== 'true'; web.setAttribute('aria-pressed', String(on)); web.classList.toggle('text-[var(--accent)]', on); });
renderComplete(DATA.turns[0]);
</script>
</body>
</html>`;
}
