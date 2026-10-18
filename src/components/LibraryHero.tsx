import type { ReactNode } from "react";
import { cx } from "../lib/util";

/** Hero shared by the library pages: eyebrow, headline and a "pulse" stats card, framed by guide lines. */
export function LibraryHero({ eyebrow, title, description, pulseTitle, pulse }: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  pulseTitle: string;
  pulse: ReactNode;
}) {
  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[1008px] -translate-x-1/2 border-x border-line lg:block" />
      <div className="h-24 border-b border-line" />
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1008px] items-center gap-10 px-6 py-8 lg:grid-cols-[1fr_288px]">
          <div>
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
            <h1 className="mt-3 text-[clamp(2.2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.035em]">{title}</h1>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">{description}</p>
          </div>
          <div className="rounded-2xl border border-line bg-panel p-5 shadow-composer">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{pulseTitle}</p>
            {pulse}
          </div>
        </div>
      </section>
      <div className="h-6 border-b border-line" />
    </>
  );
}

export function PulseRow({ icon, label, value, active, onClick }: { icon: ReactNode; label: string; value: number | string; active?: boolean; onClick?: () => void }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cx("mt-3 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition", active ? "border-line bg-subtle" : "border-line", onClick && "hover:bg-subtle")}
    >
      <span className="flex items-center gap-2 text-sm text-muted">
        {icon}
        {label}
      </span>
      <span className="text-2xl font-semibold tracking-tight">{typeof value === "number" ? value.toLocaleString() : value}</span>
    </Tag>
  );
}

/** Rounded panel that holds a library's toolbar and grid. */
export function LibraryPanel({ children }: { children: ReactNode }) {
  return (
    <section className="relative px-3 pt-6 sm:px-10">
      <div className="mx-auto max-w-[1360px] rounded-3xl border border-line bg-panel p-6 shadow-composer">{children}</div>
    </section>
  );
}

export function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx("h-8 rounded-full border px-3 text-[13px] transition", active ? "border-accent/40 bg-accent/10 text-accent" : "border-line text-fg hover:bg-subtle")}
    >
      {children}
    </button>
  );
}
