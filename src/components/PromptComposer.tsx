import { ArrowUp, AtSign, Check, ImageOff, MousePointer2, Palette, Paperclip, Sparkles, Square, SquarePen, WandSparkles, X } from "lucide-react";
import { lazy, Suspense, useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent, type RefObject } from "react";
import { DESIGN_SYSTEMS, findDesignSystem } from "../../shared/design-systems";
import { findModel } from "../../shared/models";
import { TEMPLATES, templateThumbUrl } from "../data/templates";
import { api } from "../lib/api";
import { refreshAppConfig, useAppConfig } from "../lib/projects";
import { cx, readFileAsDataUrl, useDismiss, useTypewriter } from "../lib/util";
import { ModelPicker } from "./ModelPicker";
import { MenuItem, Popover, Spinner } from "./ui";

export interface ComposerState {
  prompt: string;
  /** Model ref, "<provider>:<model>". */
  model: string;
  designSystemId: string | null;
  referenceSlugs: string[];
  images: string[];
}

interface Props {
  variant: "hero" | "panel";
  state: ComposerState;
  onChange: (next: ComposerState) => void;
  onSubmit: () => void;
  busy?: boolean;
  onStop?: () => void;
  placeholder?: string;
  typewriterLines?: string[];
  selectionLabel?: string | null;
  onClearSelection?: () => void;
  autoFocus?: boolean;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  /** Opens the Prompt Builder on mount (the /create route). */
  initialBuilderOpen?: boolean;
}

const MAX_IMAGES = 4;

const PromptBuilder = lazy(() => import("./promptBuilder/PromptBuilder").then((m) => ({ default: m.PromptBuilder })));

/** Downscale attachments so requests stay small (long edge 1568px, JPEG). */
async function prepareImage(file: File): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const scale = Math.min(1, 1568 / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

type Menu = "model" | "design" | "refs" | null;

export function PromptComposer({
  variant,
  state,
  onChange,
  onSubmit,
  busy,
  onStop,
  placeholder,
  typewriterLines,
  selectionLabel,
  onClearSelection,
  autoFocus,
  inputRef,
  initialBuilderOpen,
}: Props) {
  const [menu, setMenu] = useState<Menu>(null);
  const [builderOpen, setBuilderOpen] = useState(Boolean(initialBuilderOpen));
  const [enhancing, setEnhancing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const toolbarRef = useDismiss<HTMLDivElement>(menu !== null, () => setMenu(null));
  const typed = useTypewriter(typewriterLines ?? [], Boolean(typewriterLines?.length) && !state.prompt);

  const config = useAppConfig();
  const set = (patch: Partial<ComposerState>) => onChange({ ...state, ...patch });
  const provider = config?.providers.find((p) => p.id === findModel(config.providers, state.model)?.provider);
  const imagesDropped = state.images.length > 0 && provider !== undefined && !provider.images;
  const designSystem = findDesignSystem(state.designSystemId);
  const canSubmit = state.prompt.trim().length > 0 && !busy;
  const hero = variant === "hero";

  async function addFiles(files: FileList | File[]) {
    const images = [...files].filter((f) => f.type.startsWith("image/")).slice(0, MAX_IMAGES - state.images.length);
    if (!images.length) return;
    const prepared = await Promise.all(images.map(prepareImage));
    set({ images: [...state.images, ...prepared] });
  }

  async function enhance() {
    if (!state.prompt.trim() || enhancing) return;
    setEnhancing(true);
    try {
      const { prompt } = await api.enhance(state.prompt, state.model);
      set({ prompt });
    } catch {
      // Keep the user's prompt unchanged if enhancing fails.
    } finally {
      setEnhancing(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (canSubmit) onSubmit();
    }
  }

  function onPaste(e: ClipboardEvent) {
    if (e.clipboardData.files.length) {
      e.preventDefault();
      void addFiles(e.clipboardData.files);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    void addFiles(e.dataTransfer.files);
  }

  const refs = TEMPLATES.filter((t) => state.referenceSlugs.includes(t.slug));
  const hasChips = refs.length > 0 || state.images.length > 0 || Boolean(selectionLabel);
  const toolButton = "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-line bg-panel px-2 text-[12.5px] text-fg transition hover:bg-subtle";

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cx(
        "relative rounded-2xl border bg-panel transition",
        hero ? "shadow-composer" : "shadow-sm",
        dragging ? "border-accent ring-4 ring-accent/15" : "border-line focus-within:border-faint",
      )}
    >
      {hasChips && (
        <div className="flex flex-wrap gap-1.5 px-3 pt-3">
          {selectionLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 py-1 pl-2 pr-1 text-xs text-accent">
              <MousePointer2 className="h-3 w-3" />
              Editing {selectionLabel}
              <button onClick={onClearSelection} className="rounded p-0.5 hover:bg-accent/15" aria-label="Clear selection">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {refs.map((t) => (
            <span key={t.slug} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-subtle py-0.5 pl-0.5 pr-1 text-xs">
              <img src={templateThumbUrl(t.slug)} alt="" className="h-6 w-9 rounded-md object-cover" />
              @{t.title.split(" — ")[0]}
              <button onClick={() => set({ referenceSlugs: state.referenceSlugs.filter((s) => s !== t.slug) })} className="rounded p-0.5 text-muted hover:text-fg" aria-label="Remove reference">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {imagesDropped && (
            <span className="inline-flex items-center gap-1.5 self-center rounded-lg bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-300">
              <ImageOff className="h-3 w-3" /> {provider?.label} can't see images
            </span>
          )}
          {state.images.map((src, i) => (
            <span key={i} className="group relative">
              <img src={src} alt="Attachment" className="h-12 w-12 rounded-lg border border-line object-cover" />
              <button
                onClick={() => set({ images: state.images.filter((_, j) => j !== i) })}
                className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 place-items-center rounded-full bg-ink text-ink-fg group-hover:grid"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <textarea
        ref={inputRef}
        value={state.prompt}
        onChange={(e) => set({ prompt: e.target.value })}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        autoFocus={autoFocus}
        rows={hero ? 3 : 2}
        placeholder={typed || placeholder}
        className={cx(
          "block w-full resize-none bg-transparent px-4 text-fg outline-none placeholder:text-faint",
          hero ? "min-h-[84px] pt-4 text-[15px]" : "max-h-48 min-h-[56px] pt-3 text-[14px]",
        )}
      />

      <div ref={toolbarRef} className="flex items-center gap-1.5 px-2 pb-2 pt-1">
        <button type="button" onClick={() => setBuilderOpen(true)} title="Open Prompt Builder" aria-label="Open Prompt Builder" className={cx(toolButton, "w-8 justify-center px-0")}>
          <SquarePen className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={enhance} title="Enhance prompt" className={cx(toolButton, "w-8 justify-center px-0")} disabled={enhancing}>
          {enhancing ? <Spinner className="h-3 w-3" /> : <WandSparkles className="h-3.5 w-3.5" />}
        </button>

        <div className="relative">
          <button type="button" title={designSystem ? `Design system: ${designSystem.name}` : "Design system"} className={toolButton} onClick={() => setMenu(menu === "design" ? null : "design")}>
            {designSystem ? (
              <span className="flex -space-x-1">
                {designSystem.swatches.slice(0, 3).map((c) => (
                  <span key={c} className="h-3 w-3 rounded-full border border-panel" style={{ background: c }} />
                ))}
              </span>
            ) : (
              <Palette className="h-3.5 w-3.5" />
            )}
            {hero && <span className="hidden sm:inline">{designSystem?.name ?? "Design System"}</span>}
          </button>
          <Popover open={menu === "design"} side={hero ? "bottom" : "top"} className="w-72">
            <div className="px-2.5 pb-1.5 pt-1 text-[11px] uppercase tracking-wide text-faint">DESIGN.md presets</div>
            <MenuItem active={!designSystem} onClick={() => (set({ designSystemId: null }), setMenu(null))}>
              <span className="grid h-7 w-7 place-items-center rounded-md border border-dashed border-line text-faint">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1">
                <span className="block font-medium">Auto</span>
                <span className="block text-xs text-muted">Let the model pick an art direction</span>
              </span>
            </MenuItem>
            {DESIGN_SYSTEMS.map((ds) => (
              <MenuItem key={ds.id} active={ds.id === designSystem?.id} onClick={() => (set({ designSystemId: ds.id }), setMenu(null))}>
                <span className="grid h-7 w-7 shrink-0 grid-cols-2 overflow-hidden rounded-md border border-line">
                  {ds.swatches.map((c) => (
                    <span key={c} style={{ background: c }} />
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{ds.name}</span>
                  <span className="block truncate text-xs text-muted">{ds.tagline}</span>
                </span>
                {ds.id === designSystem?.id && <Check className="h-3.5 w-3.5" />}
              </MenuItem>
            ))}
          </Popover>
        </div>

        <ModelPicker
          providers={config?.providers ?? null}
          value={state.model}
          onChange={(model) => (set({ model }), setMenu(null))}
          open={menu === "model"}
          onToggle={() => setMenu(menu === "model" ? null : "model")}
          side={hero ? "bottom" : "top"}
          buttonClassName={toolButton}
          compact={!hero}
          onRefresh={async () => {
            await refreshAppConfig();
          }}
        />

        <div className="relative">
          <button type="button" title="Reference a template" className={cx(toolButton, "w-8 justify-center px-0")} onClick={() => setMenu(menu === "refs" ? null : "refs")}>
            <AtSign className="h-3.5 w-3.5" />
          </button>
          <Popover open={menu === "refs"} side={hero ? "bottom" : "top"} className="w-80">
            <div className="px-2.5 pb-1.5 pt-1 text-[11px] uppercase tracking-wide text-faint">Use templates as reference (max 2)</div>
            <div className="max-h-72 overflow-y-auto scrollbar-thin">
              {TEMPLATES.map((t) => {
                const selected = state.referenceSlugs.includes(t.slug);
                return (
                  <MenuItem
                    key={t.slug}
                    active={selected}
                    disabled={!selected && state.referenceSlugs.length >= 2}
                    onClick={() =>
                      set({
                        referenceSlugs: selected ? state.referenceSlugs.filter((s) => s !== t.slug) : [...state.referenceSlugs, t.slug],
                      })
                    }
                  >
                    <img src={templateThumbUrl(t.slug)} alt="" className="h-9 w-14 rounded-md border border-line object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{t.title}</span>
                      <span className="block text-xs text-muted">{t.category}</span>
                    </span>
                    {selected && <Check className="h-3.5 w-3.5" />}
                  </MenuItem>
                );
              })}
            </div>
          </Popover>
        </div>

        <button type="button" title="Attach images (or paste / drop)" className={cx(toolButton, "w-8 justify-center px-0")} onClick={() => fileInput.current?.click()}>
          <Paperclip className="h-3.5 w-3.5" />
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="ml-auto">
          {busy ? (
            <button type="button" onClick={onStop} className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-ink-fg" aria-label="Stop generating">
              <Square className="h-3 w-3 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              aria-label="Generate"
              className={cx(
                "grid h-8 w-8 place-items-center rounded-lg border transition",
                canSubmit ? "border-ink bg-ink text-ink-fg" : "border-line bg-panel text-faint",
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {builderOpen && (
        <Suspense fallback={null}>
          <PromptBuilder
            onClose={() => setBuilderOpen(false)}
            onApply={({ prompt, referenceSlug }) =>
              set({
                prompt: state.prompt.trim() ? `${state.prompt.trim()} ${prompt}` : prompt,
                referenceSlugs: referenceSlug && !state.referenceSlugs.includes(referenceSlug) ? [...state.referenceSlugs, referenceSlug].slice(-2) : state.referenceSlugs,
              })
            }
          />
        </Suspense>
      )}
    </div>
  );
}
