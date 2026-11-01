// Offline demo generator: used when no Anthropic credentials are configured.
// It infers a page spec from the prompt, renders it with design-system tokens,
// and embeds the spec in the HTML so later edits can modify it structurally.

import { DESIGN_SYSTEMS, findDesignSystem, type DesignTokens } from "../shared/design-systems";
import { DEMO_MODEL_REF } from "../shared/models";
import type { GenerateRequest, StreamEvent } from "../shared/protocol";
import { isAgenticBrief } from "./agentic";
import { applyAgentEdit, initialAgentSpec, readAgentSpec, renderAgentDemo } from "./demo-agent";
import { CATEGORY_KEYWORDS, COPY, type Category, type CopyPack } from "./demo-content";

const SECTION_IDS = ["logos", "features", "showcase", "stats", "testimonials", "pricing", "faq", "cta"] as const;
type SectionId = (typeof SECTION_IDS)[number];

interface DemoSpec {
  v: 1;
  category: Category;
  brand: string;
  headline: string;
  sub: string;
  ds: string;
  accent?: string;
  dark?: boolean;
  font?: "serif" | "sans" | "mono";
  sections: SectionId[];
}

const SPEC_MARKER = /<!-- aura-demo-spec (\{.*?\}) -->/;

const COLOR_WORDS: Record<string, string> = {
  red: "#ef4444", orange: "#f97316", amber: "#f59e0b", yellow: "#eab308", lime: "#a3e635",
  green: "#22c55e", emerald: "#10b981", teal: "#14b8a6", cyan: "#06b6d4", sky: "#0ea5e9",
  blue: "#3b82f6", indigo: "#6366f1", violet: "#8b5cf6", purple: "#a855f7", pink: "#ec4899",
  rose: "#f43f5e", gold: "#c9a227", coral: "#ff7f50", black: "#111111", terracotta: "#c2593a",
  clay: "#c26a3d", sage: "#7c9a7e", navy: "#1e3a8a", mint: "#5eead4", burgundy: "#7f1d1d", magenta: "#d946ef",
};

const SECTION_WORDS: [SectionId, RegExp][] = [
  ["pricing", /pricing|plans?|tiers?/],
  ["testimonials", /testimonials?|reviews?|quotes?/],
  ["faq", /faq|questions/],
  ["stats", /stats|numbers|metrics/],
  ["features", /features?|benefits|services/],
  ["showcase", /showcase|gallery|portfolio|work|listings|products?/],
  ["logos", /logos?|clients|press|social proof/],
  ["cta", /cta|call to action|signup|newsletter/],
];

const FONT_STACKS = {
  serif: "Instrument Serif",
  mono: "JetBrains Mono",
  sans: "Inter",
};

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

function detectCategory(text: string): Category {
  for (const [category, pattern] of CATEGORY_KEYWORDS) if (pattern.test(text)) return category;
  return "saas";
}

function detectBrand(prompt: string): string | undefined {
  const quoted = /["“']([^"”']{2,32})["”']/.exec(prompt);
  if (quoted) return quoted[1].trim();
  const named = /\b(?:called|named|brand(?:ed)? as|for)\s+([A-Z][\w&.'-]*(?:\s+[A-Z][\w&.'-]*){0,2})/.exec(prompt);
  return named?.[1].trim();
}

function detectAccent(text: string): string | undefined {
  const hex = /#[0-9a-f]{6}\b/i.exec(text);
  if (hex) return hex[0];
  for (const [word, value] of Object.entries(COLOR_WORDS)) {
    if (new RegExp(`\\b${word}\\b`).test(text)) return value;
  }
  return undefined;
}

function detectDesignSystem(text: string): string | undefined {
  const byName = DESIGN_SYSTEMS.find((d) => text.includes(d.name.toLowerCase()) || text.includes(d.id));
  if (byName) return byName.id;
  if (/\b(neon|glow|aurora|futuristic|space)\b/.test(text)) return "midnight-glow";
  if (/\b(editorial|magazine|serif|luxury|elegant)\b/.test(text)) return "editorial-serif";
  if (/\b(brutal|brutalist|swiss|bold grid)\b/.test(text)) return "swiss-bold";
  if (/\b(organic|calm|soft|earthy|natural)\b/.test(text)) return "warm-organic";
  if (/\b(minimal|clean|simple|apple-like)\b/.test(text)) return "mono-minimal";
  return undefined;
}

function initialSpec(req: GenerateRequest): DemoSpec {
  const text = req.prompt.toLowerCase();
  const category = detectCategory(text);
  const copy = COPY[category];
  const ds = findDesignSystem(req.designSystemId)?.id ?? detectDesignSystem(text) ?? copy.designSystem;
  const spec: DemoSpec = {
    v: 1,
    category,
    brand: detectBrand(req.prompt) ?? copy.brand,
    headline: copy.headline,
    sub: copy.sub,
    ds,
    sections: [...SECTION_IDS],
  };
  const accent = detectAccent(text);
  if (accent) spec.accent = accent;
  if (/\b(dark|night|black background)\b/.test(text)) spec.dark = true;
  else if (/\b(light mode|white background|bright)\b/.test(text)) spec.dark = false;
  if (/\bserif\b/.test(text) && !/sans/.test(text)) spec.font = "serif";
  if (/\bmono(space)?\b/.test(text)) spec.font = "mono";
  return spec;
}

function readSpec(html: string): DemoSpec | undefined {
  const match = SPEC_MARKER.exec(html);
  if (!match) return undefined;
  try {
    return JSON.parse(match[1]) as DemoSpec;
  } catch {
    return undefined;
  }
}

/** Applies structured edit intents to a spec and returns human-readable notes. */
function applyEdit(spec: DemoSpec, prompt: string): string[] {
  const notes: string[] = [];
  let rest = prompt;

  const headline = /(?:headline|heading|title|hero text)\s*(?:to|:|=|say|says|reads?)\s*["“]?(.+?)["”]?\s*$/i.exec(rest);
  if (headline) {
    spec.headline = headline[1];
    notes.push(`updated the headline to “${headline[1]}”`);
    rest = rest.replace(headline[0], " ");
  }
  const rename = /(?:rename(?: it| the brand)?|call it|brand name(?: to)?)\s+(?:to\s+)?["“]?([\w&.' -]{2,30}?)["”]?\s*$/i.exec(rest);
  if (rename) {
    spec.brand = titleCase(rename[1].trim());
    notes.push(`renamed the brand to ${spec.brand}`);
    rest = rest.replace(rename[0], " ");
  }
  // Quoted copy (new headline, brand) must not trigger style intents below.
  const text = rest.toLowerCase();

  const isDark = resolveTokens(spec).dark;
  if (/\b(dark|night)\b/.test(text) && !/\blight\b/.test(text)) {
    spec.dark = true;
    notes.push(isDark ? "kept the dark theme (it was already dark)" : "switched to a dark theme");
  } else if (/\b(light|white|bright)\b/.test(text) && !/\bdark\b/.test(text)) {
    spec.dark = false;
    notes.push(isDark ? "switched to a light theme" : "kept the light theme (it was already light)");
  }

  const ds = detectDesignSystem(text);
  if (ds && ds !== spec.ds) {
    spec.ds = ds;
    delete spec.dark;
    notes.push(`applied the ${findDesignSystem(ds)!.name} design system`);
  } else if (/\b(shuffle|another style|different style|new style|variation|surprise)\b/.test(text)) {
    const index = DESIGN_SYSTEMS.findIndex((d) => d.id === spec.ds);
    spec.ds = DESIGN_SYSTEMS[(index + 1) % DESIGN_SYSTEMS.length].id;
    delete spec.dark;
    delete spec.accent;
    notes.push(`restyled with ${findDesignSystem(spec.ds)!.name}`);
  }

  const accent = detectAccent(text);
  if (accent) {
    spec.accent = accent;
    notes.push(`changed the accent color to ${accent}`);
  }

  if (/\bserif\b/.test(text) && !/sans/.test(text)) {
    spec.font = "serif";
    notes.push("set display type in a serif");
  } else if (/\bmono(space)?\b/.test(text)) {
    spec.font = "mono";
    notes.push("set display type in a monospace face");
  } else if (/\bsans\b/.test(text)) {
    spec.font = "sans";
    notes.push("set display type in a sans-serif");
  }

  const removing = /\b(remove|delete|drop|hide|without|get rid of|no more)\b/.test(text);
  const adding = /\b(add|include|insert|bring back|show)\b/.test(text);
  for (const [section, pattern] of SECTION_WORDS) {
    if (!pattern.test(text)) continue;
    if (removing && spec.sections.includes(section)) {
      spec.sections = spec.sections.filter((s) => s !== section);
      notes.push(`removed the ${section} section`);
    } else if (adding && !spec.sections.includes(section)) {
      spec.sections = SECTION_IDS.filter((s) => s === section || spec.sections.includes(s));
      notes.push(`added a ${section} section`);
    } else if (adding) {
      notes.push(`left the ${section} section as is (the page already has one)`);
    }
  }

  return notes;
}

function resolveTokens(spec: DemoSpec): DesignTokens {
  const base = (findDesignSystem(spec.ds) ?? DESIGN_SYSTEMS[0]).tokens;
  let tokens: DesignTokens = { ...base };
  if (spec.dark !== undefined && spec.dark !== base.dark) {
    tokens = spec.dark
      ? { ...tokens, dark: true, bg: "#0b0b0d", surface: "#141417", text: "#f4f4f5", muted: "#a1a1aa", border: "rgba(255,255,255,0.1)" }
      : { ...tokens, dark: false, bg: "#fafafa", surface: "#ffffff", text: "#18181b", muted: "#71717a", border: "#e4e4e7" };
    if (tokens.accent === "#000000" || tokens.accent === "#18181b") tokens.accent = spec.dark ? "#fafafa" : "#18181b";
    tokens.accentText = spec.dark && (tokens.accent === "#fafafa") ? "#0b0b0d" : tokens.accentText;
  }
  if (spec.accent) {
    tokens.accent = spec.accent;
    tokens.accentText = isLight(spec.accent) ? "#0a0a0a" : "#ffffff";
  }
  if (spec.font) tokens.displayFont = FONT_STACKS[spec.font];
  return tokens;
}

function isLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

function fontLink(fonts: string[]): string {
  const families = [...new Set(fonts)]
    .map((f) => `family=${f.replace(/ /g, "+")}:${f === "Instrument Serif" ? "ital@0;1" : "wght@400;500;600;700"}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function icon(name: string, cls = ""): string {
  return `<iconify-icon icon="lucide:${name}" class="${cls}"></iconify-icon>`;
}

// ---------- sections ----------

function nav(spec: DemoSpec, c: CopyPack): string {
  return `<header class="sticky top-0 z-40 backdrop-blur-xl ds-header border-b ds-border">
  <div class="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
    <a href="#" class="flex items-center gap-2.5 font-semibold tracking-tight"><span class="h-7 w-7 ds-radius-sm ds-accent-bg grid place-items-center">${icon("sparkle", "text-sm ds-on-accent")}</span>${esc(spec.brand)}</a>
    <nav class="hidden md:flex items-center gap-8 text-sm ds-muted">${c.nav.map((n) => `<a href="#" class="hover:opacity-100 hover:ds-text transition">${n}</a>`).join("")}</nav>
    <div class="flex items-center gap-3"><a href="#" class="hidden sm:inline text-sm ds-muted">Sign in</a><a href="#cta" class="ds-btn text-sm px-4 py-2">${c.primaryCta}</a></div>
  </div>
</header>`;
}

function heroVisual(spec: DemoSpec, c: CopyPack): string {
  switch (spec.category) {
    case "saas":
    case "fintech": {
      const bars = [38, 52, 44, 63, 58, 72, 66, 81, 77, 92, 86, 98];
      return `<div class="relative mt-16 reveal">
  <div class="absolute -inset-x-10 -top-10 h-72 ds-glow blur-3xl opacity-60"></div>
  <div class="relative ds-surface border ds-border ds-radius shadow-2xl overflow-hidden">
    <div class="flex items-center gap-2 px-4 h-10 border-b ds-border"><span class="h-2.5 w-2.5 rounded-full bg-red-400/70"></span><span class="h-2.5 w-2.5 rounded-full bg-amber-400/70"></span><span class="h-2.5 w-2.5 rounded-full bg-emerald-400/70"></span><span class="ml-4 text-xs ds-muted">app.${esc(spec.brand.toLowerCase().replace(/[^a-z0-9]/g, ""))}.com/overview</span></div>
    <div class="grid md:grid-cols-[200px_1fr]">
      <aside class="hidden md:block border-r ds-border p-4 space-y-1 text-sm">${["Overview", "Reports", "Segments", "Experiments", "Settings"].map((n, i) => `<div class="px-3 py-2 rounded-lg ${i === 0 ? "ds-soft font-medium" : "ds-muted"}">${n}</div>`).join("")}</aside>
      <div class="p-6 space-y-6">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">${c.stats.map((s) => `<div class="border ds-border rounded-xl p-4"><div class="text-xs ds-muted">${s.label}</div><div class="mt-1 text-2xl font-semibold tracking-tight">${s.value}</div></div>`).join("")}</div>
        <div class="border ds-border rounded-xl p-5"><div class="flex justify-between text-sm"><span class="font-medium">Weekly growth</span><span class="ds-accent">+18.4%</span></div>
          <div class="mt-6 h-40 flex items-end gap-2">${bars.map((h, i) => `<div class="flex-1 rounded-t-md ${i > 8 ? "ds-accent-bg" : "ds-soft"}" style="height:${h}%"></div>`).join("")}</div></div>
      </div>
    </div>
  </div>
</div>`;
    }
    case "ecommerce":
      return `<div class="relative mt-14 h-[420px] grid place-items-center reveal">
  <div class="absolute inset-0 grid place-items-center select-none pointer-events-none"><span class="ds-display text-[22vw] leading-none font-bold tracking-tighter ds-outline">${esc(spec.brand.toUpperCase())}</span></div>
  <div class="relative h-80 w-80 rounded-full ds-product shadow-2xl grid place-items-center">
    <div class="h-56 w-56 rounded-full border-[18px] ds-border-strong"></div>
    <div class="absolute -left-6 top-1/2 h-28 w-16 -translate-y-1/2 rounded-3xl ds-accent-bg shadow-xl"></div>
    <div class="absolute -right-6 top-1/2 h-28 w-16 -translate-y-1/2 rounded-3xl ds-accent-bg shadow-xl"></div>
  </div>
</div>`;
    case "agency":
      return `<div class="mt-16 overflow-hidden border-y ds-border-strong py-6 reveal"><div class="marquee flex gap-12 whitespace-nowrap ds-display text-6xl md:text-8xl font-bold tracking-tighter">${[...c.features, ...c.features].map((f) => `<span>${f.title}</span><span class="ds-accent">✳</span>`).join("")}</div></div>`;
    default:
      return `<div class="mt-16 grid grid-cols-12 gap-4 reveal">
  <img src="https://picsum.photos/seed/${c.showcase.items[0].seed}/900/1100" alt="" class="col-span-7 h-[460px] w-full object-cover ds-radius">
  <div class="col-span-5 grid gap-4">
    <img src="https://picsum.photos/seed/${c.showcase.items[1].seed}/700/500" alt="" class="h-[222px] w-full object-cover ds-radius">
    <div class="h-[222px] ds-radius ds-accent-bg ds-on-accent p-6 flex flex-col justify-between"><span class="text-sm opacity-80">${esc(c.stats[0].label)}</span><span class="ds-display text-6xl">${c.stats[0].value}</span></div>
  </div>
</div>`;
  }
}

function hero(spec: DemoSpec, c: CopyPack): string {
  const centered = spec.category !== "portfolio" && spec.category !== "realestate";
  return `<section class="relative overflow-hidden">
  <div class="absolute inset-0 ds-grid pointer-events-none"></div>
  <div class="relative mx-auto max-w-7xl px-6 pt-24 pb-20 ${centered ? "text-center" : ""}">
    <a href="#" class="inline-flex items-center gap-2 rounded-full border ds-border ds-surface px-3 py-1 text-xs ds-muted reveal"><span class="h-1.5 w-1.5 rounded-full ds-accent-bg"></span>${esc(c.eyebrow)}${icon("arrow-right", "text-xs")}</a>
    <h1 class="ds-display mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02] ${centered ? "mx-auto max-w-4xl" : "max-w-4xl"} reveal">${esc(spec.headline)}</h1>
    <p class="mt-6 text-lg ds-muted ${centered ? "mx-auto" : ""} max-w-2xl reveal">${esc(spec.sub)}</p>
    <div class="mt-10 flex flex-wrap gap-3 ${centered ? "justify-center" : ""} reveal">
      <a href="#cta" class="ds-btn px-6 py-3 text-sm inline-flex items-center gap-2">${c.primaryCta}${icon("arrow-up-right")}</a>
      <a href="#features" class="px-6 py-3 text-sm ds-radius-sm border ds-border ds-surface hover:opacity-80 transition">${c.secondaryCta}</a>
    </div>
    ${heroVisual(spec, c)}
  </div>
</section>`;
}

const SECTIONS: Record<SectionId, (spec: DemoSpec, c: CopyPack) => string> = {
  logos: (_s, c) => `<section class="border-y ds-border"><div class="mx-auto max-w-7xl px-6 py-10"><p class="text-center text-xs uppercase tracking-[0.2em] ds-muted">Trusted by teams at</p><div class="mt-6 grid grid-cols-3 md:grid-cols-6 gap-6 text-center">${c.logos.map((l) => `<span class="ds-display text-lg font-semibold opacity-60">${l}</span>`).join("")}</div></div></section>`,
  features: (_s, c) => `<section id="features" class="mx-auto max-w-7xl px-6 py-24">
  <div class="max-w-2xl reveal"><p class="text-sm ds-accent font-medium">Why it works</p><h2 class="ds-display mt-3 text-4xl md:text-5xl font-semibold tracking-tight">Everything you need, nothing you don't</h2></div>
  <div class="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-px ds-border-bg border ds-border ds-radius overflow-hidden">${c.features.map((f) => `<div class="ds-surface p-8 reveal group"><div class="h-10 w-10 ds-radius-sm ds-soft grid place-items-center text-lg group-hover:scale-110 transition">${icon(f.icon)}</div><h3 class="mt-6 font-semibold">${f.title}</h3><p class="mt-2 text-sm ds-muted leading-relaxed">${f.body}</p></div>`).join("")}</div>
</section>`,
  showcase: (_s, c) => `<section class="ds-surface border-y ds-border"><div class="mx-auto max-w-7xl px-6 py-24">
  <div class="flex flex-wrap items-end justify-between gap-6 reveal"><div><h2 class="ds-display text-4xl md:text-5xl font-semibold tracking-tight">${c.showcase.title}</h2><p class="mt-3 ds-muted">${c.showcase.body}</p></div><a href="#" class="text-sm inline-flex items-center gap-1 ds-accent">View all ${icon("arrow-right")}</a></div>
  <div class="mt-12 grid md:grid-cols-3 gap-6">${c.showcase.items.map((it) => `<a href="#" class="group reveal"><div class="overflow-hidden ds-radius"><img src="https://picsum.photos/seed/${it.seed}/800/600" alt="" class="aspect-[4/3] w-full object-cover group-hover:scale-105 transition duration-700"></div><div class="mt-4 flex justify-between gap-4"><h3 class="font-medium">${it.title}</h3><span class="text-sm ds-muted">${it.meta}</span></div></a>`).join("")}</div>
</div></section>`,
  stats: (_s, c) => `<section class="mx-auto max-w-7xl px-6 py-24"><div class="grid grid-cols-2 lg:grid-cols-4 gap-10">${c.stats.map((s) => `<div class="reveal border-t ds-border-strong pt-6"><div class="ds-display text-5xl font-semibold tracking-tight">${s.value}</div><div class="mt-2 text-sm ds-muted">${s.label}</div></div>`).join("")}</div></section>`,
  testimonials: (_s, c) => `<section class="mx-auto max-w-7xl px-6 py-24">
  <h2 class="ds-display text-4xl md:text-5xl font-semibold tracking-tight max-w-xl reveal">Loved by people who care about the details</h2>
  <div class="mt-12 grid md:grid-cols-3 gap-6">${c.testimonials.map((t) => `<figure class="ds-surface border ds-border ds-radius p-8 reveal flex flex-col justify-between"><blockquote class="text-lg leading-relaxed">“${t.quote}”</blockquote><figcaption class="mt-8 flex items-center gap-3"><span class="h-10 w-10 rounded-full ds-soft grid place-items-center text-xs font-semibold">${t.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("")}</span><div><div class="text-sm font-medium">${t.name}</div><div class="text-xs ds-muted">${t.role}</div></div></figcaption></figure>`).join("")}</div>
</section>`,
  pricing: (_s, c) => `<section id="pricing" class="ds-surface border-y ds-border"><div class="mx-auto max-w-7xl px-6 py-24">
  <div class="text-center reveal"><h2 class="ds-display text-4xl md:text-5xl font-semibold tracking-tight">Simple, honest pricing</h2><p class="mt-3 ds-muted">Start small and upgrade when you're ready.</p></div>
  <div class="mt-14 grid md:grid-cols-3 gap-6 items-stretch">${c.pricing.map((p) => `<div class="reveal ds-radius p-8 flex flex-col border ${p.highlight ? "ds-accent-border ds-raise" : "ds-border"} ds-bg"><div class="flex items-center justify-between"><h3 class="font-semibold">${p.name}</h3>${p.highlight ? `<span class="text-xs px-2 py-0.5 rounded-full ds-accent-bg ds-on-accent">Popular</span>` : ""}</div><p class="mt-1 text-sm ds-muted">${p.blurb}</p><div class="mt-6"><span class="ds-display text-5xl font-semibold tracking-tight">${p.price}</span><span class="ds-muted text-sm">${p.period}</span></div><ul class="mt-6 space-y-3 text-sm flex-1">${p.features.map((f) => `<li class="flex items-center gap-2">${icon("check", "ds-accent")}${f}</li>`).join("")}</ul><a href="#cta" class="mt-8 text-center text-sm py-3 ds-radius-sm ${p.highlight ? "ds-btn" : "border ds-border"}">Choose ${p.name}</a></div>`).join("")}</div>
</div></section>`,
  faq: (_s, c) => `<section class="mx-auto max-w-3xl px-6 py-24"><h2 class="ds-display text-4xl font-semibold tracking-tight text-center reveal">Questions, answered</h2><div class="mt-10 divide-y ds-divide border-y ds-border">${c.faq.map((f) => `<details class="group py-5 reveal"><summary class="flex cursor-pointer list-none items-center justify-between font-medium">${f.q}<span class="transition group-open:rotate-45">${icon("plus")}</span></summary><p class="mt-3 text-sm ds-muted leading-relaxed">${f.a}</p></details>`).join("")}</div></section>`,
  cta: (_s, c) => `<section id="cta" class="mx-auto max-w-7xl px-6 pb-24"><div class="relative overflow-hidden ds-radius ds-accent-bg ds-on-accent px-8 py-20 text-center reveal"><div class="absolute inset-0 ds-grid opacity-20"></div><h2 class="relative ds-display text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl mx-auto">${c.ctaTitle}</h2><p class="relative mt-4 opacity-80 max-w-xl mx-auto">${c.ctaBody}</p><form class="relative mt-8 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto" onsubmit="event.preventDefault();this.querySelector('button').textContent='Thanks!'"><input type="email" required placeholder="you@company.com" class="flex-1 rounded-full px-5 py-3 text-sm text-black bg-white/95 outline-none"><button class="rounded-full px-6 py-3 text-sm font-medium bg-black text-white">${c.primaryCta}</button></form></div></section>`,
};

function footer(spec: DemoSpec, c: CopyPack): string {
  const cols = [["Product", c.nav], ["Company", ["About", "Careers", "Press", "Contact"]], ["Resources", ["Blog", "Guides", "Help center", "Status"]]] as const;
  return `<footer class="border-t ds-border"><div class="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-5 gap-10">
  <div class="md:col-span-2"><div class="font-semibold">${esc(spec.brand)}</div><p class="mt-3 text-sm ds-muted max-w-xs">${esc(spec.sub.split(".")[0])}.</p></div>
  ${cols.map(([title, links]) => `<div><div class="text-sm font-medium">${title}</div><ul class="mt-4 space-y-2 text-sm ds-muted">${links.map((l) => `<li><a href="#" class="hover:opacity-70">${l}</a></li>`).join("")}</ul></div>`).join("")}
</div><div class="border-t ds-border"><div class="mx-auto max-w-7xl px-6 py-6 flex justify-between text-xs ds-muted"><span>© ${new Date().getFullYear()} ${esc(spec.brand)}. All rights reserved.</span><span class="flex gap-4">${["twitter", "instagram", "linkedin"].map((n) => icon(n, "text-base")).join("")}</span></div></div></footer>`;
}

/** Copy packs mention their default brand; swap in the brand from the prompt. */
function brandedCopy(category: Category, brand: string): CopyPack {
  const pack = COPY[category];
  if (pack.brand === brand) return pack;
  return JSON.parse(JSON.stringify(pack).split(pack.brand).join(brand.replace(/["\\]/g, ""))) as CopyPack;
}

export function renderDemo(spec: DemoSpec): string {
  const c = brandedCopy(spec.category, spec.brand);
  spec = { ...spec, sub: spec.sub.split(COPY[spec.category].brand).join(spec.brand) };
  const t = resolveTokens(spec);
  const body = [nav(spec, c), `<main>`, hero(spec, c), ...spec.sections.map((id) => SECTIONS[id](spec, c)), `</main>`, footer(spec, c)].join("\n");
  // "--" may not appear inside an HTML comment; JSON.parse reads the escapes back.
  const marker = `<!-- aura-demo-spec ${JSON.stringify(spec).replace(/--/g, "\\u002d\\u002d")} -->`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(spec.brand)} — ${esc(spec.headline)}</title>
${marker}
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontLink([t.displayFont, t.bodyFont])}" rel="stylesheet">
<style>
:root{--bg:${t.bg};--surface:${t.surface};--text:${t.text};--muted:${t.muted};--border:${t.border};--accent:${t.accent};--on-accent:${t.accentText};--radius:${t.radius};--display:'${t.displayFont}',serif;--body:'${t.bodyFont}',system-ui,sans-serif}
html{scroll-behavior:smooth}body{background:var(--bg);color:var(--text);font-family:var(--body);-webkit-font-smoothing:antialiased}
.ds-display{font-family:var(--display)}.ds-bg{background:var(--bg)}.ds-surface{background:var(--surface)}.ds-text{color:var(--text)}.ds-muted{color:var(--muted)}
.ds-border{border-color:var(--border)}.ds-border-strong{border-color:var(--text)}.ds-border-bg{background:var(--border)}.ds-divide>*+*{border-color:var(--border)}
.ds-accent{color:var(--accent)}.ds-accent-bg{background:var(--accent)}.ds-on-accent{color:var(--on-accent)}.ds-accent-border{border-color:var(--accent);border-width:2px}
.ds-radius{border-radius:var(--radius)}.ds-radius-sm{border-radius:calc(var(--radius)*.6)}
.ds-btn{background:var(--accent);color:var(--on-accent);border-radius:calc(var(--radius)*.6);font-weight:500;transition:transform .2s,box-shadow .2s}.ds-btn:hover{transform:translateY(-1px);box-shadow:0 10px 30px -10px var(--accent)}
.ds-soft{background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--text)}.ds-raise{box-shadow:0 30px 60px -30px color-mix(in srgb,var(--accent) 60%,transparent)}
.ds-header{background:color-mix(in srgb,var(--bg) 75%,transparent)}
.ds-grid{background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse at top,black 30%,transparent 75%)}
.ds-glow{background:radial-gradient(closest-side,var(--accent),transparent)}
.ds-product{background:radial-gradient(circle at 30% 25%,color-mix(in srgb,var(--surface) 70%,white),var(--surface) 55%,color-mix(in srgb,var(--text) 18%,var(--surface)))}
.ds-outline{color:transparent;-webkit-text-stroke:1.5px color-mix(in srgb,var(--text) 22%,transparent)}
.marquee{animation:marquee 40s linear infinite}@keyframes marquee{to{transform:translateX(-50%)}}
.reveal{opacity:0;transform:translateY(18px);transition:opacity .8s ease,transform .8s ease}.reveal.in{opacity:1;transform:none}
</style>
</head>
<body>
${body}
<script>
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=Math.min(i%6,5)*60+'ms';io.observe(el)});
</script>
</body>
</html>`;
}

/** Fallback edits for pages that were not produced by the demo generator. */
function editForeignHtml(html: string, prompt: string): { html: string; notes: string[] } {
  const notes: string[] = [];
  let next = html;
  const headline = /(?:headline|heading|title)\s*(?:to|:|=|say|says)\s*["“]?(.+?)["”]?\s*$/i.exec(prompt);
  if (headline) {
    next = next.replace(/(<h1\b[^>]*>)([\s\S]*?)(<\/h1>)/i, `$1${esc(headline[1])}$3`);
    notes.push(`updated the main headline to “${headline[1]}”`);
  }
  const text = prompt.toLowerCase();
  if (/\b(dark|invert)\b/.test(text) && !next.includes("data-demo-invert")) {
    next = next.replace(/<\/head>/i, `<style data-demo-invert>html{filter:invert(1) hue-rotate(180deg);background:#fff}img,video,picture,iframe{filter:invert(1) hue-rotate(180deg)}</style>\n</head>`);
    notes.push("applied a dark inversion filter");
  } else if (/\blight\b/.test(text) && next.includes("data-demo-invert")) {
    next = next.replace(/<style data-demo-invert>[\s\S]*?<\/style>\n?/i, "");
    notes.push("removed the dark inversion filter");
  }
  return { html: next, notes };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function* generateDemo(req: GenerateRequest, signal: AbortSignal): AsyncGenerator<StreamEvent> {
  yield { type: "status", phase: "thinking", message: req.html ? "Planning the edit" : "Planning the design" };
  await sleep(400);

  let html: string;
  let summary: string;
  const existing = req.html ? readSpec(req.html) : undefined;
  const agent = req.html ? readAgentSpec(req.html) : undefined;

  if (req.html && agent) {
    const notes = applyAgentEdit(agent, req.prompt, detectAccent(req.prompt.toLowerCase()));
    html = renderAgentDemo(agent);
    summary = notes.length
      ? `Demo mode: ${notes.join(", ")}.`
      : "Demo mode can restyle this agent: try “make it dark”, “use a blue accent” or “rename it to …”, or switch to an AI model for free-form edits.";
  } else if (req.html && existing) {
    const notes = applyEdit(existing, req.prompt);
    if (req.designSystemId && findDesignSystem(req.designSystemId) && req.designSystemId !== existing.ds && notes.length === 0) {
      existing.ds = req.designSystemId;
      notes.push(`applied the ${findDesignSystem(req.designSystemId)!.name} design system`);
    }
    html = renderDemo(existing);
    summary = notes.length
      ? `Demo mode: ${notes.join(", ")}.`
      : "Demo mode couldn't map that request to a structured edit. Try “make it dark”, “use a blue accent”, “add pricing”, “remove the FAQ”, “headline: …”, or switch to an AI model for free-form edits.";
  } else if (req.html) {
    const result = editForeignHtml(req.html, req.prompt);
    html = result.html;
    summary = result.notes.length
      ? `Demo mode: ${result.notes.join(", ")}.`
      : "Demo mode can only make simple edits to this page (headline changes, dark mode). Switch to an AI model for free-form edits.";
  } else if (isAgenticBrief(req.prompt)) {
    const spec = initialAgentSpec(req.prompt, { brand: detectBrand(req.prompt), accent: detectAccent(req.prompt.toLowerCase()) });
    yield { type: "reasoning", text: `Reading the brief as a ${spec.domain} agent interface for ${spec.brand}. ` };
    await sleep(250);
    yield { type: "reasoning", text: "Laying out a thread list, a thread with reasoning, a tool call and cited sources, and a composer with a scripted run." };
    html = renderAgentDemo(spec);
    summary = `Demo mode: built a working ${spec.domain} agent interface for ${spec.brand} with a scripted run. Pick a Claude Code, Codex, Cursor or OpenCode model to generate with AI.`;
  } else {
    const spec = initialSpec(req);
    const ds = findDesignSystem(spec.ds)!;
    yield { type: "reasoning", text: `Reading the brief as a ${spec.category} page for ${spec.brand}. ` };
    await sleep(250);
    yield { type: "reasoning", text: `Using the ${ds.name} design system${spec.accent ? ` with a ${spec.accent} accent` : ""}. ` };
    await sleep(250);
    yield { type: "reasoning", text: `Laying out hero, ${spec.sections.join(", ")} and footer.` };
    html = renderDemo(spec);
    summary = `Demo mode: built a ${spec.category} landing page for ${spec.brand} using ${ds.name}. Pick a Claude Code, Codex, Cursor or OpenCode model to generate with AI.`;
  }

  yield { type: "status", phase: "writing", message: "Writing code" };
  const full = `<summary>${summary}</summary>\n${html}`;
  for (let i = 0; i < full.length; i += 240) {
    if (signal.aborted) {
      yield { type: "error", message: "Generation cancelled." };
      return;
    }
    yield { type: "delta", text: full.slice(i, i + 240) };
    await sleep(8);
  }
  yield { type: "done", html, summary, model: DEMO_MODEL_REF, demo: true };
}

export function enhanceDemo(prompt: string): string {
  const text = prompt.toLowerCase();
  const category = detectCategory(text);
  const ds = findDesignSystem(detectDesignSystem(text) ?? COPY[category].designSystem)!;
  return `${prompt.trim().replace(/\.$/, "")}. Art direction: ${ds.tagline.toLowerCase()}, following the ${ds.name} design system. Open with a bold hero that pairs a confident headline with a signature visual, then social proof, a features grid with icons, a showcase section, testimonials, pricing, an FAQ and a strong closing CTA. Keep copy concise and specific, with subtle scroll-reveal motion and polished hover states.`;
}
