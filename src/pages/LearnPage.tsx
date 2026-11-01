import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  BookOpen,
  Bot,
  CircleHelp,
  Cpu,
  Globe,
  Keyboard,
  LayoutGrid,
  Lightbulb,
  MousePointer2,
  Palette,
  Pencil,
  Rocket,
  Sparkles,
  SquarePen,
  Type,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { LEARN_GROUPS, LEARN_PAGES } from "../lib/learn";
import { renderMarkdown } from "../lib/markdown";
import { cx } from "../lib/util";

const ICONS: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  bot: Bot,
  "mouse-pointer-2": MousePointer2,
  globe: Globe,
  cpu: Cpu,
  "wand-sparkles": WandSparkles,
  "at-sign": AtSign,
  lightbulb: Lightbulb,
  type: Type,
  palette: Palette,
  sparkles: Sparkles,
  "layout-grid": LayoutGrid,
  "circle-help": CircleHelp,
  keyboard: Keyboard,
  pencil: Pencil,
  "square-pen": SquarePen,
  rocket: Rocket,
};

/** Highlights the section currently in view. */
function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    setActive(ids[0] ?? null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export function LearnPage() {
  const { pageId } = useParams();
  const page = LEARN_PAGES.find((p) => p.slug === pageId);
  const rendered = useMemo(() => (page ? renderMarkdown(page.body) : null), [page]);
  const ids = useMemo(() => rendered?.headings.filter((h) => h.level === 2).map((h) => h.id) ?? [], [rendered]);
  const active = useActiveHeading(ids);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pageId]);

  if (LEARN_PAGES.length === 0) return <div className="grid h-[60vh] place-items-center text-muted">Docs are on their way.</div>;
  if (!page || !rendered) return <Navigate to={`/learn/${LEARN_PAGES[0].slug}`} replace />;

  const index = LEARN_PAGES.indexOf(page);
  const prev = LEARN_PAGES[index - 1];
  const next = LEARN_PAGES[index + 1];

  return (
    <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[256px_1fr]">
      <nav className="hidden border-r border-line lg:block">
        <div className="sticky top-[72px] max-h-[calc(100vh-72px)] overflow-y-auto px-4 py-6 scrollbar-thin">
          {LEARN_GROUPS.map((group) => {
            const pages = LEARN_PAGES.filter((p) => p.group === group);
            if (!pages.length) return null;
            return (
              <div key={group} className="mb-6">
                <div className="mb-2 px-3 text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted">{group}</div>
                {pages.map((p) => {
                  const Icon = ICONS[p.icon] ?? BookOpen;
                  return (
                    <Link
                      key={p.slug}
                      to={`/learn/${p.slug}`}
                      className={cx(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] transition",
                        p.slug === page.slug ? "bg-accent/10 text-accent" : "text-muted hover:bg-subtle hover:text-fg",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {p.title}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="min-w-0">
        <header className="border-b border-line px-6 py-14 md:px-12">
          <p className="text-[12px] uppercase tracking-[0.14em] text-muted">{page.group}</p>
          <h1 className="mt-3 text-[clamp(2.4rem,5vw,3.4rem)] font-medium tracking-[-0.04em]">{page.title}</h1>
          {page.description && <p className="mt-5 max-w-3xl text-[19px] leading-relaxed text-muted">{page.description}</p>}
          {/* Mobile page picker */}
          <select
            value={page.slug}
            onChange={(e) => (window.location.href = `/learn/${e.target.value}`)}
            className="mt-6 h-10 w-full rounded-lg border border-line bg-panel px-3 text-sm lg:hidden"
          >
            {LEARN_PAGES.map((p) => <option key={p.slug} value={p.slug}>{p.group} · {p.title}</option>)}
          </select>
        </header>

        <div className="grid gap-8 px-6 py-10 md:px-12 xl:grid-cols-[1fr_240px]">
          <div className="min-w-0">
            <article
              className="prose prose-zinc max-w-3xl dark:prose-invert prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-a:text-accent prose-code:rounded prose-code:bg-subtle prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-950 prose-pre:text-zinc-100"
              dangerouslySetInnerHTML={{ __html: rendered.html }}
            />
            <div className="mt-14 grid max-w-3xl gap-3 border-t border-line pt-6 sm:grid-cols-2">
              {prev ? (
                <Link to={`/learn/${prev.slug}`} className="rounded-xl border border-line p-4 transition hover:bg-subtle">
                  <span className="flex items-center gap-1 text-[12px] text-muted"><ArrowLeft className="h-3 w-3" /> Previous</span>
                  <span className="mt-1 block font-medium">{prev.title}</span>
                </Link>
              ) : <span />}
              {next && (
                <Link to={`/learn/${next.slug}`} className="rounded-xl border border-line p-4 text-right transition hover:bg-subtle">
                  <span className="flex items-center justify-end gap-1 text-[12px] text-muted">Next <ArrowRight className="h-3 w-3" /></span>
                  <span className="mt-1 block font-medium">{next.title}</span>
                </Link>
              )}
            </div>
          </div>

          {rendered.headings.length > 0 && (
            <aside className="hidden xl:block">
              <div className="sticky top-24 rounded-2xl border border-line bg-panel p-4">
                <p className="mb-2 text-[14px] font-medium">On this page</p>
                {rendered.headings.filter((h) => h.level === 2).map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={cx("block rounded-lg px-3 py-1.5 text-[13px] transition", active === h.id ? "bg-accent/10 text-accent" : "text-muted hover:text-fg")}
                  >
                    {h.text}
                  </a>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
