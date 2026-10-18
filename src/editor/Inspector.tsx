import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  Bold,
  CopyPlus,
  CornerLeftUp,
  Minus,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cx } from "../lib/util";
import type { Patch, SelectionInfo } from "./bridge";

const SIZES = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl", "text-5xl", "text-6xl", "text-7xl", "text-8xl", "text-9xl"];
const SIZE_RE = /^(?:(sm|md|lg|xl|2xl):)?text-(xs|sm|base|lg|xl|[2-9]xl|\[[^\]]+\])$/;
const ALIGN_RE = /^text-(left|center|right|justify)$/;

/** Steps the base (unprefixed) font-size class; responsive variants are dropped so the change is visible. */
function stepSize(classes: string, dir: 1 | -1): string {
  const list = classes.split(/\s+/).filter(Boolean);
  const base = list.find((c) => SIZE_RE.test(c) && !c.includes(":") && SIZES.includes(c));
  const index = base ? SIZES.indexOf(base) : 2;
  const next = SIZES[Math.min(SIZES.length - 1, Math.max(0, index + dir))];
  return [...list.filter((c) => !SIZE_RE.test(c)), next].join(" ");
}

function setAlign(classes: string, align: string): string {
  return [...classes.split(/\s+/).filter((c) => c && !ALIGN_RE.test(c)), `text-${align}`].join(" ");
}

function toggleBold(classes: string): string {
  const list = classes.split(/\s+/).filter(Boolean);
  const bold = list.some((c) => /^font-(semibold|bold|extrabold|black)$/.test(c));
  return [...list.filter((c) => !/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/.test(c)), bold ? "font-normal" : "font-semibold"].join(" ");
}

interface Props {
  selection: SelectionInfo;
  onPatch: (patch: Patch) => void;
  onSelectParent: () => void;
  onAskAI: () => void;
  onClose: () => void;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-wide text-faint">{label}</span>
      {children}
    </label>
  );
}

const input = "w-full rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-[12.5px] outline-none focus:border-faint";

export function Inspector({ selection, onPatch, onSelectParent, onAskAI, onClose }: Props) {
  const [classes, setClasses] = useState(selection.classes);
  const [text, setText] = useState(selection.text ?? "");
  const [href, setHref] = useState(selection.href ?? "");
  const [src, setSrc] = useState(selection.src ?? "");

  useEffect(() => {
    setClasses(selection.classes);
    setText(selection.text ?? "");
    setHref(selection.href ?? "");
    setSrc(selection.src ?? "");
  }, [selection]);

  const iconButton = "grid h-8 flex-1 place-items-center rounded-lg border border-line text-muted transition hover:bg-subtle hover:text-fg";
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return (
    <aside className="absolute right-3 top-3 z-10 w-72 animate-fade-in rounded-2xl border border-line bg-panel shadow-pop">
      <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
        <div className="min-w-0">
          <div className="font-mono text-[12px] font-medium">&lt;{selection.tag}&gt;</div>
          <div className="truncate font-mono text-[10.5px] text-faint">{selection.path.join(" › ")}</div>
        </div>
        <div className="flex gap-1">
          <button onClick={onSelectParent} title="Select parent" className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-subtle hover:text-fg">
            <CornerLeftUp className="h-3.5 w-3.5" />
          </button>
          <button onClick={onClose} title="Deselect" className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-subtle hover:text-fg">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-[calc(100vh-180px)] space-y-4 overflow-y-auto p-3 scrollbar-thin">
        {selection.text !== null && (
          <Field label="Text">
            <textarea
              value={text}
              rows={Math.min(5, Math.ceil(text.length / 34) || 1)}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => text !== selection.text && onPatch({ type: "text", html: escape(text) })}
              className={cx(input, "resize-none")}
            />
            <span className="mt-1 block text-[10.5px] text-faint">Tip: double-click text in the preview to edit it inline.</span>
          </Field>
        )}

        <Field label="Typography">
          <div className="flex gap-1.5">
            <button className={iconButton} title="Smaller" onClick={() => onPatch({ type: "attrs", classes: stepSize(selection.classes, -1) })}><Minus className="h-3.5 w-3.5" /></button>
            <button className={iconButton} title="Larger" onClick={() => onPatch({ type: "attrs", classes: stepSize(selection.classes, 1) })}><Plus className="h-3.5 w-3.5" /></button>
            <button className={iconButton} title="Toggle bold" onClick={() => onPatch({ type: "attrs", classes: toggleBold(selection.classes) })}><Bold className="h-3.5 w-3.5" /></button>
            {(["left", "center", "right"] as const).map((a) => {
              const Icon = { left: AlignLeft, center: AlignCenter, right: AlignRight }[a];
              return (
                <button key={a} className={iconButton} title={`Align ${a}`} onClick={() => onPatch({ type: "attrs", classes: setAlign(selection.classes, a) })}>
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Tailwind classes">
          <textarea
            value={classes}
            rows={3}
            spellCheck={false}
            onChange={(e) => setClasses(e.target.value)}
            onBlur={() => classes !== selection.classes && onPatch({ type: "attrs", classes })}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), e.currentTarget.blur())}
            className={cx(input, "resize-none font-mono text-[11.5px]")}
          />
        </Field>

        {selection.href !== null && (
          <Field label="Link">
            <input value={href} onChange={(e) => setHref(e.target.value)} onBlur={() => href !== selection.href && onPatch({ type: "attrs", href })} className={input} />
          </Field>
        )}
        {selection.tag === "img" && (
          <Field label="Image URL">
            <input value={src} onChange={(e) => setSrc(e.target.value)} onBlur={() => src !== selection.src && onPatch({ type: "attrs", src })} className={input} />
          </Field>
        )}

        <Field label="Element">
          <div className="flex gap-1.5">
            <button className={iconButton} title="Move up" onClick={() => onPatch({ type: "move", dir: -1 })}><ArrowUpToLine className="h-3.5 w-3.5" /></button>
            <button className={iconButton} title="Move down" onClick={() => onPatch({ type: "move", dir: 1 })}><ArrowDownToLine className="h-3.5 w-3.5" /></button>
            <button className={iconButton} title="Duplicate" onClick={() => onPatch({ type: "duplicate" })}><CopyPlus className="h-3.5 w-3.5" /></button>
            <button className={cx(iconButton, "hover:text-red-500")} title="Delete" onClick={() => onPatch({ type: "delete" })}><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </Field>

        <button onClick={onAskAI} className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2 text-[13px] font-medium text-ink-fg hover:opacity-90">
          <Sparkles className="h-3.5 w-3.5" /> Edit this element with AI
        </button>
      </div>
    </aside>
  );
}
