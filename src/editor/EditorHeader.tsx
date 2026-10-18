import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Globe,
  PanelLeft,
  RotateCw,
  Plus,
  Redo2,
  Undo2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { ProjectSummary } from "../../shared/project";
import { DeviceToggle, type Device } from "../components/DeviceToggle";
import { Button, MenuItem, Popover, Spinner } from "../components/ui";
import { api } from "../lib/api";
import { cx, downloadFile, slugify, timeAgo, useDismiss } from "../lib/util";

export type EditorView = "preview" | "design" | "code";

interface Props {
  projectId: string;
  title: string;
  html: string;
  publishedSlug?: string;
  busy: boolean;
  view: EditorView;
  onView: (view: EditorView) => void;
  device: Device;
  onDevice: (device: Device) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onRename: (title: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onPublished: (slug: string) => void;
  onReloadPreview: () => void;
}

function ChatsMenu({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));
  const navigate = useNavigate();

  function toggle() {
    if (!open) api.listProjects().then(setProjects, () => setProjects([]));
    setOpen(!open);
  }

  return (
    <div ref={ref} className="relative">
      <Button size="sm" onClick={toggle}>
        Chats <ChevronDown className="h-3 w-3 text-muted" />
      </Button>
      <Popover open={open} className="w-72">
        <MenuItem onClick={() => navigate("/")}>
          <Plus className="h-3.5 w-3.5" /> New chat
        </MenuItem>
        <div className="my-1 border-t border-line" />
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {projects === null ? (
            <div className="grid h-16 place-items-center"><Spinner className="text-muted" /></div>
          ) : (
            projects.map((p) => (
              <MenuItem key={p.id} active={p.id === projectId} onClick={() => (setOpen(false), navigate(`/build/${p.id}`))}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{p.title}</span>
                  <span className="block text-[11px] text-muted">{timeAgo(p.updatedAt)}</span>
                </span>
              </MenuItem>
            ))
          )}
        </div>
      </Popover>
    </div>
  );
}

function ExportMenu({ html, title }: { html: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <Button size="sm" onClick={() => setOpen(!open)} disabled={!html}>
        <ArrowUpRight className="h-3.5 w-3.5" /> Export
      </Button>
      <Popover open={open} align="right" className="w-60">
        <MenuItem onClick={() => (downloadFile(`${slugify(title)}.html`, html), setOpen(false))}>
          <Download className="h-3.5 w-3.5" />
          <span className="flex-1">Download HTML</span>
          <span className="text-[11px] text-faint">.html</span>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            await navigator.clipboard.writeText(html);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="flex-1">{copied ? "Copied" : "Copy code"}</span>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
            window.open(url, "_blank", "noopener");
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
          }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="flex-1">Open in new tab</span>
        </MenuItem>
        <div className="mt-1 border-t border-line px-2.5 pb-1 pt-2 text-[11px] leading-snug text-faint">
          Exports are standalone HTML with the Tailwind CDN, ready for any host.
        </div>
      </Popover>
    </div>
  );
}

function PublishMenu({ html, title, slug, onPublished }: { html: string; title: string; slug?: string; onPublished: (slug: string) => void }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "publishing" | "done" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));
  const url = slug ? `${window.location.origin}/s/${slug}` : null;

  async function publish() {
    setState("publishing");
    try {
      const result = await api.publish(html, title, slug);
      onPublished(result.slug);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div ref={ref} className="relative">
      <Button size="sm" variant="primary" onClick={() => setOpen(!open)} disabled={!html} className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-500">
        <Globe className="h-3.5 w-3.5" /> Publish
      </Button>
      <Popover open={open} align="right" className="w-80 p-4">
        <div className="text-sm font-medium">{url ? "Your page is live" : "Publish to the web"}</div>
        <p className="mt-1 text-[12.5px] text-muted">
          {url ? "Re-publish to push your latest changes to the same link." : "Get a shareable link served straight from this app."}
        </p>
        {url && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-line bg-canvas p-1.5 pl-2.5">
            <span className="min-w-0 flex-1 truncate font-mono text-[11.5px]">{url}</span>
            <button
              className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-subtle hover:text-fg"
              onClick={async () => {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              aria-label="Copy link"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <a href={url} target="_blank" rel="noreferrer" className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-subtle hover:text-fg" aria-label="Open">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
        <Button variant="primary" className="mt-3 w-full justify-center" onClick={publish} disabled={state === "publishing"}>
          {state === "publishing" ? <Spinner /> : <Globe className="h-3.5 w-3.5" />}
          {url ? "Update live page" : "Publish"}
        </Button>
        {state === "error" && <p className="mt-2 text-[12px] text-red-500">Publishing failed. Is the API server running?</p>}
        {state === "done" && <p className="mt-2 text-[12px] text-emerald-600">Published.</p>}
      </Popover>
    </div>
  );
}

export function EditorHeader(props: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const tabs: EditorView[] = ["preview", "design", "code"];

  return (
    <header className="flex h-[52px] shrink-0 items-center border-b border-line bg-panel">
      <div className={cx("flex shrink-0 items-center gap-1.5 px-2", props.sidebarOpen ? "w-[400px] border-r border-line" : "w-auto")}>
        <Link to="/projects">
          <Button size="sm"><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
        </Link>
        {props.sidebarOpen && (
          <div className="min-w-0 flex-1 px-1">
            {editingTitle ? (
              <input
                autoFocus
                defaultValue={props.title}
                onBlur={(e) => {
                  setEditingTitle(false);
                  if (e.target.value.trim()) props.onRename(e.target.value.trim());
                }}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                className="w-full rounded-md border border-line bg-canvas px-2 py-1 text-[13px] outline-none"
              />
            ) : (
              <button onClick={() => setEditingTitle(true)} className="block w-full truncate rounded-md px-2 py-1 text-left text-[13px] font-medium hover:bg-subtle" title="Rename">
                {props.title}
              </button>
            )}
          </div>
        )}
        <ChatsMenu projectId={props.projectId} />
        <Button size="icon" onClick={props.onToggleSidebar} title={props.sidebarOpen ? "Hide chat" : "Show chat"}>
          <PanelLeft className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
        <div className="inline-flex rounded-lg border border-line bg-subtle/70 p-0.5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => props.onView(t)}
              disabled={t === "design" && !props.html}
              className={cx(
                "h-6 rounded-md px-3 text-[12.5px] capitalize transition disabled:opacity-40",
                props.view === t ? "bg-panel text-fg shadow-sm" : "text-muted hover:text-fg",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {props.view !== "code" && <DeviceToggle value={props.device} onChange={props.onDevice} />}
        {props.view !== "code" && props.html && (
          <Button size="icon" variant="ghost" onClick={props.onReloadPreview} title="Reload preview" aria-label="Reload preview">
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
        )}
        <div className="ml-1 hidden gap-0.5 sm:flex">
          <Button size="icon" variant="ghost" onClick={props.onUndo} disabled={!props.canUndo} title="Undo (Ctrl+Z)"><Undo2 className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" onClick={props.onRedo} disabled={!props.canRedo} title="Redo (Ctrl+Shift+Z)"><Redo2 className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {props.busy && <span className="mr-2 hidden items-center gap-2 text-[12px] text-muted md:flex"><Spinner className="h-3 w-3" /> Generating</span>}
          <ExportMenu html={props.html} title={props.title} />
          <PublishMenu html={props.html} title={props.title} slug={props.publishedSlug} onPublished={props.onPublished} />
        </div>
      </div>
    </header>
  );
}
