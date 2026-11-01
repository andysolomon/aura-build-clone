import { Check, ChevronDown, Code, Eraser, LayoutTemplate, Play, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ACCENT_COLORS,
  AGENT_PARTS,
  AGENT_RUNS,
  AGENT_SURFACES,
  ANIMATION_TYPES,
  BACKGROUND_COLORS,
  BODY_SIZES,
  BORDER_COLORS,
  DEFAULT_DURATION,
  DIRECTIONS,
  EASINGS,
  EMPTY_STATE,
  FAMILY_SAMPLE_FONT,
  FONT_WEIGHTS,
  FRAMINGS,
  HEADING_SIZES,
  ITERATIONS,
  LAYOUT_CONFIGS,
  LAYOUT_TYPES,
  LETTER_SPACINGS,
  PROMPT_LIBRARY,
  SCENES,
  SHADOWS,
  SUBHEADING_SIZES,
  THEMES,
  TYPEFACE_FAMILIES,
  VISUAL_STYLES,
  assemblePrompt,
  selectionLines,
  type BuilderState,
  type Platform,
} from "../../data/promptBuilder";
import { TEMPLATES, findTemplate, templateThumbUrl } from "../../data/templates";
import { cx } from "../../lib/util";
import { BuilderPreview } from "./BuilderPreview";
import {
  AgentPartGlyph,
  AgentSurfaceGlyph,
  AnimationGlyph,
  EasingGlyph,
  FontGlyph,
  FramingGlyph,
  LayoutConfigGlyph,
  LayoutTypeGlyph,
  SceneGlyph,
  ShadowGlyph,
  StyleGlyph,
  SwatchGlyph,
  ThemeGlyph,
  Tile,
  TileGroup,
} from "./tiles";

type SectionId = "source" | "layout" | "agent" | "framing" | "style" | "typography" | "animation";

/** Fonts offered for headings and body text when no typeface family is picked. */
const DEFAULT_FONTS = ["Inter", "Geist", "Manrope", "Playfair Display", "Instrument Serif", "IBM Plex Serif", "Nunito", "Varela Round", "JetBrains Mono", "Geist Mono", "Space Mono", "Rajdhani", "VT323", "Kanit", "DotGothic16", "Source Code Pro"];

const loadedFonts = new Set<string>();

/** Loads Google Fonts on demand: a tiny "Aa" subset for tiles, full weights for the preview. */
function loadFont(name: string, sampleOnly: boolean) {
  const key = `${sampleOnly ? "sample" : "full"}:${name}`;
  if (loadedFonts.has(key)) return;
  loadedFonts.add(key);
  const family = name.replace(/ /g, "+");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = sampleOnly
    ? `https://fonts.googleapis.com/css2?family=${family}&text=Aa&display=swap`
    : `https://fonts.googleapis.com/css2?family=${family}:wght@200;300;400;500;600;700;800;900&display=swap`;
  // Single-weight families reject the weight range; fall back to the regular face.
  link.addEventListener("error", () => {
    if (sampleOnly) return;
    const plain = document.createElement("link");
    plain.rel = "stylesheet";
    plain.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
    document.head.appendChild(plain);
  });
  document.head.appendChild(link);
}

interface Props {
  onClose: () => void;
  onApply: (result: { prompt: string; referenceSlug: string | null }) => void;
}

function Section({ id, title, count, open, onToggle, children }: {
  id: SectionId;
  title: string;
  count: number;
  open: boolean;
  onToggle: (id: SectionId) => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-line">
      <button type="button" onClick={() => onToggle(id)} className="flex w-full items-center justify-between px-4 py-3 text-left text-[13px] font-medium hover:bg-subtle/60">
        <span className="flex items-center gap-2">
          {title}
          {count > 0 && <span className="rounded-full bg-accent/15 px-1.5 text-[10.5px] text-accent">{count}</span>}
        </span>
        <ChevronDown className={cx("h-3.5 w-3.5 text-muted transition", open && "rotate-180")} />
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

function Chip({ text, on, onClick, onRemove, mono = true }: { text: string; on: boolean; onClick: () => void; onRemove?: () => void; mono?: boolean }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onClick())}
      className={cx(
        "group flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-1.5 text-[11.5px] leading-snug transition",
        mono && "font-mono",
        on ? "border-accent/40 bg-accent/10 text-fg" : "border-line bg-canvas text-muted hover:border-faint hover:text-fg",
      )}
    >
      <span className={cx("mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded border", on ? "border-accent bg-accent text-white" : "border-faint")}>
        {on && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1 break-words">{text}</span>
      {onRemove && (
        <button
          type="button"
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hidden text-faint hover:text-fg group-hover:block"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 flex justify-between text-[11.5px] font-medium">
        {label}
        <span className="font-mono text-[11px] text-muted">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-[var(--color-accent)]" />
    </label>
  );
}

export function PromptBuilder({ onClose, onApply }: Props) {
  const [s, setS] = useState<BuilderState>(EMPTY_STATE);
  const [openSection, setOpenSection] = useState<SectionId | null>("layout");
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [snippets, setSnippets] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState<{ text: string; on: boolean }[]>([]);
  const [draft, setDraft] = useState("");
  const [templateSlug, setTemplateSlug] = useState<string | null>(null);
  const [html, setHtml] = useState("");
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    for (const font of new Set([...DEFAULT_FONTS, ...Object.values(TYPEFACE_FAMILIES).flat()])) loadFont(font, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  useEffect(() => {
    for (const font of [s.headingFont, s.bodyFont, s.typeface && FAMILY_SAMPLE_FONT[s.typeface]]) if (font) loadFont(font, false);
  }, [s.headingFont, s.bodyFont, s.typeface]);

  /** Single-choice options toggle off when clicked again. */
  const pick = <K extends keyof BuilderState>(key: K, value: BuilderState[K]) =>
    setS((prev) => ({ ...prev, [key]: prev[key] === value ? EMPTY_STATE[key] : value }));

  const setPlatform = (platform: Platform) =>
    setS((prev) => ({
      ...prev,
      platform,
      layoutType: prev.layoutType && LAYOUT_TYPES[platform].includes(prev.layoutType) ? prev.layoutType : null,
      layoutConfig: prev.layoutConfig && LAYOUT_CONFIGS[platform].includes(prev.layoutConfig) ? prev.layoutConfig : null,
      framing: prev.framing && FRAMINGS[platform].includes(prev.framing) ? prev.framing : null,
    }));

  const template = findTemplate(templateSlug ?? undefined);
  const templateLine = template ? `Adapt from the "${template.title}" template` : null;
  const htmlLine = html.trim() ? `Adapt from HTML code (${html.trim().length} chars)` : null;
  const generated = useMemo(() => [templateLine, htmlLine, ...selectionLines(s)].filter((l): l is string => Boolean(l)), [s, templateLine, htmlLine]);

  const prompt = useMemo(() => {
    const blocks = htmlLine && !excluded.has(htmlLine) ? [`Adapt from HTML code:\n\`\`\`html\n${html.trim()}\n\`\`\``] : [];
    const lines = [
      ...generated.filter((l) => l !== htmlLine && !excluded.has(l)),
      ...PROMPT_LIBRARY.flatMap((g) => g.items).filter((item) => snippets.has(item)),
      ...custom.filter((c) => c.on).map((c) => c.text),
    ];
    return assemblePrompt(blocks, lines);
  }, [generated, htmlLine, html, excluded, snippets, custom]);

  const toggleIn = (set: Set<string>, value: string) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  function reset() {
    setS(EMPTY_STATE);
    setExcluded(new Set());
    setSnippets(new Set());
    setCustom([]);
    setTemplateSlug(null);
    setHtml("");
  }

  function addCustom() {
    const text = draft.trim();
    if (!text) return;
    setCustom((c) => [...c, { text, on: true }]);
    setDraft("");
  }

  const counts: Record<SectionId, number> = {
    source: (templateSlug ? 1 : 0) + (html.trim() ? 1 : 0),
    layout: [s.layoutType, s.layoutConfig].filter(Boolean).length,
    agent: [s.agentSurface, s.agentRun].filter(Boolean).length + s.agentParts.length,
    framing: s.framing ? 1 : 0,
    style: [s.visualStyle, s.theme, s.accent, s.background, s.border, s.shadow].filter(Boolean).length,
    typography: [s.typeface, s.headingFont, s.bodyFont, s.headingSize, s.subheadingSize, s.bodySize, s.weight, s.spacing].filter(Boolean).length,
    animation: s.animations.length + [s.scene, s.easing, s.iterations, s.direction].filter(Boolean).length + (s.duration !== DEFAULT_DURATION ? 1 : 0) + (s.delay > 0 ? 1 : 0),
  };
  const toggleSection = (id: SectionId) => setOpenSection((cur) => (cur === id ? null : id));
  const dark = s.theme === "Dark Mode";
  const fonts = s.typeface ? TYPEFACE_FAMILIES[s.typeface] : DEFAULT_FONTS;
  const includedCount = generated.filter((l) => !excluded.has(l)).length + snippets.size + custom.filter((c) => c.on).length;

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-2 backdrop-blur-sm sm:p-5" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Prompt Builder"
        onMouseDown={(e) => e.stopPropagation()}
        className="flex h-full max-h-[900px] w-full max-w-[1440px] animate-fade-in flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-pop"
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight">Prompt Builder</h2>
            <p className="text-[11.5px] text-muted">Pick layout, agent UI, style, type and motion. Each choice becomes a precise instruction.</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={reset} className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] text-muted hover:bg-subtle hover:text-fg">
              <Eraser className="h-3.5 w-3.5" /> Reset
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-fg">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[384px_1fr] xl:grid-cols-[384px_1fr_380px]">
          {/* Options */}
          <div className="min-h-0 overflow-y-auto border-r border-line scrollbar-thin">
            <Section id="source" title="Start from" count={counts.source} open={openSection === "source"} onToggle={toggleSection}>
              <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-medium"><LayoutTemplate className="h-3.5 w-3.5" /> Adapt from template</div>
              <div className="mb-4 grid grid-cols-2 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => setTemplateSlug((cur) => (cur === t.slug ? null : t.slug))}
                    className={cx("overflow-hidden rounded-lg border text-left transition", templateSlug === t.slug ? "border-accent ring-2 ring-accent/30" : "border-line hover:border-faint")}
                  >
                    <img src={templateThumbUrl(t.slug)} alt="" className="aspect-[16/10] w-full object-cover object-top" />
                    <span className="block truncate px-2 py-1 text-[10.5px]">{t.title.split(" — ")[0]}</span>
                  </button>
                ))}
              </div>
              <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-medium"><Code className="h-3.5 w-3.5" /> Adapt from HTML</div>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Paste HTML code here..."
                rows={5}
                spellCheck={false}
                className="w-full resize-y rounded-lg border border-line bg-canvas p-2.5 font-mono text-[11px] outline-none focus:border-faint"
              />
            </Section>

            <Section id="layout" title="Layout" count={counts.layout} open={openSection === "layout"} onToggle={toggleSection}>
              <div className="mb-3 inline-flex rounded-lg border border-line bg-subtle/70 p-0.5">
                {(["Web", "Mobile"] as const).map((pf) => (
                  <button key={pf} type="button" onClick={() => setPlatform(pf)} className={cx("h-6 rounded-md px-3 text-[12px]", s.platform === pf ? "bg-panel text-fg shadow-sm" : "text-muted")}>
                    {pf}
                  </button>
                ))}
              </div>
              <TileGroup label="Layout Type">
                {LAYOUT_TYPES[s.platform].map((t) => (
                  <Tile key={t} label={t} selected={s.layoutType === t} onClick={() => pick("layoutType", t)}>
                    <LayoutTypeGlyph name={t} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Layout Configuration">
                {LAYOUT_CONFIGS[s.platform].map((c) => (
                  <Tile key={c} label={c} selected={s.layoutConfig === c} onClick={() => pick("layoutConfig", c)}>
                    <span className="block h-[34px] w-[56px]"><LayoutConfigGlyph name={c} /></span>
                  </Tile>
                ))}
              </TileGroup>
            </Section>

            <Section id="agent" title="Agent UI" count={counts.agent} open={openSection === "agent"} onToggle={toggleSection}>
              <p className="mb-3 text-[11.5px] leading-relaxed text-muted">Build a working agent interface instead of a marketing page: pick a surface, the parts each reply shows, and how the scripted run plays.</p>
              <TileGroup label="Surface">
                {Object.keys(AGENT_SURFACES).map((name) => (
                  <Tile key={name} label={name} title={`${name}: ${AGENT_SURFACES[name]}`} selected={s.agentSurface === name} onClick={() => pick("agentSurface", name)}>
                    <AgentSurfaceGlyph name={name} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Message Parts" hint="Select multiple">
                {Object.keys(AGENT_PARTS).map((part) => (
                  <Tile
                    key={part}
                    label={part}
                    title={`${part}: ${AGENT_PARTS[part]}`}
                    selected={s.agentParts.includes(part)}
                    onClick={() => setS((prev) => ({ ...prev, agentParts: prev.agentParts.includes(part) ? prev.agentParts.filter((x) => x !== part) : [...prev.agentParts, part] }))}
                  >
                    <AgentPartGlyph name={part} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Run">
                {Object.keys(AGENT_RUNS).map((run) => (
                  <Tile key={run} label={run} title={`${run}: ${AGENT_RUNS[run]}`} selected={s.agentRun === run} onClick={() => pick("agentRun", run)}>
                    <AgentPartGlyph name={run} />
                  </Tile>
                ))}
              </TileGroup>
            </Section>

            <Section id="framing" title="Framing" count={counts.framing} open={openSection === "framing"} onToggle={toggleSection}>
              <TileGroup label={s.platform === "Web" ? "Web framing" : "Device framing"}>
                {FRAMINGS[s.platform].map((f) => (
                  <Tile key={f} label={f} selected={s.framing === f} onClick={() => pick("framing", f)}>
                    <FramingGlyph name={f} />
                  </Tile>
                ))}
              </TileGroup>
            </Section>

            <Section id="style" title="Style" count={counts.style} open={openSection === "style"} onToggle={toggleSection}>
              <TileGroup label="Style">
                {VISUAL_STYLES.map((v) => (
                  <Tile key={v} label={v} selected={s.visualStyle === v} onClick={() => pick("visualStyle", v)}>
                    <StyleGlyph name={v} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Theme">
                {THEMES.map((t) => (
                  <Tile key={t} label={t} selected={s.theme === t} onClick={() => pick("theme", t)}>
                    <ThemeGlyph name={t} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Accent Color" hint="Tailwind 500">
                {ACCENT_COLORS.map((c) => (
                  <Tile key={c} label={c} selected={s.accent === c} onClick={() => pick("accent", c)}>
                    <SwatchGlyph name={c} dark={dark} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Background Color" hint={dark ? "Tailwind 900" : "Tailwind 100"}>
                {BACKGROUND_COLORS.map((c) => (
                  <Tile key={c} label={c} selected={s.background === c} onClick={() => pick("background", c)}>
                    <SwatchGlyph name={c} dark={dark} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Border Color" hint={dark ? "Tailwind 800" : "Tailwind 200"}>
                {BORDER_COLORS.map((c) => (
                  <Tile key={c} label={c} selected={s.border === c} onClick={() => pick("border", c)}>
                    <SwatchGlyph name={c} dark={dark} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Shadow">
                {Object.keys(SHADOWS).map((sh) => (
                  <Tile key={sh} label={sh} selected={s.shadow === sh} onClick={() => pick("shadow", sh)}>
                    <ShadowGlyph name={sh} />
                  </Tile>
                ))}
              </TileGroup>
            </Section>

            <Section id="typography" title="Typography" count={counts.typography} open={openSection === "typography"} onToggle={toggleSection}>
              <TileGroup label="Typeface Family">
                {Object.keys(TYPEFACE_FAMILIES).map((f) => (
                  <Tile key={f} label={f[0] + f.slice(1).toLowerCase()} selected={s.typeface === f} onClick={() => pick("typeface", f)}>
                    <FontGlyph font={FAMILY_SAMPLE_FONT[f]} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Heading Font">
                {fonts.map((f) => (
                  <Tile key={f} label={f} selected={s.headingFont === f} onClick={() => pick("headingFont", f)}>
                    <FontGlyph font={f} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Body & UI Font">
                {fonts.map((f) => (
                  <Tile key={f} label={f} selected={s.bodyFont === f} onClick={() => pick("bodyFont", f)}>
                    <FontGlyph font={f} size={16} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Heading Size">
                {HEADING_SIZES.map((size, i) => (
                  <Tile key={size} label={size} selected={s.headingSize === size} onClick={() => pick("headingSize", size)}>
                    <FontGlyph font="Inter" size={12 + i * 5} weight={600} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Subheading Size">
                {SUBHEADING_SIZES.map((size, i) => (
                  <Tile key={size} label={size} selected={s.subheadingSize === size} onClick={() => pick("subheadingSize", size)}>
                    <FontGlyph font="Inter" size={11 + i * 3} weight={500} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Body Text Size">
                {BODY_SIZES.map((size, i) => (
                  <Tile key={size} label={size} selected={s.bodySize === size} onClick={() => pick("bodySize", size)}>
                    <FontGlyph font="Inter" size={10 + i * 2} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Heading Font Weight">
                {Object.entries(FONT_WEIGHTS).map(([name, weight]) => (
                  <Tile key={name} label={name} selected={s.weight === name} onClick={() => pick("weight", name)}>
                    <FontGlyph font="Inter" weight={weight} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Heading Letter Spacing">
                {Object.entries(LETTER_SPACINGS).map(([name, spacing]) => (
                  <Tile key={name} label={name} selected={s.spacing === name} onClick={() => pick("spacing", name)}>
                    <FontGlyph font="Inter" spacing={spacing} size={17} weight={500} />
                  </Tile>
                ))}
              </TileGroup>
            </Section>

            <Section id="animation" title="Animation" count={counts.animation} open={openSection === "animation"} onToggle={toggleSection}>
              <TileGroup label="Animation Type" hint="Select multiple">
                {ANIMATION_TYPES.map((a) => (
                  <Tile
                    key={a}
                    label={a}
                    selected={s.animations.includes(a)}
                    onClick={() => setS((prev) => ({ ...prev, animations: prev.animations.includes(a) ? prev.animations.filter((x) => x !== a) : [...prev.animations, a] }))}
                  >
                    <AnimationGlyph type={a} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Scene">
                {SCENES.map((sc) => (
                  <Tile key={sc} label={sc} selected={s.scene === sc} onClick={() => pick("scene", sc)}>
                    <SceneGlyph scene={sc} />
                  </Tile>
                ))}
              </TileGroup>
              <Slider label="Duration" value={s.duration} min={0.1} max={3} step={0.1} onChange={(duration) => setS((p) => ({ ...p, duration }))} format={(v) => `${v.toFixed(1)}s`} />
              <Slider label="Delay" value={s.delay} min={0} max={2} step={0.1} onChange={(delay) => setS((p) => ({ ...p, delay }))} format={(v) => `${v.toFixed(1)}s`} />
              <TileGroup label="Timing">
                {Object.keys(EASINGS).map((e) => (
                  <Tile key={e} label={e} selected={s.easing === e} onClick={() => pick("easing", e)}>
                    <EasingGlyph easing={e} />
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Iterations">
                {Object.keys(ITERATIONS).map((it) => (
                  <Tile key={it} label={it} selected={s.iterations === it} onClick={() => pick("iterations", it)}>
                    <span className="text-[15px] font-medium text-fg">{it === "Infinite" ? "∞" : `${ITERATIONS[it]}×`}</span>
                  </Tile>
                ))}
              </TileGroup>
              <TileGroup label="Direction">
                {Object.keys(DIRECTIONS).map((d) => (
                  <Tile key={d} label={d} selected={s.direction === d} onClick={() => pick("direction", d)}>
                    <span className="text-[15px] text-fg">{{ Normal: "→", Reverse: "←", Alternate: "⇄", "Alternate Reverse": "⇆" }[d]}</span>
                  </Tile>
                ))}
              </TileGroup>
            </Section>
          </div>

          {/* Live preview */}
          <div className="relative hidden min-h-0 flex-col bg-subtle/50 md:flex">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-4 text-[12px] text-muted">
              <span>Live preview</span>
              <button
                type="button"
                onClick={() => setReplay((r) => r + 1)}
                disabled={!s.animations.length}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1 text-[11.5px] font-medium text-white transition hover:opacity-90 disabled:opacity-35"
              >
                <Play className="h-3 w-3 fill-current" /> Replay Animation
              </button>
            </div>
            <div className="min-h-0 flex-1 p-6">
              <BuilderPreview s={s} replay={replay} />
            </div>
          </div>

          {/* Generated prompts */}
          <div className="flex min-h-0 flex-col border-l border-line md:col-span-2 xl:col-span-1">
            <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[12.5px] font-semibold">Generated Prompts</h3>
                <span className="text-[11px] text-faint">{includedCount} included</span>
              </div>
              {generated.length === 0 ? (
                <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-[11.5px] text-faint">Choose options on the left and their instructions appear here.</p>
              ) : (
                <div className="space-y-1.5">
                  {generated.map((line) => (
                    <Chip key={line} text={line} on={!excluded.has(line)} onClick={() => setExcluded((e) => toggleIn(e, line))} />
                  ))}
                </div>
              )}

              <div className="mt-5">
                <h3 className="mb-2 text-[12.5px] font-semibold">Custom</h3>
                <div className="space-y-1.5">
                  {custom.map((c, i) => (
                    <Chip
                      key={i}
                      text={c.text}
                      on={c.on}
                      mono={false}
                      onClick={() => setCustom((list) => list.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))}
                      onRemove={() => setCustom((list) => list.filter((_, j) => j !== i))}
                    />
                  ))}
                </div>
                <div className="mt-1.5 flex gap-1.5">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustom()}
                    placeholder="Enter custom prompt here..."
                    className="h-8 min-w-0 flex-1 rounded-lg border border-line bg-canvas px-2.5 text-[12px] outline-none focus:border-faint"
                  />
                  <button type="button" onClick={addCustom} disabled={!draft.trim()} className="flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-[12px] hover:bg-subtle disabled:opacity-40">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="mb-2 text-[12.5px] font-semibold">Prompt library</h3>
                {PROMPT_LIBRARY.map((group) => (
                  <div key={group.group} className="mb-3">
                    <div className="mb-1.5 text-[10.5px] uppercase tracking-wide text-faint">{group.group}</div>
                    <div className="space-y-1.5">
                      {group.items.map((item) => (
                        <Chip key={item} text={item} mono={false} on={snippets.has(item)} onClick={() => setSnippets((set) => toggleIn(set, item))} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-line bg-panel p-3">
              <div className="mb-2 max-h-28 overflow-y-auto rounded-lg bg-subtle/70 p-2.5 text-[11.5px] leading-relaxed text-muted scrollbar-thin">
                {prompt || <span className="text-faint">Your prompt will appear here.</span>}
              </div>
              <button
                type="button"
                disabled={!prompt}
                onClick={() => {
                  onApply({ prompt, referenceSlug: templateLine && !excluded.has(templateLine) ? templateSlug : null });
                  onClose();
                }}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-ink text-[13px] font-medium text-ink-fg transition hover:opacity-90 disabled:opacity-40"
              >
                Add to Prompt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
