import { ArrowLeft, ArrowUpRight, AtSign, Check, Clock, Code, Copy, Eye, Flame, Link2, Search, Sparkles, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { LibraryHero, LibraryPanel } from "../components/LibraryHero";
import { Avatar } from "../components/TemplateCard";
import { Button } from "../components/ui";
import { renderMarkdown } from "../lib/markdown";
import { SKILLS, findSkill, type Skill } from "../lib/skills";
import { setPrefill } from "../lib/prefill";
import { compactNumber, cx } from "../lib/util";
import { NotFoundPage } from "./NotFoundPage";

const UPDATED = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Link to={`/skills/${skill.slug}`} className="group flex flex-col rounded-2xl border border-line bg-panel p-5 transition hover:-translate-y-0.5 hover:shadow-composer">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-medium tracking-tight">{skill.name}</h3>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-faint transition group-hover:text-fg" />
      </div>
      <p className="mt-2 line-clamp-3 flex-1 text-[14px] leading-relaxed text-muted">{skill.description}</p>
      <div className="mt-4 flex items-center justify-between text-[12px] text-muted">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{compactNumber(skill.views)} views</span>
          <span className="flex items-center gap-1"><Code className="h-3.5 w-3.5" />{compactNumber(skill.uses)} uses</span>
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[12px] text-muted">
        <span className="flex items-center gap-2"><Avatar name={skill.author} />{skill.author}</span>
        {skill.source && <span className="flex items-center gap-1 truncate"><Link2 className="h-3 w-3" />{skill.source}</span>}
      </div>
    </Link>
  );
}

export function SkillsPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const sort = params.get("sort") ?? "popular";

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = SKILLS.filter((s) => !needle || `${s.name} ${s.description} ${s.tags.join(" ")}`.toLowerCase().includes(needle));
    if (sort === "trending") return [...list].sort((a, b) => b.uses / Math.max(1, b.views) - a.uses / Math.max(1, a.views));
    if (sort === "recent") return [...list].sort((a, b) => a.views - b.views);
    return list;
  }, [q, sort]);

  return (
    <div className="relative">
      <LibraryHero
        eyebrow="Aura skills"
        title="AI agent skills for front-end teams and web designers"
        description={<>Reusable instruction sets for design systems, motion, copy, accessibility and more. Reference a skill with <code className="rounded bg-subtle px-1 font-mono text-[14px]">@</code> in your prompt and the model follows it while it builds.</>}
        pulseTitle="Library pulse"
        pulse={
          <>
            <p className="mt-4 flex items-baseline gap-2"><span className="text-4xl font-semibold tracking-tight">{SKILLS.length}</span><span className="text-muted">skills</span></p>
            <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-muted"><Sparkles className="h-3.5 w-3.5 text-amber-500" /> Updated {UPDATED}</p>
          </>
        }
      />
      <LibraryPanel>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-60 flex-1 items-center gap-2 rounded-full border border-line px-4 sm:max-w-md">
            <Search className="h-4 w-4 text-muted" />
            <input value={q} onChange={(e) => update("q", e.target.value || null)} placeholder="Search skills by name or intent" className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-faint" />
          </label>
          <div className="inline-flex rounded-full border border-line p-1">
            {[
              ["popular", "Popular", Flame],
              ["trending", "Trending", TrendingUp],
              ["recent", "Recent", Clock],
            ].map(([value, label, Icon]) => {
              const I = Icon as typeof Flame;
              return (
                <button
                  key={value as string}
                  type="button"
                  onClick={() => update("sort", value === "popular" ? null : (value as string))}
                  className={cx("flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium uppercase tracking-wide", sort === value ? "bg-subtle text-fg" : "text-muted hover:text-fg")}
                >
                  <I className="h-3.5 w-3.5" /> {label as string}
                </button>
              );
            })}
          </div>
          <span className="ml-auto text-[13px] text-muted">Showing {results.length} of {SKILLS.length} skills</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((s) => <SkillCard key={s.slug} skill={s} />)}
        </div>
        {SKILLS.length === 0 && <p className="py-20 text-center text-sm text-muted">No skills yet.</p>}
      </LibraryPanel>
    </div>
  );
}

export function SkillDetailPage() {
  const { slug } = useParams();
  const skill = findSkill(slug);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const rendered = useMemo(() => (skill ? renderMarkdown(skill.body) : null), [skill]);
  if (!skill || !rendered) return <NotFoundPage />;

  return (
    <div className="mx-auto max-w-[1180px] px-6 pb-10 pt-10">
      <Link to="/skills" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-3.5 w-3.5" /> All skills
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Skill</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em]">{skill.name}</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-muted">{skill.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={() => {
                setPrefill({ skills: [skill.slug] });
                navigate("/");
              }}
            >
              <AtSign className="h-4 w-4" /> Use in prompt
            </Button>
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(skill.body);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy instructions
            </Button>
          </div>
          <article
            className="prose prose-zinc mt-10 max-w-none rounded-2xl border border-line bg-panel p-8 dark:prose-invert prose-headings:tracking-tight prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-950 prose-pre:text-zinc-100"
            dangerouslySetInnerHTML={{ __html: rendered.html }}
          />
        </div>
        <aside className="h-fit rounded-2xl border border-line bg-panel p-5 text-sm lg:sticky lg:top-24">
          <dl className="space-y-3">
            <div className="flex justify-between"><dt className="text-muted">Views</dt><dd>{compactNumber(skill.views)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Uses</dt><dd>{compactNumber(skill.uses)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Updated</dt><dd>{UPDATED}</dd></div>
            <div className="flex items-center justify-between"><dt className="text-muted">Author</dt><dd className="flex items-center gap-2"><Avatar name={skill.author} />{skill.author}</dd></div>
            {skill.source && <div className="flex justify-between gap-3"><dt className="text-muted">Source</dt><dd className="truncate">{skill.source}</dd></div>}
          </dl>
          {skill.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-4">
              {skill.tags.map((t) => <span key={t} className="rounded-md bg-subtle px-2 py-0.5 text-[12px] text-muted">{t}</span>)}
            </div>
          )}
          <p className="mt-5 border-t border-line pt-4 text-[12px] leading-relaxed text-faint">
            Attached skills are sent to the model with your prompt as instructions it must follow.
          </p>
        </aside>
      </div>
    </div>
  );
}
