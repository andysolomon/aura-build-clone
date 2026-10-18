import { AtSign, BookText, Check, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useJson, type ComponentEntry } from "../lib/content";
import { SKILLS } from "../lib/skills";
import { MAX_REFERENCES, MAX_SKILLS, componentItems, templateItems, type ReferenceItem } from "../lib/references";
import { cx } from "../lib/util";
import { Popover } from "./ui";

type Tab = "templates" | "components" | "skills";

interface Props {
  open: boolean;
  onToggle: () => void;
  side: "top" | "bottom";
  buttonClassName: string;
  references: string[];
  skills: string[];
  onChange: (next: { references: string[]; skills: string[] }) => void;
}

export function useReferenceCatalog(): ReferenceItem[] {
  const components = useJson<ComponentEntry[]>("/components/index.json", []);
  return useMemo(() => [...templateItems(), ...componentItems(components)], [components]);
}

export function ReferenceMenu({ open, onToggle, side, buttonClassName, references, skills, onChange }: Props) {
  const [tab, setTab] = useState<Tab>("templates");
  const [query, setQuery] = useState("");
  const catalog = useReferenceCatalog();
  const needle = query.trim().toLowerCase();

  const items = catalog.filter((i) => (tab === "templates" ? i.kind === "template" : i.kind === "component") && (!needle || `${i.title} ${i.subtitle}`.toLowerCase().includes(needle)));
  const skillItems = SKILLS.filter((s) => !needle || `${s.name} ${s.description} ${s.tags.join(" ")}`.toLowerCase().includes(needle));
  const count = references.length + skills.length;

  const toggleRef = (ref: string) =>
    onChange({ skills, references: references.includes(ref) ? references.filter((r) => r !== ref) : [...references, ref].slice(-MAX_REFERENCES) });
  const toggleSkill = (slug: string) =>
    onChange({ references, skills: skills.includes(slug) ? skills.filter((s) => s !== slug) : [...skills, slug].slice(-MAX_SKILLS) });

  return (
    <div className="relative">
      <button type="button" title="Reference templates, components and skills" className={cx(buttonClassName, count > 0 && "text-accent")} onClick={onToggle}>
        <AtSign className="h-3.5 w-3.5" />
      </button>
      <Popover open={open} side={side} className="w-[22rem] p-0">
        <div className="flex gap-1 border-b border-line p-1.5">
          {(["templates", "components", "skills"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cx("h-7 flex-1 rounded-md text-[12px] capitalize transition", tab === t ? "bg-subtle text-fg" : "text-muted hover:text-fg")}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 border-b border-line px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${tab}`} className="h-7 flex-1 bg-transparent text-[13px] outline-none placeholder:text-faint" />
        </div>
        <div className="px-3 pt-2 text-[10.5px] uppercase tracking-wide text-faint">
          {tab === "skills" ? `Instructions the model follows (max ${MAX_SKILLS})` : `Visual references, HTML sent to the model (max ${MAX_REFERENCES})`}
        </div>
        <div className="max-h-72 overflow-y-auto p-1.5 scrollbar-thin">
          {tab === "skills"
            ? skillItems.map((s) => {
                const on = skills.includes(s.slug);
                return (
                  <button key={s.slug} type="button" onClick={() => toggleSkill(s.slug)} className={cx("flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-subtle", on && "bg-subtle")}>
                    <BookText className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{s.name}</span>
                      <span className="line-clamp-2 block text-[11.5px] text-muted">{s.description}</span>
                    </span>
                    {on && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })
            : items.map((i) => {
                const on = references.includes(i.ref);
                return (
                  <button key={i.ref} type="button" onClick={() => toggleRef(i.ref)} className={cx("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-subtle", on && "bg-subtle")}>
                    <img src={i.thumb} alt="" loading="lazy" className="h-9 w-14 shrink-0 rounded-md border border-line object-cover object-top" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{i.title}</span>
                      <span className="block text-[11.5px] text-muted">{i.subtitle}</span>
                    </span>
                    {on && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
          {(tab === "skills" ? skillItems.length : items.length) === 0 && <p className="px-3 py-6 text-center text-[12.5px] text-muted">Nothing matches “{query}”.</p>}
        </div>
      </Popover>
    </div>
  );
}

/** Chips for attached references and skills, shown above the composer textarea. */
export function ReferenceChips({ references, skills, onChange }: { references: string[]; skills: string[]; onChange: (next: { references: string[]; skills: string[] }) => void }) {
  const catalog = useReferenceCatalog();
  return (
    <>
      {references.map((ref) => {
        const item = catalog.find((i) => i.ref === ref);
        return (
          <span key={ref} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-subtle py-0.5 pl-0.5 pr-1 text-xs">
            {item && <img src={item.thumb} alt="" className="h-6 w-9 rounded-md object-cover object-top" />}
            @{(item?.title ?? ref).split(" — ")[0]}
            <button type="button" onClick={() => onChange({ skills, references: references.filter((r) => r !== ref) })} className="rounded p-0.5 text-muted hover:text-fg" aria-label="Remove reference">
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}
      {skills.map((slug) => {
        const name = SKILLS.find((s) => s.slug === slug)?.name ?? slug;
        return (
          <span key={slug} className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 py-1 pl-2 pr-1 text-xs text-violet-700 dark:text-violet-300">
            <BookText className="h-3 w-3" />@{name}
            <button type="button" onClick={() => onChange({ references, skills: skills.filter((s) => s !== slug) })} className="rounded p-0.5 hover:bg-violet-500/15" aria-label="Remove skill">
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}
    </>
  );
}
