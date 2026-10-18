import { Camera, Globe, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Capture } from "../../shared/protocol";
import { api } from "../lib/api";
import { cx } from "../lib/util";
import { Popover, Spinner } from "./ui";

export const MAX_CAPTURES = 2;

interface Props {
  open: boolean;
  onToggle: () => void;
  side: "top" | "bottom";
  buttonClassName: string;
  captures: Capture[];
  webAccess: boolean;
  /** Whether the selected model's provider can browse; null while unknown. */
  providerWeb: boolean | null;
  providerLabel?: string;
  onChange: (next: { captures?: Capture[]; webAccess?: boolean }) => void;
}

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** "Import website URL" (real screenshots via the local browser) and the web access switch. */
export function WebMenu({ open, onToggle, side, buttonClassName, captures, webAccess, providerWeb, providerLabel, onChange }: Props) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const active = webAccess || captures.length > 0;

  async function capture(e: FormEvent) {
    e.preventDefault();
    if (!url.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await api.capture(url.trim());
      onChange({ captures: [...captures, result].slice(-MAX_CAPTURES) });
      setUrl("");
    } catch (err) {
      setError(err instanceof DOMException && err.name === "TimeoutError" ? "The site took too long to load." : err instanceof Error ? err.message : "Capture failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button type="button" title="Import website URL and web access" aria-label="Import website URL and web access" className={cx(buttonClassName, active && "text-accent")} onClick={onToggle}>
        <Globe className="h-3.5 w-3.5" />
      </button>
      <Popover open={open} side={side} className="w-[22rem] p-0">
        <form onSubmit={capture} className="border-b border-line p-3">
          <p className="text-[13px] font-medium">Import website URL</p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted">
            Screenshots a live site on this machine (desktop and mobile). The model sees them and can embed the real screenshots in your page.
          </p>
          <div className="mt-2.5 flex gap-1.5">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-app.com"
              autoFocus
              className="h-8 min-w-0 flex-1 rounded-lg border border-line bg-canvas px-2.5 text-[12.5px] outline-none focus:border-faint"
            />
            <button type="submit" disabled={!url.trim() || busy || captures.length >= MAX_CAPTURES} className="flex h-8 items-center gap-1.5 rounded-lg bg-ink px-2.5 text-[12px] font-medium text-ink-fg disabled:opacity-40">
              {busy ? <Spinner className="h-3 w-3" /> : <Camera className="h-3.5 w-3.5" />} Capture
            </button>
          </div>
          {busy && <p className="mt-2 text-[11.5px] text-muted">Loading the site and taking screenshots…</p>}
          {error && <p className="mt-2 text-[11.5px] text-red-500">{error}</p>}
          {captures.length >= MAX_CAPTURES && <p className="mt-2 text-[11.5px] text-faint">Up to {MAX_CAPTURES} sites per prompt.</p>}
        </form>
        <label className="flex cursor-pointer items-start gap-3 p-3">
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium">Web access</span>
            <span className="mt-0.5 block text-[11.5px] leading-snug text-muted">
              Let the model search and read web pages (read-only) to pull real product details and copy. It still can't touch your files or run commands.
            </span>
            {providerWeb === false && webAccess && (
              <span className="mt-1 block text-[11.5px] text-amber-600 dark:text-amber-400">{providerLabel ?? "This provider"} can't browse; pick a Claude Code, Codex, OpenCode or API model.</span>
            )}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={webAccess}
            onClick={() => onChange({ webAccess: !webAccess })}
            className={cx("relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition", webAccess ? "bg-accent" : "bg-line")}
          >
            <span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition", webAccess ? "left-[18px]" : "left-0.5")} />
          </button>
        </label>
      </Popover>
    </div>
  );
}

/** Chips for imported sites and the web access flag. */
export function WebChips({ captures, webAccess, onChange }: { captures: Capture[]; webAccess: boolean; onChange: Props["onChange"] }) {
  return (
    <>
      {captures.map((c) => (
        <span key={c.id} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-subtle py-0.5 pl-0.5 pr-1 text-xs" title={c.title}>
          <img src={c.shots[0]?.path} alt="" className="h-6 w-9 rounded-md object-cover object-top" />
          {host(c.source)}
          <span className="text-faint">· {c.shots.length} shots</span>
          <button type="button" onClick={() => onChange({ captures: captures.filter((x) => x.id !== c.id) })} className="rounded p-0.5 text-muted hover:text-fg" aria-label="Remove site">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {webAccess && (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 py-1 pl-2 pr-1 text-xs text-sky-700 dark:text-sky-300">
          <Globe className="h-3 w-3" /> Web access
          <button type="button" onClick={() => onChange({ webAccess: false })} className="rounded p-0.5 hover:bg-sky-500/15" aria-label="Turn off web access">
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
    </>
  );
}
