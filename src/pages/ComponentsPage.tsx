import { Calendar, Crown, Eye, List, Package, Search, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { FilterChip, LibraryHero, LibraryPanel, PulseRow } from "../components/LibraryHero";
import { Avatar } from "../components/TemplateCard";
import { Badge } from "../components/ui";
import { componentThumbUrl, pseudoStats, useJson, type ComponentEntry } from "../lib/content";
import { compactNumber, cx } from "../lib/util";

export const COMPONENT_CATEGORIES = ["Hero", "Section", "Button", "Card", "Background", "Header", "Logo", "Feature", "Pricing", "Testimonial", "Footer", "Form", "Heading"];

export function ComponentCard({ component }: { component: ComponentEntry }) {
  const stats = pseudoStats(component.slug);
  return (
    <Link to={`/components/${component.slug}`} className="group block rounded-2xl border border-line bg-panel p-1.5 transition hover:-translate-y-0.5 hover:shadow-composer">
      <div className={cx("overflow-hidden rounded-xl border border-line-soft", component.background === "dark" ? "bg-zinc-950" : "bg-subtle")}>
        <img src={componentThumbUrl(component.slug)} alt={component.title} loading="lazy" className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="px-2 pb-1.5 pt-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate text-[13px] font-medium">{component.title}</h3>
          {component.tier === "pro" && <Badge tone="pro">Pro</Badge>}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11.5px] text-muted">
          <span className="flex min-w-0 items-center gap-1.5">
            <Avatar name={stats.author} />
            <span className="truncate">{stats.author}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2.5">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{compactNumber(stats.views)}</span>
            <span className="flex items-center gap-1"><Shuffle className="h-3 w-3" />{compactNumber(stats.remixes)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ComponentsPage() {
  const components = useJson<ComponentEntry[]>("/components/index.json", []);
  const [params, setParams] = useSearchParams();
  const [seed, setSeed] = useState(0);
  const q = params.get("q") ?? "";
  const category = params.get("category");
  const tier = params.get("tier");
  const sort = params.get("sort") ?? "popular";

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = components.filter(
      (c) =>
        (!category || c.category === category) &&
        (!tier || c.tier === tier) &&
        (!needle || `${c.title} ${c.description} ${c.category} ${c.tags.join(" ")}`.toLowerCase().includes(needle)),
    );
    if (sort === "recent") return [...list].reverse();
    if (sort === "explore") {
      // Deterministic shuffle per click of "Explore".
      return [...list].sort((a, b) => ((pseudoStats(a.slug + seed).views % 97) - (pseudoStats(b.slug + seed).views % 97)));
    }
    return [...list].sort((a, b) => pseudoStats(b.slug).views - pseudoStats(a.slug).views);
  }, [components, q, category, tier, sort, seed]);

  const counts = { all: components.length, free: components.filter((c) => c.tier === "free").length, pro: components.filter((c) => c.tier === "pro").length };
  const sortButton = (value: string, label: string, Icon: typeof List, onClick?: () => void) => (
    <button
      type="button"
      onClick={onClick ?? (() => update("sort", value === "popular" ? null : value))}
      className={cx("flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px]", sort === value ? "border-line bg-subtle text-fg" : "border-transparent text-muted hover:text-fg")}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );

  return (
    <div className="relative">
      <LibraryHero
        eyebrow="Browse components"
        title="Reusable UI components for front-end teams"
        description="Production-ready HTML and Tailwind components for heroes, buttons, cards, pricing, navbars, forms and more. Copy the code, remix one into a project, or @-reference it in a prompt."
        pulseTitle="Component pulse"
        pulse={
          <>
            <PulseRow icon={<Package className="h-3.5 w-3.5 text-blue-500" />} label="All" value={counts.all} active={!tier} onClick={() => update("tier", null)} />
            <PulseRow icon={<Package className="h-3.5 w-3.5 text-emerald-500" />} label="Free" value={counts.free} active={tier === "free"} onClick={() => update("tier", "free")} />
            <PulseRow icon={<Crown className="h-3.5 w-3.5 text-amber-500" />} label="Pro" value={counts.pro} active={tier === "pro"} onClick={() => update("tier", "pro")} />
          </>
        }
      />
      <LibraryPanel>
        <div className="flex flex-wrap gap-2 rounded-xl border border-line p-1.5">
          <label className="flex min-w-60 flex-1 items-center gap-2 rounded-lg bg-subtle px-3">
            <Search className="h-4 w-4 text-muted" />
            <input value={q} onChange={(e) => update("q", e.target.value || null)} placeholder={`Search ${components.length} components...`} className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-faint" />
          </label>
          {sortButton("popular", "Popular", List)}
          {sortButton("explore", "Explore", Shuffle, () => {
            setSeed((s) => s + 1);
            update("sort", "explore");
          })}
          {sortButton("recent", "Recent", Calendar)}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {COMPONENT_CATEGORIES.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => update("category", category === c ? null : c)}>
              {c}
            </FilterChip>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((c) => <ComponentCard key={c.slug} component={c} />)}
        </div>
        {components.length > 0 && results.length === 0 && <p className="py-20 text-center text-sm text-muted">No components match those filters.</p>}
        {components.length === 0 && <p className="py-20 text-center text-sm text-muted">Loading components…</p>}
      </LibraryPanel>
    </div>
  );
}
