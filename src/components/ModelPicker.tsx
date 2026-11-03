import { Check, ChevronDown, RefreshCw, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { findModel, type ProviderInfo } from "../../shared/models";
import { cx } from "../lib/util";
import { Popover, Spinner } from "./ui";

const BILLING_LABEL: Record<ProviderInfo["billing"], string> = {
  subscription: "Subscription",
  "api-key": "API key",
  offline: "Offline",
};

interface Props {
  providers: ProviderInfo[] | null;
  value: string;
  onChange: (ref: string) => void;
  open: boolean;
  onToggle: () => void;
  side: "top" | "bottom";
  buttonClassName: string;
  compact?: boolean;
  onRefresh?: () => Promise<void>;
}

/** Short button label: drop vendor prefixes such as "Claude " and "GPT-". */
function shortLabel(label: string): string {
  return label.replace(/^Claude /, "").replace(/ 1M\b/, "").replace(/ · .*$/, "");
}

export function ModelPicker({ providers, value, onChange, open, onToggle, side, buttonClassName, compact, onRefresh }: Props) {
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const selected = providers ? findModel(providers, value) : undefined;
  const selectedProvider = providers?.find((p) => p.id === selected?.provider);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (providers ?? [])
      .filter((p) => p.available)
      .map((p) => ({
        provider: p,
        models: p.models.filter((m) => !needle || `${m.label} ${m.id} ${p.label}`.toLowerCase().includes(needle)),
      }))
      .filter((g) => g.models.length > 0);
  }, [providers, query]);
  const unavailable = (providers ?? []).filter((p) => !p.available);

  return (
    <div className="relative">
      <button type="button" className={buttonClassName} onClick={onToggle} title={selected ? `${selected.label} via ${selectedProvider?.label}` : "Choose a model"}>
        <Sparkles className="h-3.5 w-3.5" />
        <span className={cx("truncate", compact ? "max-w-[76px]" : "max-w-[160px]")}>{selected ? shortLabel(selected.label) : providers ? "Choose model" : "Loading…"}</span>
        {!compact && selectedProvider && selectedProvider.id !== "demo" && <span className="text-[11px] text-faint">· {selectedProvider.label}</span>}
        <ChevronDown className="h-3 w-3 shrink-0 text-muted" />
      </button>
      <Popover open={open} side={side} className="w-80 p-0">
        <div className="flex items-center gap-2 border-b border-line px-3 py-2">
          <Search className="h-3.5 w-3.5 text-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search models"
            className="h-6 flex-1 bg-transparent text-[13px] outline-none placeholder:text-faint"
          />
          {onRefresh && (
            <button
              type="button"
              title="Re-detect providers (after signing in to a CLI)"
              className="grid h-6 w-6 place-items-center rounded-md text-faint hover:bg-subtle hover:text-fg"
              onClick={async () => {
                setRefreshing(true);
                await onRefresh().finally(() => setRefreshing(false));
              }}
            >
              {refreshing ? <Spinner className="h-3 w-3" /> : <RefreshCw className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
        <div className="max-h-[22rem] overflow-y-auto p-1.5 scrollbar-thin">
          {!providers && <div className="grid h-20 place-items-center"><Spinner className="text-muted" /></div>}
          {groups.map(({ provider, models }) => (
            <div key={provider.id} className="mb-1">
              <div className="sticky top-0 z-10 flex items-center justify-between bg-panel px-2.5 pb-1 pt-2 text-[11px] uppercase tracking-wide text-faint">
                <span>{provider.label}</span>
                <span className="normal-case tracking-normal">{BILLING_LABEL[provider.billing]}{provider.images ? "" : " · no images"}</span>
              </div>
              {models.map((m) => (
                <button
                  key={m.ref}
                  type="button"
                  disabled={Boolean(m.unavailable)}
                  title={m.unavailable}
                  onClick={() => onChange(m.ref)}
                  className={cx(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent",
                    m.ref === value && "bg-subtle",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{m.label}</span>
                  {m.unavailable && <span className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-700 dark:text-amber-300">unavailable</span>}
                  {m.ref === value && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              ))}
              {[...new Set(models.map((m) => m.unavailable).filter(Boolean))].map((reason) => (
                <p key={reason} className="px-2.5 pb-1 pt-0.5 text-[11px] leading-snug text-amber-700 dark:text-amber-300">
                  {reason} Then press refresh above.
                </p>
              ))}
              {provider.note && <p className="px-2.5 pb-1 text-[11px] text-faint">{provider.note}</p>}
            </div>
          ))}
          {providers && groups.length === 0 && <p className="px-3 py-6 text-center text-[13px] text-muted">No models match “{query}”.</p>}
          {unavailable.length > 0 && !query && (
            <div className="mt-1 border-t border-line px-2.5 pb-1 pt-2">
              {unavailable.map((p) => (
                <p key={p.id} className="py-0.5 text-[11.5px] text-faint">
                  <span className="text-muted">{p.label}:</span> {p.note ?? "Unavailable"}
                </p>
              ))}
            </div>
          )}
        </div>
      </Popover>
    </div>
  );
}
