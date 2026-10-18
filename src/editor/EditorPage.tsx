import { LayoutTemplate } from "lucide-react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import type { ChatMessage, PendingGeneration, Project, Version } from "../../shared/project";
import { splitGeneration, type GenerateRequest } from "../../shared/protocol";
import type { Device } from "../components/DeviceToggle";
import { PromptComposer, type ComposerState } from "../components/PromptComposer";
import { Button, Spinner } from "../components/ui";
import { api, streamGenerate } from "../lib/api";
import { reloadAppConfig, usableModel, useAppConfig } from "../lib/projects";
import { imageToJpegDataUrl } from "../lib/prefill";
import { resolveReference, resolveSkills } from "../lib/references";
import { now, pageTitle, thumbnail, uid } from "../lib/util";
import { applyPatch, selectorFor, sourceOuterHTML, withSourceAttributes, type Patch, type SelectionInfo } from "./bridge";
import { ChatPanel, type LiveGeneration } from "./ChatPanel";
import { CodeView } from "./CodeView";
import { EditorHeader, type EditorView } from "./EditorHeader";
import { Inspector } from "./Inspector";
import { PreviewFrame } from "./PreviewFrame";

const SAVE_DEBOUNCE_MS = 400;

function currentVersion(project: Project | null): Version | undefined {
  return project?.versions.find((v) => v.id === project.currentVersionId);
}

export function EditorPage() {
  const { projectId = "" } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const projectRef = useRef<Project | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const config = useAppConfig();
  const [composer, setComposer] = useState<ComposerState>({ prompt: "", model: "", designSystemId: null, referenceSlugs: [], skillSlugs: [], images: [], captures: [], webAccess: false });
  const [view, setView] = useState<EditorView>("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  // Bumped by "Reload preview" to rebuild the preview iframes from scratch.
  const [previewKey, setPreviewKey] = useState(0);

  const [live, setLive] = useState<LiveGeneration | null>(null);
  const [liveRaw, setLiveRaw] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const startedPending = useRef<string | null>(null);
  const composerInput = useRef<HTMLTextAreaElement>(null);

  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  // ---------- persistence ----------

  const flushSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = undefined;
    if (projectRef.current) void api.saveProject(projectRef.current).catch(() => {});
  }, []);

  const commit = useCallback((update: (p: Project) => Project) => {
    const prev = projectRef.current;
    if (!prev) return;
    const next = { ...update(prev), updatedAt: now() };
    projectRef.current = next;
    setProject(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
  }, [flushSave]);

  useEffect(() => {
    let cancelled = false;
    setProject(null);
    setLoadError(null);
    setSelection(null);
    undoStack.current = [];
    redoStack.current = [];
    api.getProject(projectId).then(
      (p) => {
        if (cancelled) return;
        projectRef.current = p;
        setProject(p);
        setComposer((c) => ({ ...c, model: p.model, designSystemId: p.designSystemId }));
        setView("preview");
      },
      (err: Error) => !cancelled && setLoadError(err.message),
    );
    const onUnload = () => saveTimer.current && flushSave();
    window.addEventListener("beforeunload", onUnload);
    return () => {
      cancelled = true;
      window.removeEventListener("beforeunload", onUnload);
      abortRef.current?.abort();
      if (saveTimer.current) flushSave();
    };
  }, [projectId, flushSave]);

  // ---------- generation ----------

  const generate = useCallback(async (input: PendingGeneration, scoped: GenerateRequest["selection"]) => {
    const start = projectRef.current;
    if (!start || abortRef.current) return;
    const baseHtml = currentVersion(start)?.html ?? null;

    // Imported sites: absolute URLs the page can embed, plus the shots as images for vision.
    const captures = input.captures ?? [];
    const screenshots = captures.flatMap((c) =>
      c.shots.map((s) => ({ url: new URL(s.path, window.location.origin).href, label: s.label, source: c.source, width: s.width, height: s.height })),
    );
    const captureImages = await Promise.all(captures.flatMap((c) => c.shots.map((s) => imageToJpegDataUrl(s.path).catch(() => null))));
    const images = [...input.images, ...captureImages.filter((x): x is string => x !== null)].slice(0, 4);

    const userMessage: ChatMessage = {
      id: uid(),
      role: "user",
      content: input.prompt,
      createdAt: now(),
      images: images.length ? await Promise.all(images.map((src) => thumbnail(src))) : undefined,
    };
    const history = start.messages.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content }));
    commit((p) => ({ ...p, model: input.model, designSystemId: input.designSystemId, messages: [...p.messages, userMessage] }));

    const controller = new AbortController();
    abortRef.current = controller;
    setLive({ status: "Thinking", reasoning: "", bytes: 0, prompt: input.prompt, startedAt: Date.now() });

    let raw = "";
    let reasoning = "";
    let lastRaw = 0;
    let finished = false;
    const fail = (content: string, error = true) =>
      commit((p) => ({ ...p, messages: [...p.messages, { id: uid(), role: "assistant", content, error, createdAt: now() }] }));

    try {
      const references = await Promise.all(
        input.referenceSlugs.map(resolveReference),
      );
      await streamGenerate(
        {
          prompt: input.prompt,
          model: input.model,
          designSystemId: input.designSystemId,
          html: baseHtml,
          selection: scoped,
          history,
          references,
          skills: resolveSkills(input.skillSlugs ?? []),
          images,
          screenshots,
          webAccess: input.webAccess,
        },
        (event) => {
          switch (event.type) {
            case "status":
              setLive((l) => l && { ...l, status: event.message });
              break;
            case "reasoning":
              reasoning += event.text;
              setLive((l) => l && { ...l, reasoning });
              break;
            case "delta": {
              raw += event.text;
              const t = Date.now();
              // Partial documents aren't rendered: pages often hide content until a closing
              // script runs, so the editor shows the code streaming in instead.
              if (t - lastRaw > 120) {
                lastRaw = t;
                setLiveRaw(raw);
                setLive((l) => l && { ...l, bytes: raw.length });
              }
              break;
            }
            case "done": {
              finished = true;
              const version: Version = { id: uid(), html: event.html, prompt: input.prompt, summary: event.summary, model: event.model, createdAt: now() };
              const message: ChatMessage = { id: uid(), role: "assistant", content: event.summary, createdAt: now(), versionId: version.id, reasoning: reasoning || undefined };
              const title = pageTitle(event.html);
              commit((p) => ({
                ...p,
                title: p.versions.length === 0 && title ? title.slice(0, 80) : p.title,
                versions: [...p.versions, version],
                currentVersionId: version.id,
                messages: [...p.messages, message],
              }));
              undoStack.current = [];
              redoStack.current = [];
              break;
            }
            case "error":
              finished = true;
              fail(event.message);
              // The server may have disabled the model after an auth failure.
              void reloadAppConfig();
              break;
          }
        },
        controller.signal,
      );
      if (!finished) fail("The connection closed before the page finished generating.");
    } catch (err) {
      if (controller.signal.aborted) fail("Stopped. The previous version is unchanged.", false);
      else fail(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      abortRef.current = null;
      setLive(null);
      setLiveRaw("");
    }
  }, [commit]);

  // Fall back to an available model if the project's provider is gone (or it was a remix).
  useEffect(() => {
    if (config) setComposer((c) => ({ ...c, model: usableModel(config, c.model) }));
  }, [config, project?.id]);

  // Start the generation queued by the home composer.
  useEffect(() => {
    if (!project?.pending || startedPending.current === project.id) return;
    startedPending.current = project.id;
    const pending = project.pending;
    commit((p) => ({ ...p, pending: undefined }));
    void generate(pending, null);
  }, [project, commit, generate]);

  const current = currentVersion(project);
  const html = current?.html ?? "";
  const scoped = view === "design" && selection ? selection : null;

  function submit() {
    const prompt = composer.prompt.trim();
    if (!prompt || live) return;
    const scope =
      scoped && html
        ? { selector: selectorFor(html, scoped.id) ?? scoped.tag, outerHTML: (sourceOuterHTML(html, scoped.id) ?? scoped.outerHTML).slice(0, 8000) }
        : null;
    void generate({ ...composer, prompt }, scope);
    setComposer((c) => ({ ...c, prompt: "", images: [], referenceSlugs: [], skillSlugs: [], captures: [] }));
  }

  // ---------- manual edits ----------

  const replaceHtml = useCallback((next: string, record = true) => {
    const p = projectRef.current;
    const cur = currentVersion(p);
    if (!p || !cur || next === cur.html) return;
    if (record) {
      undoStack.current.push(cur.html);
      redoStack.current = [];
    }
    commit((proj) => ({ ...proj, versions: proj.versions.map((v) => (v.id === proj.currentVersionId ? { ...v, html: next } : v)) }));
  }, [commit]);

  function patch(op: Patch) {
    if (!selection || !html) return;
    const result = applyPatch(html, selection.id, op);
    replaceHtml(result.html);
    setSelection(result.id === null ? null : { ...selection, id: result.id });
  }

  const onSelect = useCallback((info: SelectionInfo | null) => {
    const cur = currentVersion(projectRef.current);
    setSelection(info && cur ? withSourceAttributes(cur.html, info) : info);
  }, []);

  const onTextEdit = useCallback((id: number, fragment: string) => {
    const cur = currentVersion(projectRef.current);
    if (cur) replaceHtml(applyPatch(cur.html, id, { type: "text", html: fragment }).html);
  }, [replaceHtml]);

  const undo = useCallback(() => {
    const cur = currentVersion(projectRef.current);
    const prev = undoStack.current.pop();
    if (!cur || prev === undefined) return;
    redoStack.current.push(cur.html);
    replaceHtml(prev, false);
    rerender();
  }, [replaceHtml]);

  const redo = useCallback(() => {
    const cur = currentVersion(projectRef.current);
    const next = redoStack.current.pop();
    if (!cur || next === undefined) return;
    undoStack.current.push(cur.html);
    replaceHtml(next, false);
    rerender();
  }, [replaceHtml]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, [contenteditable]")) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === "Escape") {
        setSelection(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  /** Drops a failed turn (the prompt and its error) and runs the prompt again with the selected model. */
  function retry(errorId: string) {
    const p = projectRef.current;
    if (!p || live) return;
    const index = p.messages.findIndex((m) => m.id === errorId);
    const prompt = p.messages.slice(0, index).findLast((m) => m.role === "user");
    if (index === -1 || !prompt) return;
    commit((proj) => ({ ...proj, messages: proj.messages.filter((m) => m.id !== errorId && m.id !== prompt.id) }));
    void generate({ ...composer, prompt: prompt.content, referenceSlugs: [], skillSlugs: [], images: [], captures: [] }, null);
  }

  function restore(versionId: string) {
    commit((p) => ({ ...p, currentVersionId: versionId }));
    undoStack.current = [];
    redoStack.current = [];
    setSelection(null);
  }

  // ---------- render ----------

  if (loadError) {
    return (
      <div className="grid h-dvh place-items-center text-center">
        <div>
          <p className="text-lg font-medium">Project not found</p>
          <p className="mt-1 text-sm text-muted">{loadError}</p>
          <Link to="/" className="mt-6 inline-block"><Button variant="primary">Start a new page</Button></Link>
        </div>
      </div>
    );
  }
  if (!project) {
    return <div className="grid h-dvh place-items-center text-muted"><Spinner /></div>;
  }

  const previewHtml = html;
  const codeHtml = live ? splitGeneration(liveRaw).html || liveRaw : html;

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <EditorHeader
        projectId={project.id}
        title={project.title}
        html={html}
        publishedSlug={project.publishedSlug}
        busy={Boolean(live)}
        view={view}
        onView={(v) => {
          setView(v);
          if (v !== "design") setSelection(null);
        }}
        device={device}
        onDevice={setDevice}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onRename={(title) => commit((p) => ({ ...p, title }))}
        canUndo={undoStack.current.length > 0}
        canRedo={redoStack.current.length > 0}
        onUndo={undo}
        onRedo={redo}
        onPublished={(slug) => commit((p) => ({ ...p, publishedSlug: slug }))}
        onReloadPreview={() => {
          setSelection(null);
          setPreviewKey((k) => k + 1);
        }}
      />
      <div className="flex min-h-0 flex-1">
        {sidebarOpen && (
          <div className="w-[400px] shrink-0 border-r border-line bg-panel">
            <ChatPanel
              messages={project.messages}
              versions={project.versions}
              currentVersionId={project.currentVersionId}
              live={live}
              providers={config?.providers ?? []}
              onRestore={restore}
              onRetry={retry}
              onSuggestion={(prompt) => setComposer((c) => ({ ...c, prompt }))}
              composer={
                <PromptComposer
                  variant="panel"
                  state={composer}
                  onChange={setComposer}
                  onSubmit={submit}
                  busy={Boolean(live)}
                  onStop={() => abortRef.current?.abort()}
                  placeholder={html ? (scoped ? `Describe a change to this <${scoped.tag}>…` : "Ask for changes…") : "Build a cinematic SaaS homepage with pricing…"}
                  selectionLabel={scoped ? `<${scoped.tag}>` : null}
                  onClearSelection={() => setSelection(null)}
                  inputRef={composerInput}
                />
              }
            />
          </div>
        )}

        <div className="relative min-w-0 flex-1 bg-subtle/40">
          {view === "code" ? (
            <CodeView html={codeHtml} streaming={Boolean(live)} onSave={(next) => replaceHtml(next)} />
          ) : previewHtml ? (
            <PreviewFrame
              key={previewKey}
              html={previewHtml}
              device={device}
              designMode={view === "design" && !live}
              selectedId={selection?.id ?? null}
              onSelect={onSelect}
              onTextEdit={onTextEdit}
            />
          ) : (
            <EmptyPreview generating={Boolean(live)} code={codeHtml} />
          )}

          {view === "design" && selection && !live && (
            <Inspector
              selection={selection}
              onPatch={patch}
              onSelectParent={() => {
                const parentId = findParentId(html, selection.id);
                if (parentId !== null) setSelection({ ...selection, id: parentId });
              }}
              onAskAI={() => {
                setSidebarOpen(true);
                requestAnimationFrame(() => composerInput.current?.focus());
              }}
              onClose={() => setSelection(null)}
            />
          )}

          {view === "design" && !selection && html && !live && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-line bg-panel/95 px-3.5 py-1.5 text-[12px] text-muted shadow-composer backdrop-blur">
              Click any element to select it · double-click text to edit inline
            </div>
          )}

          {live && view !== "code" && previewHtml && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-panel/95 px-3.5 py-1.5 text-[12px] shadow-composer backdrop-blur">
              <Spinner className="h-3 w-3 text-accent" />
              <span className="shimmer-text font-medium">{live.status}</span>
              <span className="font-mono text-faint">{(live.bytes / 1024).toFixed(1)} KB</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function findParentId(html: string, id: number): number | null {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const all = Array.from(doc.body.querySelectorAll("*"));
  const parent = all[id]?.parentElement;
  if (!parent || parent === doc.body) return null;
  const index = all.indexOf(parent);
  return index === -1 ? null : index;
}

function StreamingCode({ code }: { code: string }) {
  const tail = code.split("\n").slice(-16).join("\n");
  return (
    <div className="absolute bottom-6 right-6 w-[440px] max-w-[calc(100%-3rem)] overflow-hidden rounded-2xl border border-line bg-panel/95 shadow-pop backdrop-blur">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[12px]">
        <span className="flex items-center gap-2 font-medium"><Spinner className="h-3 w-3 text-accent" /> Writing index.html</span>
        <span className="font-mono text-faint">{(code.length / 1024).toFixed(1)} KB</span>
      </div>
      <pre className="h-56 overflow-hidden whitespace-pre-wrap break-all px-4 py-3 font-mono text-[11px] leading-[1.55] text-muted [mask-image:linear-gradient(to_bottom,transparent,black_35%)]">{tail}</pre>
    </div>
  );
}

function EmptyPreview({ generating, code }: { generating: boolean; code: string }) {
  if (!generating) {
    return (
      <div className="grid h-full place-items-center text-center">
        <div>
          <LayoutTemplate className="mx-auto h-8 w-8 text-faint" />
          <p className="mt-3 text-sm text-muted">Your page will appear here.</p>
          <Link to="/templates" className="mt-2 inline-block text-sm text-accent hover:underline">Or start from a template</Link>
        </div>
      </div>
    );
  }
  const bar = "rounded-md bg-linear-to-r from-line via-line-soft to-line bg-[length:200%_100%] animate-shimmer";
  return (
    <div className="relative h-full overflow-hidden p-8">
      <div className="mx-auto h-full max-w-5xl rounded-2xl border border-line bg-panel p-10">
        <div className="flex items-center justify-between">
          <div className={`${bar} h-5 w-28`} />
          <div className="flex gap-6">{[0, 1, 2, 3].map((i) => <div key={i} className={`${bar} h-3 w-14`} />)}</div>
          <div className={`${bar} h-8 w-24 rounded-full`} />
        </div>
        <div className="mt-24 flex flex-col items-center gap-4">
          <div className={`${bar} h-4 w-48 rounded-full`} />
          <div className={`${bar} h-12 w-3/4`} />
          <div className={`${bar} h-12 w-1/2`} />
          <div className={`${bar} mt-2 h-4 w-2/3`} />
          <div className="mt-6 flex gap-3"><div className={`${bar} h-11 w-36 rounded-full`} /><div className={`${bar} h-11 w-32 rounded-full`} /></div>
        </div>
        <div className={`${bar} mt-16 h-64 w-full rounded-2xl`} />
      </div>
      {code && <StreamingCode code={code} />}
    </div>
  );
}
