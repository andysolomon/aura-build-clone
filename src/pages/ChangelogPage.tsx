import { RELEASES, type ChangeKind } from "../data/changelog";
import { cx } from "../lib/util";

const KIND_STYLE: Record<ChangeKind, string> = {
  new: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  improved: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  fixed: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function ChangelogPage() {
  const latest = RELEASES[0];
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[880px] -translate-x-1/2 border-x border-line lg:block" />
      <div className="h-24 border-b border-line" />
      <section className="border-b border-line px-6 py-10">
        <div className="mx-auto max-w-[880px]">
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Changelog</p>
          <h1 className="mt-3 text-[clamp(2.2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.035em]">Release history</h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
            What's new in the builder, release by release. Latest: <span className="text-fg">{latest.version}</span>, {formatDate(latest.date)}.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-[880px] px-6 py-12">
        <ol className="relative border-l border-line">
          {RELEASES.map((r) => (
            <li key={r.version} id={r.version} className="mb-14 pl-8 last:mb-0">
              <span className="absolute -left-[5px] mt-2 h-2.5 w-2.5 rounded-full border-2 border-canvas bg-ink" />
              <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted">
                <span className="rounded-md border border-line px-2 py-0.5 font-mono text-fg">{r.version}</span>
                <time dateTime={r.date}>{formatDate(r.date)}</time>
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">{r.title}</h2>
              <p className="mt-2 leading-relaxed text-muted">{r.summary}</p>
              <ul className="mt-5 space-y-2.5">
                {r.changes.map((c, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14.5px]">
                    <span className={cx("mt-0.5 w-[72px] shrink-0 rounded-md px-1.5 py-0.5 text-center text-[10.5px] font-semibold uppercase tracking-wide", KIND_STYLE[c.kind])}>{c.kind}</span>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
