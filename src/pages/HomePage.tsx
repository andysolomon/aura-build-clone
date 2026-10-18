import { ArrowRight, BadgePercent } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { findDesignSystem } from "../../shared/design-systems";
import type { ProjectSummary } from "../../shared/project";
import { PromptComposer, type ComposerState } from "../components/PromptComposer";
import { ProjectThumb } from "../components/ProjectThumb";
import { TemplateCard } from "../components/TemplateCard";
import { Button } from "../components/ui";
import { TEMPLATES } from "../data/templates";
import { api } from "../lib/api";
import { createProjectFromPrompt, usableModel, useAppConfig } from "../lib/projects";
import { takePrefill } from "../lib/prefill";
import { timeAgo } from "../lib/util";

const TYPEWRITER = [
  "A cinematic landing page for an AI note-taking app, dark with violet glow…",
  "Portfolio for a Lisbon architect, editorial serif, lots of whitespace…",
  "Coffee roaster storefront called “Kiln”, warm terracotta and cream…",
  "Launch page for wireless headphones with giant outlined type…",
];

export function HomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const config = useAppConfig();
  const [submitting, setSubmitting] = useState(false);
  const [recent, setRecent] = useState<ProjectSummary[]>([]);
  const [state, setState] = useState<ComposerState>(() => ({
    prompt: "",
    model: "",
    designSystemId: findDesignSystem(params.get("ds"))?.id ?? null,
    referenceSlugs: [],
    skillSlugs: [],
    images: [],
  }));

  useEffect(() => {
    if (config) setState((s) => ({ ...s, model: usableModel(config, s.model) }));
  }, [config]);

  // Library pages hand off a prompt, references, skills or images through sessionStorage.
  useEffect(() => {
    const prefill = takePrefill();
    if (!prefill) return;
    setState((s) => ({
      ...s,
      prompt: prefill.prompt ?? s.prompt,
      referenceSlugs: [...new Set([...s.referenceSlugs, ...(prefill.references ?? [])])].slice(-2),
      skillSlugs: [...new Set([...s.skillSlugs, ...(prefill.skills ?? [])])],
      images: [...s.images, ...(prefill.images ?? [])].slice(0, 4),
    }));
  }, []);

  useEffect(() => {
    api.listProjects().then((list) => setRecent(list.filter((p) => p.hasPage).slice(0, 3)), () => {});
  }, []);

  async function submit() {
    if (!state.prompt.trim() || submitting) return;
    setSubmitting(true);
    try {
      const id = await createProjectFromPrompt({
        prompt: state.prompt.trim(),
        model: state.model,
        designSystemId: state.designSystemId,
        referenceSlugs: state.referenceSlugs,
        skillSlugs: state.skillSlugs,
        images: state.images,
      });
      navigate(`/build/${id}`);
    } catch {
      setSubmitting(false);
    }
  }

  const featured = TEMPLATES.filter((t) => t.featured);
  const pro = TEMPLATES.filter((t) => t.tier === "pro" && !t.featured);
  const free = TEMPLATES.filter((t) => t.tier === "free");

  return (
    <>
      <section className="relative">
        {/* Vertical guide lines framing the hero column, as on aura.build */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-[672px] -translate-x-1/2 border-x border-line" />
        <div className="h-[152px] border-b border-line" />
        <div className="relative border-b border-line">
          <div className="mx-auto flex max-w-[1000px] flex-col items-center px-6 pt-2">
            <Link
              to="/pricing"
              className="mb-1 inline-flex items-center gap-2 rounded-full border border-line bg-subtle/70 px-3 py-1 text-[12.5px] text-fg transition hover:bg-subtle"
            >
              <BadgePercent className="h-3.5 w-3.5 text-muted" />
              Annual promo: paid annual plans are 50% off
            </Link>
            <h1 className="pb-1 text-center text-[clamp(2.75rem,6.4vw,4.1rem)] font-medium leading-[1.12] tracking-[-0.045em]">
              Create beautiful designs
            </h1>
          </div>
        </div>
        <div className="h-8 border-b border-line" />
        <div className="border-b border-line py-2.5 text-center text-[17px] text-muted">
          Generate top-tier landing pages in seconds.{" "}
          <Link to="/templates" className="ml-1.5 border-b border-line pb-0.5 text-fg/80 hover:text-fg">
            Browse templates.
          </Link>
        </div>
        <div className="h-8 border-b border-line" />
        <div className="relative border-b border-line px-4 py-4">
          <div className="mx-auto max-w-[640px]">
            <PromptComposer
              variant="hero"
              state={state}
              onChange={setState}
              onSubmit={submit}
              busy={submitting}
              typewriterLines={TYPEWRITER}
              autoFocus
              initialBuilderOpen={pathname === "/create"}
            />
            {config && !config.aiEnabled && (
              <p className="mt-3 text-center text-xs text-faint">
                Offline demo mode: sign in to Claude Code, Codex, Cursor or OpenCode (or set <code className="font-mono">ANTHROPIC_API_KEY</code>) to generate with AI.
              </p>
            )}
          </div>
        </div>
        <div className="h-16" />
      </section>

      {recent.length > 0 && (
        <Shelf title="Continue building" action={<Link to="/projects"><Button size="sm">All projects <ArrowRight className="h-3.5 w-3.5" /></Button></Link>}>
          {recent.map((p) => (
            <Link key={p.id} to={`/build/${p.id}`} className="group block rounded-2xl border border-line bg-panel p-1.5 transition hover:-translate-y-0.5 hover:shadow-composer">
              <ProjectThumb projectId={p.id} updatedAt={p.updatedAt} />
              <div className="flex items-center justify-between px-2 pb-1.5 pt-3 text-[13px]">
                <span className="truncate font-medium">{p.title}</span>
                <span className="shrink-0 text-[11.5px] text-muted">{timeAgo(p.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </Shelf>
      )}

      <Shelf title="Recently Featured" action={<BrowseButton label="Browse Featured" to="/templates" />}>
        {featured.map((t) => <TemplateCard key={t.slug} template={t} />)}
      </Shelf>
      <Shelf title="Pro Templates" action={<BrowseButton label="Browse Pro Templates" to="/templates?tier=pro" />}>
        {pro.map((t) => <TemplateCard key={t.slug} template={t} />)}
      </Shelf>
      <Shelf title="Free Templates" action={<BrowseButton label="Browse Free Templates" to="/templates?tier=free" />}>
        {free.slice(0, 3).map((t) => <TemplateCard key={t.slug} template={t} />)}
      </Shelf>
    </>
  );
}

function BrowseButton({ label, to }: { label: string; to: string }) {
  return (
    <Link to={to}>
      <Button size="sm">
        {label} <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </Link>
  );
}

function Shelf({ title, action, children }: { title: string; action: ReactNode; children: ReactNode }) {
  return (
    <section className="border-y border-line-soft py-1 [&+section]:mt-6">
      <div className="mx-auto max-w-[1120px] border-x border-line-soft bg-panel/40 px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-medium tracking-tight">{title}</h2>
          {action}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      </div>
    </section>
  );
}
