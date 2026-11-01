import type { CSSProperties, ReactNode } from "react";
import {
  DIRECTIONS,
  EASINGS,
  FAMILY_SAMPLE_FONT,
  FONT_WEIGHTS,
  ITERATIONS,
  LETTER_SPACINGS,
  TAILWIND,
  shadowCss,
  type BuilderState,
} from "../../data/promptBuilder";
import { AgentPreview } from "./AgentPreview";
import { LayoutConfigGlyph, animationName } from "./tiles";

const HEADLINES: Record<string, string> = {
  Pricing: "Simple, honest pricing",
  Login: "Welcome back",
  Dashboard: "Good morning, Alex",
  Testimonials: "Loved by builders",
  Gallery: "Selected work",
  Portfolio: "Selected work",
  Onboarding: "Let's get you set up",
  Docs: "Getting started",
  Updates: "What's new",
  Blog: "Stories & notes",
  FAQ: "Questions, answered",
  Settings: "Settings",
  Payment: "Checkout",
  Email: "Your weekly digest",
  Profile: "Alex Rivera",
};

/** First number of a "48-64px" range, scaled down for the preview pane. */
function px(range: string | null, fallback: number, scale = 0.72): number {
  const n = range ? parseInt(range, 10) : fallback;
  return Math.round((Number.isFinite(n) ? n : fallback) * scale);
}

export interface Palette {
  dark: boolean;
  page: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  onAccent: string;
  border: string;
  shadow?: string;
}

function palette(s: BuilderState): Palette {
  const dark = s.theme === "Dark Mode";
  const bg = s.background && s.background !== "Transparent" ? TAILWIND[s.background] : null;
  const accent =
    !s.accent || s.accent === "Primary" ? (dark ? "#fafafa" : "#18181b") : TAILWIND[s.accent][2];
  const border =
    s.border === "Transparent" ? "transparent" : s.border ? TAILWIND[s.border][dark ? 3 : 1] : dark ? "rgba(255,255,255,0.1)" : "#e4e4e7";
  return {
    dark,
    page: bg ? bg[dark ? 4 : 0] : dark ? "#0b0b0d" : "#ffffff",
    surface: dark ? "rgba(255,255,255,0.04)" : "#ffffff",
    text: dark ? "#fafafa" : "#18181b",
    muted: dark ? "#a1a1aa" : "#71717a",
    accent,
    onAccent: (!s.accent || s.accent === "Primary") && dark ? "#0b0b0d" : "#ffffff",
    border,
    shadow: shadowCss(s.shadow),
  };
}

function cardStyle(s: BuilderState, p: Palette): CSSProperties {
  const base: CSSProperties = { background: p.surface, border: `1px solid ${p.border}`, borderRadius: 10, boxShadow: p.shadow };
  switch (s.visualStyle) {
    case "Outline":
      return { ...base, background: "transparent", border: `1.5px solid ${p.text}33` };
    case "Minimalist":
      return { ...base, border: "none", boxShadow: "none", background: p.dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)" };
    case "Glass":
      return { ...base, background: p.dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.35)" };
    case "iOS":
      return { ...base, borderRadius: 18 };
    case "Material":
      return { ...base, border: "none", borderRadius: 4, boxShadow: p.shadow ?? "0 2px 4px rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.12)" };
    case "Flat":
      return { ...base, border: "none", boxShadow: "none", background: p.dark ? "rgba(255,255,255,0.07)" : "#f4f4f5" };
    default:
      return base;
  }
}

function buttonStyle(s: BuilderState, p: Palette): CSSProperties {
  const base: CSSProperties = { background: p.accent, color: p.onAccent, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500 };
  switch (s.visualStyle) {
    case "Outline":
      return { ...base, background: "transparent", color: p.accent, border: `1.5px solid ${p.accent}` };
    case "Minimalist":
      return { ...base, background: "transparent", color: p.text, borderBottom: `1px solid ${p.text}`, borderRadius: 0, padding: "4px 0" };
    case "Glass":
      return { ...base, background: `${p.accent}cc`, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.4)" };
    case "iOS":
      return { ...base, borderRadius: 999, padding: "7px 18px" };
    case "Material":
      return { ...base, borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.06em", boxShadow: "0 2px 4px rgba(0,0,0,.25)" };
    default:
      return base;
  }
}

/** Returns the animation style for the n-th animated element, honoring scene staggering. */
function animationFor(s: BuilderState) {
  return (index: number): CSSProperties => {
    if (!s.animations.length) return {};
    const easing = EASINGS[s.easing ?? "Ease Out"] ?? "ease-out";
    const iterations = ITERATIONS[s.iterations ?? "Once"] ?? "1";
    const direction = DIRECTIONS[s.direction ?? "Normal"] ?? "normal";
    const stagger = s.scene && s.scene !== "All at once" ? index * (s.scene === "Letter by letter" ? 0.04 : s.scene === "Word by word" ? 0.1 : 0.12) : 0;
    return {
      animation: s.animations
        .map((type) => `${animationName(type)} ${s.duration || 0.8}s ${easing} ${(s.delay + stagger).toFixed(2)}s ${iterations} ${direction} both`)
        .join(", "),
    };
  };
}

function Framed({ s, children, page }: { s: BuilderState; children: ReactNode; page: string }) {
  const mobile = s.platform === "Mobile";
  const framing = s.framing ?? (mobile ? "iPhone" : null);
  const screen = (radius: number, extra?: CSSProperties) => (
    <div className="h-full w-full overflow-hidden" style={{ background: page, borderRadius: radius, ...extra }}>{children}</div>
  );
  switch (framing) {
    case "Browser":
      return (
        <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-line shadow-composer">
          <div className="flex h-7 shrink-0 items-center gap-1.5 bg-subtle px-3">
            {["#f87171", "#fbbf24", "#34d399"].map((c) => <span key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />)}
            <span className="ml-3 h-3.5 flex-1 rounded-full bg-panel" />
          </div>
          <div className="min-h-0 flex-1">{screen(0)}</div>
        </div>
      );
    case "Mac App":
      return (
        <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-line shadow-composer">
          <div className="relative flex h-7 shrink-0 items-center gap-1.5 bg-subtle px-3">
            {["#f87171", "#fbbf24", "#34d399"].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}
            <span className="absolute left-1/2 -translate-x-1/2 text-[11px] text-muted">My App</span>
          </div>
          <div className="min-h-0 flex-1">{screen(0)}</div>
        </div>
      );
    case "Clay Web":
      return (
        <div className="h-full w-full rounded-[12px] bg-[#f6f9fc] p-2" style={{ boxShadow: "0 50px 100px -20px rgba(50,50,93,0.25), 0 30px 60px -30px rgba(0,0,0,0.3), inset 0 -2px 6px 0 rgba(10,37,64,0.35)" }}>
          {screen(8)}
        </div>
      );
    case "Card":
      return <div className="h-full w-full rounded-2xl border border-line p-3 shadow-composer" style={{ background: page }}>{screen(10)}</div>;
    case "iPhone":
    case "Android":
    case "Clay Mobile":
      return (
        <div className="grid h-full w-full place-items-center">
          <div
            className="relative h-full max-h-[560px] w-[270px] p-2"
            style={
              framing === "Clay Mobile"
                ? { borderRadius: 46, background: "#f6f9fc", boxShadow: "0 50px 100px -20px rgba(50,50,93,0.25), 0 30px 60px -30px rgba(0,0,0,0.3), inset 0 -2px 6px 0 rgba(10,37,64,0.35)" }
                : { borderRadius: framing === "iPhone" ? 44 : 30, background: "#111", boxShadow: "0 20px 40px -12px rgba(0,0,0,.4)" }
            }
          >
            {framing === "iPhone" && <span className="absolute left-1/2 top-3.5 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-black" />}
            {framing === "Android" && <span className="absolute left-1/2 top-4 z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-black" />}
            {screen(framing === "iPhone" ? 36 : framing === "Clay Mobile" ? 40 : 24)}
          </div>
        </div>
      );
    case "iPad":
      return (
        <div className="grid h-full w-full place-items-center">
          <div className="h-full max-h-[540px] w-full max-w-[420px] rounded-[28px] bg-[#111] p-3 shadow-composer">{screen(16)}</div>
        </div>
      );
    default:
      return <div className="h-full w-full overflow-hidden rounded-xl border border-line">{screen(0)}</div>;
  }
}

export function BuilderPreview({ s, replay }: { s: BuilderState; replay: number }) {
  const p = palette(s);
  const anim = animationFor(s);
  const headingFont = s.headingFont ?? (s.typeface ? FAMILY_SAMPLE_FONT[s.typeface] : "Inter");
  const bodyFont = s.bodyFont ?? (s.typeface && !s.headingFont ? FAMILY_SAMPLE_FONT[s.typeface] : "Inter");
  const mobile = s.platform === "Mobile";
  const headline = HEADLINES[s.layoutType ?? ""] ?? "Create Beautiful Designs";
  const card = cardStyle(s, p);
  const glass = s.visualStyle === "Glass";

  if (s.agentSurface || s.agentParts.length) {
    return (
      <div key={replay} className="h-full w-full">
        <Framed s={s} page={p.page}>
          <div
            className="relative h-full overflow-hidden"
            style={{ fontFamily: `'${bodyFont}', system-ui`, color: p.text, background: glass ? `radial-gradient(circle at 20% 20%, ${p.accent}55, transparent 45%), radial-gradient(circle at 80% 60%, #38bdf855, transparent 40%), ${p.page}` : p.page }}
          >
            <AgentPreview s={s} p={p} card={card} button={buttonStyle(s, p)} />
          </div>
        </Framed>
      </div>
    );
  }

  const headingStyle: CSSProperties = {
    fontFamily: `'${headingFont}', system-ui`,
    fontSize: px(s.headingSize, mobile ? 30 : 48, mobile ? 0.8 : 0.72),
    fontWeight: s.weight ? FONT_WEIGHTS[s.weight] : 600,
    letterSpacing: s.spacing ? LETTER_SPACINGS[s.spacing] : "-0.025em",
    lineHeight: 1.08,
    color: p.text,
  };

  let order = 0;
  const words = headline.split(" ");
  const headingContent =
    s.scene === "Letter by letter"
      ? [...headline].map((ch, i) => <span key={i} style={{ ...anim(order++), display: "inline-block", whiteSpace: "pre" }}>{ch}</span>)
      : s.scene === "Word by word"
        ? words.map((w, i) => <span key={i} style={{ ...anim(order++), display: "inline-block", marginRight: "0.25em" }}>{w}</span>)
        : <span style={{ ...anim(order++), display: "inline-block" }}>{headline}</span>;

  return (
    <div key={replay} className="h-full w-full">
      <Framed s={s} page={p.page}>
        <div
          className="relative h-full overflow-hidden"
          style={{ fontFamily: `'${bodyFont}', system-ui`, color: p.text, background: glass ? `radial-gradient(circle at 20% 20%, ${p.accent}55, transparent 45%), radial-gradient(circle at 80% 60%, #38bdf855, transparent 40%), ${p.page}` : p.page }}
        >
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${p.border}` }}>
            <span className="text-[12px] font-semibold" style={{ fontFamily: `'${headingFont}'` }}>Lumen</span>
            {!mobile && <span className="flex gap-4 text-[11px]" style={{ color: p.muted }}><span>Product</span><span>Pricing</span><span>Docs</span></span>}
            <span style={{ ...buttonStyle(s, p), padding: "4px 10px", fontSize: 10.5 }}>Sign up</span>
          </div>
          <div className={mobile ? "px-5 pt-6" : "px-8 pt-8"}>
            <span className="mb-3 inline-flex rounded-full px-2.5 py-0.5 text-[10px]" style={{ ...anim(order++), border: `1px solid ${p.border}`, color: p.muted }}>
              {s.layoutType ?? "New Feature"}
            </span>
            <h3 style={headingStyle}>{headingContent}</h3>
            <p className="mt-3 max-w-md" style={{ ...anim(order++), fontSize: px(s.subheadingSize, 18, 0.72), color: p.muted, lineHeight: 1.4 }}>
              A short subheading that sets up the story.
            </p>
            <p className="mt-2 max-w-md" style={{ ...anim(order++), fontSize: px(s.bodySize, 14, 0.85), color: p.muted, lineHeight: 1.55 }}>
              This text shows how your selected body font reads in a paragraph with the chosen size applied.
            </p>
            <div className="mt-4" style={anim(order++)}>
              <span className="inline-block" style={buttonStyle(s, p)}>Get started</span>
            </div>
          </div>
          {s.layoutConfig && (
            <div className={mobile ? "mx-5 mt-5 h-40" : "mx-8 mt-6 h-36"} style={anim(order++)}>
              <LayoutConfigGlyph name={s.layoutConfig} gap={8} cellStyle={{ ...card, color: p.muted }} labels />
            </div>
          )}
        </div>
      </Framed>
    </div>
  );
}
