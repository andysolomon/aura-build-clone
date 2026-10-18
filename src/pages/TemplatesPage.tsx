import { Calendar, Crown, LayoutTemplate, List, Search } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { TemplateCard } from "../components/TemplateCard";
import { TEMPLATE_CATEGORIES, TEMPLATES } from "../data/templates";
import { cx } from "../lib/util";

export function TemplatesPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category");
  const tier = params.get("tier");
  const sort = params.get("sort") === "recent" ? "recent" : "popular";

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = TEMPLATES.filter(
      (t) =>
        (!category || t.category === category) &&
        (!tier || t.tier === tier) &&
        (!needle || `${t.title} ${t.description} ${t.category}`.toLowerCase().includes(needle)),
    );
    return sort === "popular" ? [...list].sort((a, b) => b.views - a.views) : [...list].reverse();
  }, [q, category, tier, sort]);

  const counts = { free: TEMPLATES.filter((t) => t.tier === "free").length, pro: TEMPLATES.filter((t) => t.tier === "pro").length };
  const chip = "h-8 rounded-full border px-3 text-[13px] transition";

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[1008px] -translate-x-1/2 border-x border-line lg:block" />
      <div className="h-24 border-b border-line" />
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1008px] items-center gap-10 px-6 py-8 lg:grid-cols-[1fr_288px]">
          <div>
            <p className="text-[12px] uppercase tracking-wide text-muted">Landing page templates</p>
            <h1 className="mt-3 text-[clamp(2.2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
              HTML &amp; Tailwind landing page templates
            </h1>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
              Browse reusable templates for SaaS, portfolio, ecommerce and services websites. Remix any design in the builder,
              ask the AI for changes, and export clean HTML when your page is ready.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-panel p-5 shadow-composer">
            <p className="text-[11px] uppercase tracking-wide text-muted">Template pulse</p>
            {[
              { label: "Free", value: counts.free, icon: LayoutTemplate, tone: "text-blue-500" },
              { label: "Pro", value: counts.pro, icon: Crown, tone: "text-amber-500" },
            ].map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="mt-3 flex items-center justify-between rounded-xl border border-line px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-muted">
                  <Icon className={cx("h-3.5 w-3.5", tone)} />
                  {label}
                </span>
                <span className="text-2xl font-semibold tracking-tight">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="h-6 border-b border-line" />

      <section className="relative px-3 pt-6 sm:px-10">
        <div className="mx-auto max-w-[1360px] rounded-3xl border border-line bg-panel p-6 shadow-composer">
          <div className="flex flex-wrap gap-2 rounded-xl border border-line p-1.5">
            <label className="flex min-w-60 flex-1 items-center gap-2 rounded-lg bg-subtle px-3">
              <Search className="h-4 w-4 text-muted" />
              <input
                value={q}
                onChange={(e) => update("q", e.target.value || null)}
                placeholder="Search templates..."
                className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-faint"
              />
            </label>
            {(["popular", "recent"] as const).map((s) => (
              <button
                key={s}
                onClick={() => update("sort", s === "popular" ? null : s)}
                className={cx("flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] capitalize", sort === s ? "border-line bg-subtle text-fg" : "border-transparent text-muted hover:text-fg")}
              >
                {s === "popular" ? <List className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                {s}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {TEMPLATE_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => update("category", category === c ? null : c)}
                className={cx(chip, category === c ? "border-accent/40 bg-accent/10 text-accent" : "border-line text-fg hover:bg-subtle")}
              >
                {c}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              {(["free", "pro"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update("tier", tier === t ? null : t)}
                  className={cx(chip, "capitalize", tier === t ? "border-accent/40 bg-accent/10 text-accent" : "border-line text-muted hover:text-fg")}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((t) => (
              <TemplateCard key={t.slug} template={t} />
            ))}
          </div>
          {results.length === 0 && <p className="py-20 text-center text-sm text-muted">No templates match those filters.</p>}
        </div>
      </section>
    </div>
  );
}
