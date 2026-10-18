import { Calendar, Check, Copy, Download, Image as ImageIcon, Layers, List, Paperclip, Search, Shuffle, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router";
import { FilterChip, LibraryHero, LibraryPanel, PulseRow } from "../components/LibraryHero";
import { Button, Spinner } from "../components/ui";
import { assetUrl, pseudoStats, useJson, type AssetEntry } from "../lib/content";
import { imageToPngDataUrl, setPrefill } from "../lib/prefill";
import { cx, downloadFile } from "../lib/util";

const CATEGORY_LABELS: Record<string, string> = { gradient: "Gradients", texture: "Textures", pattern: "Patterns", abstract: "Abstract", "3d": "3D" };
const RATIOS = ["16:9", "4:3", "1:1", "3:4", "9:16"];

function AssetModal({ asset, onClose }: { asset: AssetEntry; onClose: () => void }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"png" | "attach" | null>(null);
  const url = assetUrl(asset.slug);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function downloadPng() {
    setBusy("png");
    try {
      const data = await imageToPngDataUrl(url, 3200);
      const a = document.createElement("a");
      a.href = data;
      a.download = `${asset.slug}.png`;
      a.click();
    } finally {
      setBusy(null);
    }
  }

  async function attach() {
    setBusy("attach");
    try {
      setPrefill({ images: [await imageToPngDataUrl(url)], prompt: `Use the attached ${asset.title.toLowerCase()} as the hero background.` });
      navigate("/");
    } finally {
      setBusy(null);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label={asset.title} className="grid max-h-full w-full max-w-5xl animate-fade-in overflow-hidden rounded-2xl border border-line bg-panel shadow-pop md:grid-cols-[1fr_300px]">
        <div className="grid min-h-0 place-items-center bg-subtle p-4">
          <img src={url} alt={asset.title} className="max-h-[78vh] w-auto rounded-lg object-contain shadow-composer" />
        </div>
        <div className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">{asset.title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-fg">
              <X className="h-4 w-4" />
            </button>
          </div>
          <dl className="mt-4 space-y-2.5 text-sm">
            {[
              ["Category", CATEGORY_LABELS[asset.category] ?? asset.category],
              ["Palette", asset.palette],
              ["Ratio", asset.ratio],
              ["Size", `${asset.width} × ${asset.height}`],
              ["Format", "SVG (vector)"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <div className="mt-6 grid gap-2">
            <Button variant="primary" onClick={attach} disabled={busy !== null} className="justify-center">
              {busy === "attach" ? <Spinner /> : <Paperclip className="h-4 w-4" />} Attach to prompt
            </Button>
            <Button onClick={() => void fetch(url).then((r) => r.text()).then((svg) => downloadFile(`${asset.slug}.svg`, svg, "image/svg+xml"))} className="justify-center">
              <Download className="h-4 w-4" /> Download SVG
            </Button>
            <Button onClick={downloadPng} disabled={busy !== null} className="justify-center">
              {busy === "png" ? <Spinner /> : <ImageIcon className="h-4 w-4" />} Download PNG
            </Button>
            <Button
              className="justify-center"
              onClick={async () => {
                await navigator.clipboard.writeText(new URL(url, window.location.origin).href);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy URL
            </Button>
          </div>
          <p className="mt-auto pt-6 text-[11.5px] leading-relaxed text-faint">
            Original, procedurally generated artwork. Free to use in anything you build.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function AssetsPage() {
  const assets = useJson<AssetEntry[]>("/assets/index.json", []);
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState<AssetEntry | null>(null);
  const [seed, setSeed] = useState(0);
  const q = params.get("q") ?? "";
  const category = params.get("category");
  const ratio = params.get("ratio");
  const sort = params.get("sort") ?? "popular";

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = assets.filter(
      (a) => (!category || a.category === category) && (!ratio || a.ratio === ratio) && (!needle || `${a.title} ${a.palette} ${a.category}`.toLowerCase().includes(needle)),
    );
    if (sort === "recent") return [...list].reverse();
    if (sort === "explore") return [...list].sort((a, b) => (pseudoStats(a.slug + seed).views % 89) - (pseudoStats(b.slug + seed).views % 89));
    return [...list].sort((a, b) => pseudoStats(b.slug).views - pseudoStats(a.slug).views);
  }, [assets, q, category, ratio, sort, seed]);

  const countBy = (c: string) => assets.filter((a) => a.category === c).length;
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
        eyebrow="Aura assets"
        title="Backgrounds and design assets"
        description="Original gradients, auroras, textures, patterns, waves and 3D orbs in every common aspect ratio. Download them as SVG or PNG, or attach one to a prompt as a visual reference."
        pulseTitle="Asset pulse"
        pulse={
          <>
            <PulseRow icon={<Layers className="h-3.5 w-3.5 text-blue-500" />} label="Assets" value={assets.length} active={!category} onClick={() => update("category", null)} />
            <PulseRow icon={<Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />} label="Gradients" value={countBy("gradient")} active={category === "gradient"} onClick={() => update("category", "gradient")} />
            <PulseRow icon={<ImageIcon className="h-3.5 w-3.5 text-emerald-500" />} label="Patterns" value={countBy("pattern")} active={category === "pattern"} onClick={() => update("category", "pattern")} />
          </>
        }
      />
      <LibraryPanel>
        <div className="flex flex-wrap gap-2 rounded-xl border border-line p-1.5">
          <label className="flex min-w-60 flex-1 items-center gap-2 rounded-lg bg-subtle px-3">
            <Search className="h-4 w-4 text-muted" />
            <input value={q} onChange={(e) => update("q", e.target.value || null)} placeholder={`Search ${assets.length} assets...`} className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-faint" />
          </label>
          {sortButton("popular", "Popular", List)}
          {sortButton("explore", "Explore", Shuffle, () => {
            setSeed((s) => s + 1);
            update("sort", "explore");
          })}
          {sortButton("recent", "Recent", Calendar)}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <FilterChip key={value} active={category === value} onClick={() => update("category", category === value ? null : value)}>
              {label}
            </FilterChip>
          ))}
          <div className="ml-auto flex gap-1 rounded-full border border-line p-0.5">
            {[null, ...RATIOS].map((r) => (
              <button
                key={r ?? "all"}
                type="button"
                onClick={() => update("ratio", r)}
                className={cx("h-7 rounded-full px-2.5 text-[12px]", ratio === r ? "bg-subtle text-fg" : "text-muted hover:text-fg")}
              >
                {r ?? "All ratios"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 columns-2 gap-3 md:columns-3 xl:columns-4">
          {results.map((a) => (
            <button key={a.slug} type="button" onClick={() => setOpen(a)} className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl border border-line bg-subtle text-left">
              <img src={assetUrl(a.slug)} alt={a.title} loading="lazy" className="w-full transition duration-500 group-hover:scale-[1.03]" style={{ aspectRatio: `${a.width} / ${a.height}` }} />
              <div className="flex items-center justify-between gap-2 bg-panel px-3 py-2 text-[12px]">
                <span className="truncate font-medium">{a.title}</span>
                <span className="shrink-0 text-faint">{a.ratio}</span>
              </div>
            </button>
          ))}
        </div>
        {assets.length > 0 && results.length === 0 && <p className="py-20 text-center text-sm text-muted">No assets match those filters.</p>}
      </LibraryPanel>
      {open && <AssetModal asset={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
