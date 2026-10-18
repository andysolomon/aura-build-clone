import {
  AppWindow,
  AppWindowMac,
  BadgeDollarSign,
  BookOpen,
  Briefcase,
  CircleHelp,
  CirclePlay,
  Compass,
  CreditCard,
  Footprints,
  Images,
  Info,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  Mail,
  Maximize,
  Megaphone,
  Monitor,
  Moon,
  Newspaper,
  PanelBottom,
  PanelsTopLeft,
  Quote,
  Settings,
  Smartphone,
  Sparkles,
  Square,
  Sun,
  Tablet,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { EASINGS, TAILWIND, shadowCss } from "../../data/promptBuilder";
import { cx } from "../../lib/util";

export function Tile({ label, selected, onClick, children, title }: {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      aria-label={label}
      aria-pressed={selected}
      className={cx(
        "flex w-20 flex-col items-center rounded-lg border p-1 transition",
        selected ? "border-accent bg-accent/10 ring-1 ring-accent/40" : "border-line hover:border-faint hover:bg-subtle",
      )}
    >
      <span className="grid h-[46px] w-full place-items-center overflow-hidden rounded-md bg-subtle/80">{children}</span>
      <span className={cx("mt-1 w-full truncate text-center text-[10px]", selected ? "text-accent" : "text-muted")}>{label}</span>
    </button>
  );
}

export function TileGroup({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11.5px] font-medium">{label}</span>
        {hint && <span className="text-[10.5px] text-faint">{hint}</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

const LAYOUT_ICONS: Record<string, LucideIcon> = {
  "Landing Page": PanelsTopLeft,
  Hero: Sparkles,
  Features: LayoutGrid,
  Pricing: BadgeDollarSign,
  Testimonials: Quote,
  Gallery: Images,
  Portfolio: Briefcase,
  Dashboard: LayoutDashboard,
  Login: LogIn,
  Onboarding: Footprints,
  Docs: BookOpen,
  Updates: Megaphone,
  Blog: Newspaper,
  Video: CirclePlay,
  Email: Mail,
  Payment: CreditCard,
  FAQ: CircleHelp,
  Explore: Compass,
  Settings,
  About: Info,
  Footer: PanelBottom,
  Profile: UserRound,
};

export function LayoutTypeGlyph({ name }: { name: string }) {
  const Icon = LAYOUT_ICONS[name] ?? LayoutGrid;
  return <Icon className="h-5 w-5 text-muted" strokeWidth={1.6} />;
}

// Mini wireframes: each cell is [column start, column end, row start, row end] on a grid.
const GRIDS: Record<string, { cols: number; rows: number; cells: [number, number, number, number][] }> = {
  "2-2 Square": { cols: 2, rows: 2, cells: [[1, 2, 1, 2], [2, 3, 1, 2], [1, 2, 2, 3], [2, 3, 2, 3]] },
  "Sidebar Left": { cols: 4, rows: 1, cells: [[1, 2, 1, 2], [2, 5, 1, 2]] },
  "Sidebar Right": { cols: 4, rows: 1, cells: [[1, 4, 1, 2], [4, 5, 1, 2]] },
  "1-1 Split": { cols: 2, rows: 1, cells: [[1, 2, 1, 2], [2, 3, 1, 2]] },
  "1-1 Vertical": { cols: 1, rows: 2, cells: [[1, 2, 1, 2], [1, 2, 2, 3]] },
  "1/3 2/3 Bento": { cols: 3, rows: 2, cells: [[1, 2, 1, 2], [2, 4, 1, 2], [1, 3, 2, 3], [3, 4, 2, 3]] },
  "2/3 1/3 Bento": { cols: 3, rows: 2, cells: [[1, 3, 1, 2], [3, 4, 1, 2], [1, 2, 2, 3], [2, 4, 2, 3]] },
  "1×4 Bento": { cols: 4, rows: 2, cells: [[1, 5, 1, 2], [1, 2, 2, 3], [2, 3, 2, 3], [3, 4, 2, 3], [4, 5, 2, 3]] },
  "Feature Bento": { cols: 3, rows: 3, cells: [[1, 3, 1, 3], [3, 4, 1, 2], [3, 4, 2, 3], [1, 2, 3, 4], [2, 3, 3, 4], [3, 4, 3, 4]] },
  "Featured Right": { cols: 3, rows: 2, cells: [[1, 3, 1, 3], [3, 4, 1, 2], [3, 4, 2, 3]] },
  "Featured Top": { cols: 3, rows: 3, cells: [[1, 4, 1, 3], [1, 2, 3, 4], [2, 3, 3, 4], [3, 4, 3, 4]] },
  "1/4 2/4 1/4 Bento": { cols: 4, rows: 2, cells: [[1, 2, 1, 2], [2, 4, 1, 2], [4, 5, 1, 2], [1, 3, 2, 3], [3, 5, 2, 3]] },
  "2/4 1/4 1/4 Bento": { cols: 4, rows: 2, cells: [[1, 3, 1, 2], [3, 4, 1, 2], [4, 5, 1, 2], [1, 3, 2, 3], [3, 5, 2, 3]] },
  "2-1 Split": { cols: 3, rows: 1, cells: [[1, 3, 1, 2], [3, 4, 1, 2]] },
  "1-2 Split": { cols: 3, rows: 1, cells: [[1, 2, 1, 2], [2, 4, 1, 2]] },
  "1-1-1 Equal": { cols: 3, rows: 1, cells: [[1, 2, 1, 2], [2, 3, 1, 2], [3, 4, 1, 2]] },
  "Header Focus": { cols: 1, rows: 5, cells: [[1, 2, 1, 3], [1, 2, 3, 6]] },
  "3-3 Grid": { cols: 3, rows: 2, cells: [[1, 2, 1, 2], [2, 3, 1, 2], [3, 4, 1, 2], [1, 2, 2, 3], [2, 3, 2, 3], [3, 4, 2, 3]] },
};

/** Wireframe of a layout configuration. Cells take the given style (used by the live preview too). */
export function LayoutConfigGlyph({ name, cellStyle, gap = 2, labels }: { name: string; cellStyle?: CSSProperties; gap?: number; labels?: boolean }) {
  const cell = cellStyle ?? { background: "var(--color-faint)", opacity: 0.45, borderRadius: 2 };
  const grid = GRIDS[name];
  if (grid) {
    return (
      <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, gridTemplateRows: `repeat(${grid.rows}, 1fr)`, gap }}>
        {grid.cells.map(([c1, c2, r1, r2], i) => (
          <div key={i} style={{ ...cell, gridColumn: `${c1} / ${c2}`, gridRow: `${r1} / ${r2}` }} className={labels ? "grid place-items-center text-[10px] opacity-70" : undefined}>
            {labels ? `${i + 1}` : null}
          </div>
        ))}
      </div>
    );
  }
  switch (name) {
    case "Card":
      return <div className="grid h-full w-full place-items-center"><div style={{ ...cell, width: "55%", height: "75%" }} /></div>;
    case "List":
      return <div className="flex h-full w-full flex-col justify-center" style={{ gap }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ ...cell, flex: 1 }} />)}</div>;
    case "Table":
      return (
        <div className="flex h-full w-full flex-col" style={{ gap }}>
          <div style={{ ...cell, flex: 1.2, opacity: 0.7 }} />
          {[0, 1, 2].map((r) => (
            <div key={r} className="flex flex-1" style={{ gap }}>{[0, 1, 2].map((c) => <div key={c} style={{ ...cell, flex: 1 }} />)}</div>
          ))}
        </div>
      );
    case "Carousel":
      return (
        <div className="flex h-full w-full items-center justify-center" style={{ gap }}>
          <div style={{ ...cell, width: "22%", height: "60%", opacity: 0.25 }} />
          <div style={{ ...cell, width: "44%", height: "90%" }} />
          <div style={{ ...cell, width: "22%", height: "60%", opacity: 0.25 }} />
        </div>
      );
    case "Modal":
      return (
        <div className="relative grid h-full w-full place-items-center">
          <div className="absolute inset-0" style={{ ...cell, opacity: 0.15 }} />
          <div className="relative" style={{ ...cell, width: "50%", height: "55%", opacity: 0.8 }} />
        </div>
      );
    case "Alert":
      return (
        <div className="flex h-full w-full flex-col" style={{ gap: gap * 2 }}>
          <div className="flex items-center" style={{ ...cell, height: "28%", opacity: 0.8 }} />
          <div style={{ ...cell, flex: 1, opacity: 0.2 }} />
        </div>
      );
    default:
      return null;
  }
}

const FRAMING_ICONS: Record<string, LucideIcon> = {
  "Full Screen": Maximize,
  Card: Square,
  Browser: AppWindow,
  "Mac App": AppWindowMac,
  "Clay Web": Monitor,
  iPhone: Smartphone,
  Android: Smartphone,
  iPad: Tablet,
  "Clay Mobile": Smartphone,
};

export function FramingGlyph({ name }: { name: string }) {
  const Icon = FRAMING_ICONS[name] ?? Square;
  return <Icon className={cx("h-5 w-5", name.startsWith("Clay") ? "text-sky-500" : "text-muted")} strokeWidth={1.6} />;
}

/** A tiny button rendered in each visual style. */
export function StyleGlyph({ name }: { name: string }) {
  const base = "px-2 py-1 text-[9px] font-medium";
  switch (name) {
    case "Flat":
      return <span className={cx(base, "rounded bg-blue-500 text-white")}>Button</span>;
    case "Outline":
      return <span className={cx(base, "rounded border border-current text-blue-500")}>Button</span>;
    case "Minimalist":
      return <span className={cx(base, "border-b border-current px-0 text-fg")}>Button</span>;
    case "Glass":
      return (
        <span className="relative grid h-full w-full place-items-center bg-gradient-to-br from-fuchsia-400/60 to-sky-400/60">
          <span className={cx(base, "rounded-md border border-white/50 bg-white/30 text-white backdrop-blur")}>Button</span>
        </span>
      );
    case "iOS":
      return <span className={cx(base, "rounded-full bg-[#007aff] px-3 text-white")}>Button</span>;
    case "Material":
      return <span className={cx(base, "rounded-[3px] bg-indigo-500 uppercase tracking-wider text-white shadow-[0_2px_4px_rgba(0,0,0,.3)]")}>Button</span>;
    default:
      return null;
  }
}

export function ThemeGlyph({ name }: { name: string }) {
  const dark = name === "Dark Mode";
  return (
    <span className={cx("grid h-full w-full place-items-center", dark ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-800")}>
      {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </span>
  );
}

export function SwatchGlyph({ name, dark }: { name: string; dark: boolean }) {
  if (name === "Primary") {
    return <span className="h-6 w-6 rounded-full border border-line" style={{ background: dark ? "#fafafa" : "#18181b" }} />;
  }
  if (name === "Transparent") {
    return (
      <span
        className="h-6 w-6 rounded-full border border-line"
        style={{ background: "repeating-conic-gradient(#d4d4d8 0% 25%, transparent 0% 50%) 50% / 8px 8px" }}
      />
    );
  }
  return <span className="h-6 w-6 rounded-full" style={{ background: TAILWIND[name]?.[2] }} />;
}

export function ShadowGlyph({ name }: { name: string }) {
  return <span className="h-6 w-10 rounded-md bg-white" style={{ boxShadow: shadowCss(name) ?? "none", outline: name === "None" ? "1px dashed var(--color-faint)" : undefined }} />;
}

export function FontGlyph({ font, weight, spacing, size }: { font: string; weight?: number; spacing?: string; size?: number }) {
  return (
    <span className="text-fg" style={{ fontFamily: `'${font}'`, fontWeight: weight, letterSpacing: spacing, fontSize: size ?? 20, lineHeight: 1 }}>
      Aa
    </span>
  );
}

export function animationName(type: string): string {
  return `pb-${type.toLowerCase().replace(/\s+/g, "-")}`;
}

export function AnimationGlyph({ type }: { type: string }) {
  const color = type === "Color" ? undefined : "var(--color-accent)";
  return (
    <span
      className="h-4 w-4 rounded-[4px]"
      style={{ background: color ?? "#3b82f6", animation: `${animationName(type)} 1.3s ease-in-out infinite alternate` }}
    />
  );
}

export function EasingGlyph({ easing }: { easing: string }) {
  return <span className="h-2.5 w-2.5 rounded-full bg-accent" style={{ animation: `pb-move 1.6s ${EASINGS[easing]} infinite alternate` }} />;
}

export function SceneGlyph({ scene }: { scene: string }) {
  const parts = scene === "Letter by letter" ? ["A", "a"] : scene === "Word by word" ? ["Aa", "Bb"] : scene === "Sequence" ? ["▬", "▬"] : ["Aa"];
  return (
    <span className="flex gap-0.5 text-[11px] text-fg">
      {parts.map((p, i) => (
        <span key={i} style={{ animation: `pb-fade 1.2s ease ${scene === "All at once" ? 0 : i * 0.35}s infinite alternate both` }}>
          {p}
        </span>
      ))}
    </span>
  );
}
