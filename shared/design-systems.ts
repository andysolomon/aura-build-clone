// Design systems play the role of Aura's DESIGN.md presets: the guidance is
// injected into the generation prompt, and the tokens drive the offline demo generator.

export interface DesignTokens {
  dark: boolean;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentText: string;
  displayFont: string;
  bodyFont: string;
  radius: string;
}

export interface DesignSystem {
  id: string;
  name: string;
  tagline: string;
  swatches: string[];
  tokens: DesignTokens;
  guidance: string;
}

export const DESIGN_SYSTEMS: DesignSystem[] = [
  {
    id: "mono-minimal",
    name: "Mono Minimal",
    tagline: "Quiet neutrals, crisp grid, one ink color",
    swatches: ["#fafafa", "#e4e4e7", "#18181b", "#2563eb"],
    tokens: {
      dark: false, bg: "#fafafa", surface: "#ffffff", text: "#18181b", muted: "#71717a",
      border: "#e4e4e7", accent: "#18181b", accentText: "#ffffff",
      displayFont: "Inter", bodyFont: "Inter", radius: "14px",
    },
    guidance: `Neutral zinc palette on near-white (#fafafa). Ink-black primary buttons, hairline 1px borders (#e4e4e7), generous whitespace.
Typography: Inter, tight tracking (-0.03em) on large display headings, 15-16px body. Visible thin grid guide lines are welcome.
Components: pill badges, rounded-2xl cards with soft shadow, monochrome icons (lucide). Accent blue (#2563eb) only for links and focus.`,
  },
  {
    id: "midnight-glow",
    name: "Midnight Glow",
    tagline: "Deep black, indigo aurora, glass panels",
    swatches: ["#07070a", "#15151c", "#8b5cf6", "#22d3ee"],
    tokens: {
      dark: true, bg: "#07070a", surface: "#111118", text: "#f4f4f5", muted: "#a1a1aa",
      border: "rgba(255,255,255,0.08)", accent: "#8b5cf6", accentText: "#ffffff",
      displayFont: "Manrope", bodyFont: "Inter", radius: "18px",
    },
    guidance: `Dark mode first: background #07070a, surfaces #111118 with 1px rgba(255,255,255,0.08) borders and backdrop blur.
Radial violet (#8b5cf6) and cyan (#22d3ee) glow gradients behind the hero; gradient text on one key phrase.
Typography: Manrope display (600-700, tight tracking), Inter body. Product UI mockups built in HTML. Subtle grain or grid textures.`,
  },
  {
    id: "editorial-serif",
    name: "Editorial Serif",
    tagline: "Magazine layouts, serif display, ivory paper",
    swatches: ["#f6f1e9", "#e7dfd2", "#1c1917", "#9a3412"],
    tokens: {
      dark: false, bg: "#f6f1e9", surface: "#fffdf8", text: "#1c1917", muted: "#78716c",
      border: "#e7dfd2", accent: "#9a3412", accentText: "#fffdf8",
      displayFont: "Instrument Serif", bodyFont: "Inter", radius: "6px",
    },
    guidance: `Ivory paper background (#f6f1e9), espresso ink (#1c1917), rust accent (#9a3412).
Typography: Instrument Serif for display at very large sizes (italic for emphasis), Inter for UI and body at 15px.
Layout: editorial asymmetric columns, numbered sections, thin rules, small caps labels with wide tracking. Minimal radius.`,
  },
  {
    id: "electric-lime",
    name: "Electric Lime",
    tagline: "Fintech black with high-voltage lime",
    swatches: ["#0a0a0a", "#1a1a1a", "#c6ff3d", "#ffffff"],
    tokens: {
      dark: true, bg: "#0a0a0a", surface: "#151515", text: "#fafafa", muted: "#a3a3a3",
      border: "#262626", accent: "#c6ff3d", accentText: "#0a0a0a",
      displayFont: "Space Grotesk", bodyFont: "Inter", radius: "20px",
    },
    guidance: `Pure black canvas with electric lime (#c6ff3d) accents used sparingly for CTAs, highlights and data.
Typography: Space Grotesk display, bold and oversized; Inter body. Bento grids, big numeric stats, monospace micro-labels.
Cards: #151515 with #262626 borders, rounded-3xl. Motion: marquee rows, counters, hover lifts.`,
  },
  {
    id: "warm-organic",
    name: "Warm Organic",
    tagline: "Sage, clay and cream with soft curves",
    swatches: ["#f4f1ea", "#dfe6d8", "#3f4f3a", "#c26a3d"],
    tokens: {
      dark: false, bg: "#f4f1ea", surface: "#fbfaf6", text: "#2b3327", muted: "#6b7366",
      border: "#dfe2d6", accent: "#3f4f3a", accentText: "#f4f1ea",
      displayFont: "Fraunces", bodyFont: "DM Sans", radius: "28px",
    },
    guidance: `Calm, human and tactile: cream (#f4f1ea), sage (#dfe6d8), forest (#3f4f3a) and clay (#c26a3d) accents.
Typography: Fraunces display (soft optical serif), DM Sans body. Very rounded shapes (rounded-[28px]), organic blob SVGs, gentle shadows.
Photography-like warmth via gradients; friendly microcopy; testimonial cards with avatars.`,
  },
  {
    id: "swiss-bold",
    name: "Swiss Bold",
    tagline: "Brutal grid, giant type, signal orange",
    swatches: ["#ffffff", "#f2f2f2", "#000000", "#ff4d00"],
    tokens: {
      dark: false, bg: "#ffffff", surface: "#f2f2f2", text: "#000000", muted: "#555555",
      border: "#000000", accent: "#ff4d00", accentText: "#ffffff",
      displayFont: "Archivo", bodyFont: "Archivo", radius: "0px",
    },
    guidance: `International Typographic Style: strict 12-column grid, black 1px rules, zero border radius.
Typography: Archivo (or Archivo Black) set huge and tight, uppercase labels, numbered lists. One signal color: #ff4d00.
Layout: asymmetric blocks, marquee client strip, case-study rows with large index numbers. No gradients, no soft shadows.`,
  },
];

export const DEFAULT_DESIGN_SYSTEM_ID = "mono-minimal";

export function findDesignSystem(id: string | null | undefined): DesignSystem | undefined {
  return DESIGN_SYSTEMS.find((d) => d.id === id);
}
