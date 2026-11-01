// Prompt Builder data and prompt assembly. The option sets and the wording of the generated
// lines follow Aura's prompt builder (recovered from its shipped bundle); each selection turns
// into a precise instruction line the user can toggle before adding it to the composer.

export type Platform = "Web" | "Mobile";

export const LAYOUT_TYPES: Record<Platform, string[]> = {
  Web: ["Landing Page", "Hero", "Features", "Pricing", "Testimonials", "Gallery", "Portfolio", "Dashboard", "Login", "Onboarding", "Docs", "Updates", "Blog", "Video", "Email", "Payment", "FAQ", "Explore", "Settings", "About", "Footer"],
  Mobile: ["Hero", "Features", "Onboarding", "Dashboard", "Login", "Settings", "Profile", "Gallery", "Explore", "FAQ"],
};

export const LAYOUT_CONFIGS: Record<Platform, string[]> = {
  Web: ["Card", "List", "2-2 Square", "Table", "Sidebar Left", "Sidebar Right", "1-1 Split", "1-1 Vertical", "1/3 2/3 Bento", "2/3 1/3 Bento", "1×4 Bento", "Feature Bento", "Featured Right", "Featured Top", "1/4 2/4 1/4 Bento", "2/4 1/4 1/4 Bento", "2-1 Split", "1-2 Split", "1-1-1 Equal", "Header Focus", "3-3 Grid", "Carousel", "Modal", "Alert"],
  Mobile: ["Card", "List", "1-1 Vertical", "1-1-1 Equal", "Header Focus", "Carousel", "Modal", "Alert", "Featured Top"],
};

export const LAYOUT_CONFIG_DESCRIPTIONS: Record<string, string> = {
  Card: "centered content in a card container",
  List: "vertically stacked items in a list format",
  Table: "data organized in a structured grid with rows and columns",
  "2-2 Square": "four equal-sized cells in a square grid",
  "1/3 2/3 Bento": "asymmetric grid with alternating 1/3-2/3 sections",
  "2/3 1/3 Bento": "asymmetric grid with alternating 2/3-1/3 sections",
  "1×4 Bento": "full-width section on top with four equal columns below",
  "Feature Bento": "large featured cell with five smaller content areas",
  "1/4 2/4 1/4 Bento": "asymmetric grid with 1/4-2/4-1/4 top row and equal bottom row",
  "2/4 1/4 1/4 Bento": "asymmetric grid with 2/4-1/4-1/4 top row and equal bottom row",
  "Sidebar Left": "narrow navigation sidebar on the left with main content area",
  "Sidebar Right": "main content with narrow sidebar on the right",
  "1-1 Split": "two equal columns side by side",
  "1-1 Vertical": "two equal-height sections stacked vertically",
  "2-1 Split": "wider left column with narrower right column",
  "1-2 Split": "narrower left column with wider right column",
  "1-1-1 Equal": "three equal columns in a row",
  "Featured Right": "main content with two stacked sections on the right",
  "Featured Top": "large featured section on top with columns below",
  "Header Focus": "prominent header with main content below",
  "3-3 Grid": "six equal cells arranged in a 3×2 grid",
  Carousel: "horizontally scrolling content sections",
  Modal: "focused overlay content on top of the main view",
  Alert: "attention-grabbing notification element",
};

// Agent interfaces: a surface plus the message parts it shows, from the anatomy shared by the
// agent UI libraries studied for the Agent UI kit (see docs/reverse-engineering.md).
export const AGENT_SURFACES: Record<string, string> = {
  "Chat Thread": "centered conversation with streaming replies, message actions and a composer",
  "App Shell": "thread-list sidebar, a header with a model menu, the thread and a composer",
  "Copilot Sidebar": "assistant panel docked beside the product UI, answering about the current screen",
  "Chat + Artifact": "chat on the left and an artifact panel on the right with Preview, Code and Terminal tabs",
  "Floating Widget": "launcher bubble that opens a compact chat panel over the page",
  "Voice Agent": "animated persona orb with listening, thinking and speaking states and a live transcript",
  "Workflow Canvas": "node graph of agent steps with bezier edges, an animated active path and an inspector",
  "Agent Console": "agent definition card, a run-trace waterfall, and token and cost stats",
};

export const AGENT_PARTS: Record<string, string> = {
  Reasoning: "collapsible reasoning that shimmers “Thinking…” while it streams and settles to “Thought for 6s”",
  "Tool Calls": "collapsible tool cards with a mono name, a status pill (pending, running, completed, error) and JSON parameters and result",
  Approvals: "an inline approve or deny confirmation before sensitive tool calls, resolving to approved or denied",
  "Generative UI": "tool results rendered as rich cards (charts, tables, status trackers) instead of raw JSON",
  Sources: "inline citation pills with hover cards and a “Used 4 sources” disclosure",
  Plan: "a plan card with a step checklist that ticks off as the agent works",
  "Task Queue": "queued messages and todos with send-now and remove actions",
  Attachments: "file and image attachment tiles in the composer and on user messages",
  Suggestions: "suggestion pills in the empty state and as follow-ups",
  Branching: "regenerate creates a new branch with a ‹ 2 / 2 › picker",
  "Model Picker": "a searchable model selector grouped by provider",
  "Context Meter": "a context-window ring with a token and cost breakdown on hover",
  Checkpoints: "restore-checkpoint separators between turns",
  Feedback: "thumbs up and down plus a “Was this helpful?” bar",
};

export const AGENT_RUNS: Record<string, string> = {
  "Scripted on Send": "sending a message plays a scripted run with streaming text and a working stop button",
  "Autoplay Demo": "a scripted run plays on load and loops like a product demo",
  "Static Snapshot": "a finished run shown as a static snapshot",
};

const CLAY_SHADOW ="shadow-[0_50px_100px_-20px_rgba(50,50,93,0.25),0_30px_60px_-30px_rgba(0,0,0,0.3),inset_0_-2px_6px_0_rgba(10,37,64,0.35)]";

export const FRAMINGS: Record<Platform, string[]> = {
  Web: ["Full Screen", "Card", "Browser", "Mac App", "Clay Web"],
  Mobile: ["iPhone", "Android", "iPad", "Clay Mobile"],
};

export const FRAMING_DESCRIPTIONS: Record<string, string> = {
  "Full Screen": "full browser viewport width and height",
  Card: "contained in a card with padding and shadow",
  Browser: "displayed in a browser window frame",
  iPhone: "optimized for iPhone screen dimensions",
  Android: "optimized for Android phone dimensions",
  iPad: "optimized for iPad tablet dimensions",
  "Mac App": "styled as a native macOS application window",
  "Clay Mobile": `presented in a sleek clay-style mobile device frame: rounded-[54px] ${CLAY_SHADOW} bg-[#f6f9fc] p-2 w-[375px] h-[812px]`,
  "Clay Web": `displayed in a modern clay-style browser frame with rounded corners and subtle shadows: rounded-[12px] ${CLAY_SHADOW} bg-[#f6f9fc] p-2 w-[800px] h-[600px]`,
};

export const VISUAL_STYLES = ["Flat", "Outline", "Minimalist", "Glass", "iOS", "Material"];
export const THEMES = ["Light Mode", "Dark Mode"] as const;

/** Tailwind palette, shades 100/200/500/800/900, for swatches and the live preview. */
export const TAILWIND: Record<string, [string, string, string, string, string]> = {
  Neutral: ["#f5f5f5", "#e5e5e5", "#737373", "#262626", "#171717"],
  Gray: ["#f3f4f6", "#e5e7eb", "#6b7280", "#1f2937", "#111827"],
  Slate: ["#f1f5f9", "#e2e8f0", "#64748b", "#1e293b", "#0f172a"],
  Zinc: ["#f4f4f5", "#e4e4e7", "#71717a", "#27272a", "#18181b"],
  Stone: ["#f5f5f4", "#e7e5e4", "#78716c", "#292524", "#1c1917"],
  Blue: ["#dbeafe", "#bfdbfe", "#3b82f6", "#1e40af", "#1e3a8a"],
  Indigo: ["#e0e7ff", "#c7d2fe", "#6366f1", "#3730a3", "#312e81"],
  Violet: ["#ede9fe", "#ddd6fe", "#8b5cf6", "#5b21b6", "#4c1d95"],
  Purple: ["#f3e8ff", "#e9d5ff", "#a855f7", "#6b21a8", "#581c87"],
  Fuchsia: ["#fae8ff", "#f5d0fe", "#d946ef", "#86198f", "#701a75"],
  Pink: ["#fce7f3", "#fbcfe8", "#ec4899", "#9d174d", "#831843"],
  Rose: ["#ffe4e6", "#fecdd3", "#f43f5e", "#9f1239", "#881337"],
  Red: ["#fee2e2", "#fecaca", "#ef4444", "#991b1b", "#7f1d1d"],
  Orange: ["#ffedd5", "#fed7aa", "#f97316", "#9a3412", "#7c2d12"],
  Amber: ["#fef3c7", "#fde68a", "#f59e0b", "#92400e", "#78350f"],
  Yellow: ["#fef9c3", "#fef08a", "#eab308", "#854d0e", "#713f12"],
  Lime: ["#ecfccb", "#d9f99d", "#84cc16", "#3f6212", "#365314"],
  Green: ["#dcfce7", "#bbf7d0", "#22c55e", "#166534", "#14532d"],
  Emerald: ["#d1fae5", "#a7f3d0", "#10b981", "#065f46", "#064e3b"],
  Teal: ["#ccfbf1", "#99f6e4", "#14b8a6", "#115e59", "#134e4a"],
  Cyan: ["#cffafe", "#a5f3fc", "#06b6d4", "#155e75", "#164e63"],
  Sky: ["#e0f2fe", "#bae6fd", "#0ea5e9", "#075985", "#0c4a6e"],
};

const HUES = ["Blue", "Indigo", "Violet", "Purple", "Fuchsia", "Pink", "Rose", "Red", "Orange", "Amber", "Yellow", "Lime", "Green", "Emerald", "Teal", "Cyan", "Sky"];
export const ACCENT_COLORS = ["Primary", ...HUES];
export const BACKGROUND_COLORS = ["Transparent", "Neutral", "Gray", "Slate", "Zinc", "Stone", ...HUES];
export const BORDER_COLORS = BACKGROUND_COLORS;

export const SHADOWS: Record<string, string> = {
  None: "",
  Small: "shadow-sm",
  Medium: "shadow-md",
  Large: "shadow-lg",
  "Extra Large": "shadow-xl",
  XXL: "shadow-2xl",
  "Beautiful sm": "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]",
  "Beautiful md": "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]",
  "Beautiful lg": "shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)]",
  "Light Blue sm": "shadow-[rgba(14,_63,_126,_0.04)_0px_0px_0px_1px,_rgba(42,_51,_69,_0.04)_0px_1px_1px_-0.5px,_rgba(42,_51,_70,_0.04)_0px_3px_3px_-1.5px,_rgba(42,_51,_70,_0.04)_0px_6px_6px_-3px,_rgba(14,_63,_126,_0.04)_0px_12px_12px_-6px,_rgba(14,_63,_126,_0.04)_0px_24px_24px_-12px]",
  "Light Blue md": "shadow-[rgba(50,_50,_93,_0.25)_0px_13px_27px_-5px,_rgba(0,_0,_0,_0.3)_0px_8px_16px_-8px]",
  "Light Blue lg": "shadow-[rgba(255,_255,_255,_0.1)_0px_1px_1px_0px_inset,_rgba(50,_50,_93,_0.25)_0px_50px_100px_-20px,_rgba(0,_0,_0,_0.3)_0px_30px_60px_-30px]",
  Bevel: "shadow-[rgba(50,_50,_93,_0.25)_0px_50px_100px_-20px,_rgba(0,_0,_0,_0.3)_0px_30px_60px_-30px,_rgba(10,_37,_64,_0.35)_0px_-2px_6px_0px_inset]",
  "3D": "shadow-[rgba(0,_0,_0,_0.17)_0px_-23px_25px_0px_inset,_rgba(0,_0,_0,_0.15)_0px_-36px_30px_0px_inset,_rgba(0,_0,_0,_0.1)_0px_-79px_40px_0px_inset,_rgba(0,_0,_0,_0.06)_0px_2px_1px,_rgba(0,_0,_0,_0.09)_0px_4px_2px,_rgba(0,_0,_0,_0.09)_0px_8px_4px,_rgba(0,_0,_0,_0.09)_0px_16px_8px,_rgba(0,_0,_0,_0.09)_0px_32px_16px]",
  "Inner Shadow": "shadow-[rgba(50,_50,_93,_0.25)_0px_30px_60px_-12px_inset,_rgba(0,_0,_0,_0.3)_0px_18px_36px_-18px_inset]",
};

const TAILWIND_SHADOWS: Record<string, string> = {
  "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  "shadow-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  "shadow-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  "shadow-xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "shadow-2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
};

/** CSS box-shadow for a shadow option, for tiles and the preview. */
export function shadowCss(name: string | null): string | undefined {
  const cls = name ? SHADOWS[name] : "";
  if (!cls) return undefined;
  if (TAILWIND_SHADOWS[cls]) return TAILWIND_SHADOWS[cls];
  const inner = /^shadow-\[(.*)\]$/.exec(cls)?.[1];
  return inner?.replace(/_/g, " ").replace(/\s+/g, " ").replace(/,\s*/g, ", ").trim();
}

export const TYPEFACE_FAMILIES: Record<string, string[]> = {
  SANS: ["Inter", "Geist", "Manrope", "Plus Jakarta Sans", "Space Grotesk", "Open Sans", "Work Sans", "Rajdhani", "Kanit"],
  SERIF: ["Playfair Display", "Instrument Serif", "IBM Plex Serif", "Cormorant", "Lora", "PT Serif"],
  MONOSPACE: ["JetBrains Mono", "Geist Mono", "Space Mono", "VT323", "DotGothic16", "Source Code Pro", "Noto Sans Mono", "IBM Plex Mono"],
  CONDENSED: ["IBM Plex Sans Condensed", "Barlow Condensed", "Roboto Condensed"],
  EXPANDED: ["Encode Sans", "Syne", "BioRhyme", "Rubik"],
  ROUNDED: ["Quicksand", "Nunito", "Varela Round", "Comfortaa", "DynaPuff"],
  HANDWRITTEN: ["Pacifico", "Berkshire Swash", "Chewy", "Satisfy", "Sacramento"],
};

export const FAMILY_SAMPLE_FONT: Record<string, string> = {
  SANS: "Inter",
  SERIF: "Playfair Display",
  MONOSPACE: "JetBrains Mono",
  CONDENSED: "Barlow Condensed",
  EXPANDED: "Syne",
  ROUNDED: "Nunito",
  HANDWRITTEN: "Pacifico",
};

export const ALL_FONTS = [...new Set(Object.values(TYPEFACE_FAMILIES).flat())];

export const HEADING_SIZES = ["20-32px", "32-40px", "48-64px", "64-80px"];
export const SUBHEADING_SIZES = ["16-20px", "20-24px", "24-28px", "28-32px"];
export const BODY_SIZES = ["12-14px", "14-16px", "16-18px", "18-20px"];
export const FONT_WEIGHTS: Record<string, number> = { Ultralight: 200, Light: 300, Regular: 400, Medium: 500, Semibold: 600, Bold: 700, Black: 900 };
export const LETTER_SPACINGS: Record<string, string> = { Tighter: "-0.05em", Tight: "-0.025em", Normal: "0em", Wide: "0.025em", Wider: "0.05em", Widest: "0.1em" };

export const ANIMATION_TYPES = ["Fade", "Slide", "Scale", "Rotate", "Blur", "3D", "Pulse", "Shake", "Bounce", "Morph", "Skew", "Color", "Hue", "Perspective", "Clip"];
export const SCENES = ["All at once", "Sequence", "Word by word", "Letter by letter"];
export const EASINGS: Record<string, string> = {
  Linear: "linear",
  Ease: "ease",
  "Ease In": "ease-in",
  "Ease Out": "ease-out",
  "Ease In Out": "ease-in-out",
  Spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  Bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};
export const ITERATIONS: Record<string, string> = { Once: "1", Twice: "2", Thrice: "3", Infinite: "infinite" };
export const DIRECTIONS: Record<string, string> = { Normal: "normal", Reverse: "reverse", Alternate: "alternate", "Alternate Reverse": "alternate-reverse" };

export const DEFAULT_DURATION = 0.8;

/** Reusable instruction snippets, grouped for the library panel. */
export const PROMPT_LIBRARY: { group: string; items: string[] }[] = [
  {
    group: "Structure",
    items: [
      "Create a landing page for my product called {your-app}, a {app-type} app that {feature}",
      "Include a hero, features, testimonials, pricing and a footer",
      "Keep the exact same header and footer and adapt the page into a Features page",
      "Replace all copy, names and numbers with realistic content for my product",
      "Make every section fully responsive from 375px to 1440px",
      "Adapt the whole page to dark mode",
    ],
  },
  {
    group: "Icons & brand",
    items: [
      "Use Iconify Solar Duotone icons through <iconify-icon> instead of inline SVG",
      "Design a crisp inline SVG logo mark plus a tight-tracked wordmark",
      "Use real company logos from Iconify Simple Icons at 64x64 instead of text logos",
      "Use headshot photos for avatars and testimonials instead of initials",
    ],
  },
  {
    group: "Layout details",
    items: [
      "Add thin vertical guide lines that frame the content container",
      "Add 01 02 03 numbering details to sections and cards",
      "Make headings two sizes bigger and body text one size bigger",
      "Give it an upscale agency-studio feel with oversized headings",
    ],
  },
  {
    group: "Motion",
    items: [
      "Fade, slide and blur elements in one by one as they scroll into view",
      "Reveal headings word by word with a masked clip animation",
      "Add an infinite marquee with soft alpha-masked edges",
      "Add a 1px beam that travels around pill buttons on hover",
      "Add a cursor-following spotlight on card backgrounds and borders",
      "Add subtle parallax to background layers",
      "Build a sticky scroll story with GSAP ScrollTrigger and smooth section transitions",
      "Animate with animation-fill-mode both, and never leave content at opacity 0",
    ],
  },
  {
    group: "Agents",
    items: [
      "Make this a working AI agent interface with a scripted run, not a page about one",
      "Add an interactive AI chat demo to the hero that streams replies and shows tool calls",
      "Show every tool call as a collapsible card with a status pill and JSON parameters and result",
      "Ask for approval before any destructive tool call, then show the approved or denied outcome",
      "Cite sources inline with hover cards and end answers with a “Used N sources” list",
      "Pre-render one complete exchange so the first view is never an empty chat",
    ],
  },
  {
    group: "Polish",
    items: [
      "Give every button layered hover, pressed, focus-visible and loading states",
      "Add rich micro-interactions to every interactive element",
      "Aim for award-winning, Awwwards-level visual polish",
      "Show the page in three iPhone frames side by side against a contrasting background",
    ],
  },
];

export interface BuilderState {
  platform: Platform;
  layoutType: string | null;
  layoutConfig: string | null;
  agentSurface: string | null;
  agentParts: string[];
  agentRun: string | null;
  framing: string | null;
  visualStyle: string | null;
  theme: (typeof THEMES)[number] | null;
  accent: string | null;
  background: string | null;
  border: string | null;
  shadow: string | null;
  typeface: string | null;
  headingFont: string | null;
  bodyFont: string | null;
  headingSize: string | null;
  subheadingSize: string | null;
  bodySize: string | null;
  weight: string | null;
  spacing: string | null;
  animations: string[];
  scene: string | null;
  duration: number;
  delay: number;
  easing: string | null;
  iterations: string | null;
  direction: string | null;
}

export const EMPTY_STATE: BuilderState = {
  platform: "Web",
  layoutType: null,
  layoutConfig: null,
  agentSurface: null,
  agentParts: [],
  agentRun: null,
  framing: null,
  visualStyle: null,
  theme: null,
  accent: null,
  background: null,
  border: null,
  shadow: null,
  typeface: null,
  headingFont: null,
  bodyFont: null,
  headingSize: null,
  subheadingSize: null,
  bodySize: null,
  weight: null,
  spacing: null,
  animations: [],
  scene: null,
  duration: DEFAULT_DURATION,
  delay: 0,
  easing: null,
  iterations: null,
  direction: null,
};

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

/** One instruction line per selection, in a stable order. */
export function selectionLines(s: BuilderState): string[] {
  const lines: string[] = [];
  const dark = s.theme === "Dark Mode";
  if (s.layoutType) lines.push(`Create a ${s.layoutType.toLowerCase()} layout`);
  if (s.layoutConfig) lines.push(`Layout Configuration: ${s.layoutConfig} (${LAYOUT_CONFIG_DESCRIPTIONS[s.layoutConfig]})`);
  if (s.agentSurface) lines.push(`Build a working agent interface: ${s.agentSurface} (${AGENT_SURFACES[s.agentSurface]})`);
  for (const part of s.agentParts) lines.push(`Agent part: ${part} (${AGENT_PARTS[part]})`);
  if (s.agentRun) lines.push(`Agent run: ${s.agentRun} (${AGENT_RUNS[s.agentRun]})`);
  if (s.framing) lines.push(`Framing: ${s.framing} (${FRAMING_DESCRIPTIONS[s.framing]})`);
  if (s.visualStyle) lines.push(`Apply a ${s.visualStyle.toLowerCase()} visual style`);
  if (s.theme) lines.push(`Use ${s.theme.toLowerCase()} colors`);
  if (s.accent) lines.push(s.accent === "Primary" ? `Accent Color: Primary (${dark ? "white" : "black"})` : `Accent Color: ${s.accent} (Tailwind 500)`);
  if (s.background) lines.push(`Background Color: ${s.background} (Tailwind ${dark ? 900 : 100})`);
  if (s.border) lines.push(`Border Color: ${s.border} (Tailwind ${dark ? 800 : 200})`);
  if (s.shadow && s.shadow !== "None") lines.push(`Shadow: ${s.shadow} (${SHADOWS[s.shadow]})`);
  if (s.typeface) lines.push(`Use ${s.typeface.toLowerCase()} fonts`);
  if (s.headingFont) lines.push(`Use ${s.headingFont} for headings`);
  if (s.bodyFont && s.bodyFont !== s.headingFont) lines.push(`Use ${s.bodyFont} for body text`);
  if (s.headingSize) lines.push(`Use heading size ${s.headingSize}`);
  if (s.subheadingSize) lines.push(`Use subheading size ${s.subheadingSize}`);
  if (s.bodySize) lines.push(`Use body text size ${s.bodySize}`);
  if (s.weight) lines.push(`Apply ${s.weight.toLowerCase()} font weight to headings`);
  if (s.spacing) lines.push(`Apply ${s.spacing.toLowerCase()} letter spacing to headings`);
  if (s.animations.length) lines.push(`Apply ${joinList(s.animations.map((a) => a.toLowerCase()))} animation`);
  if (s.scene) lines.push(`Animate ${s.scene.toLowerCase()}`);
  if (s.duration > 0 && s.duration !== DEFAULT_DURATION) lines.push(`Set animation duration to ${s.duration.toFixed(1)}s`);
  if (s.delay > 0) lines.push(`Set animation delay to ${s.delay.toFixed(1)}s`);
  if (s.easing) lines.push(`Use ${s.easing.toLowerCase()} easing`);
  if (s.iterations) lines.push(`Repeat animation ${s.iterations.toLowerCase()}`);
  if (s.direction) lines.push(`Animation direction: ${s.direction.toLowerCase()}`);
  return lines;
}

/**
 * Joins the chosen lines into one prompt: code blocks first, then sentences separated by
 * ". ", ending with a period (same assembly rules as Aura's builder).
 */
export function assemblePrompt(blocks: string[], lines: string[]): string {
  let out = "";
  for (const block of blocks) out += `${block.trim()}\n\n`;
  const sentences = lines.map((l) => l.trim().replace(/\.$/, "")).filter(Boolean);
  out += sentences.join(". ");
  out = out.trim();
  if (out && !out.endsWith(".") && !out.endsWith("```")) out += ".";
  return out.replace(/\.\s*\./g, ".").replace(/[ \t]{2,}/g, " ");
}
