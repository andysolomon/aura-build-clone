import { AlertCircle, Brain, ChevronDown, History, RefreshCw, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { describeModelRef, type ProviderInfo } from "../../shared/models";
import type { ChatMessage, Version } from "../../shared/project";
import { Logo } from "../components/ui";
import { cx, timeAgo } from "../lib/util";

export interface LiveGeneration {
  status: string;
  reasoning: string;
  bytes: number;
  prompt: string;
  startedAt: number;
}

interface Props {
  messages: ChatMessage[];
  versions: Version[];
  currentVersionId: string | null;
  live: LiveGeneration | null;
  providers: ProviderInfo[];
  onRestore: (versionId: string) => void;
  onRetry: (messageId: string) => void;
  onSuggestion: (prompt: string) => void;
  composer: ReactNode;
}

const SUGGESTIONS = ["Make it dark", "Add a pricing section", "Use a serif headline font", "Change the accent to blue", "Shuffle the style"];

function Elapsed({ since }: { since: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.floor((now - since) / 1000));
  return <span className="font-mono text-[11px] text-faint">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>;
}

function Reasoning({ text, live }: { text: string; live?: boolean }) {
  const [open, setOpen] = useState(Boolean(live));
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (live && ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [text, live]);
  return (
    <div className="mt-2">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 text-[12px] text-muted hover:text-fg">
        <Brain className="h-3.5 w-3.5" />
        {live ? "Thinking" : "Thought process"}
        <ChevronDown className={cx("h-3 w-3 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div ref={ref} className="mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap border-l-2 border-line pl-3 text-[12px] leading-relaxed text-muted scrollbar-thin">
          {text}
        </div>
      )}
    </div>
  );
}

function AssistantAvatar() {
  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line bg-panel">
      <Logo className="h-3.5 w-3.5" />
    </span>
  );
}

export function ChatPanel({ messages, versions, currentVersionId, live, providers, onRestore, onRetry, onSuggestion, composer }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, live?.status, Boolean(live)]);

  const versionNumber = (id: string) => versions.findIndex((v) => v.id === id) + 1;

  return (
    <div className="flex h-full flex-col">
      <div ref={scroller} className="flex-1 space-y-5 overflow-y-auto px-4 py-5 scrollbar-thin">
        {messages.length === 0 && !live && (
          <div className="grid h-full place-items-center text-center">
            <div>
              <Logo className="mx-auto h-8 w-8 text-faint" />
              <p className="mt-3 text-sm text-muted">Describe the page you want to build.</p>
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex flex-col items-end">
              {m.images && m.images.length > 0 && (
                <div className="mb-1.5 flex gap-1.5">
                  {m.images.map((src, i) => <img key={i} src={src} alt="" className="h-14 w-14 rounded-lg border border-line object-cover" />)}
                </div>
              )}
              <div className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-subtle px-3.5 py-2.5 text-[13.5px] leading-relaxed">{m.content}</div>
            </div>
          ) : (
            <div key={m.id} className="flex gap-2.5">
              <AssistantAvatar />
              <div className="min-w-0 flex-1 pt-0.5">
                {m.error ? (
                  <p className="flex items-start gap-1.5 text-[13.5px] text-red-500"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{m.content}</p>
                ) : (
                  <p className="text-[13.5px] leading-relaxed">{m.content}</p>
                )}
                {/* Failed or stopped turns produce no version; offer to run the prompt again. */}
                {!m.versionId && !live && m.id === messages.at(-1)?.id && messages.some((x) => x.role === "user") && (
                  <button
                    onClick={() => onRetry(m.id)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[12px] text-muted hover:bg-subtle hover:text-fg"
                  >
                    <RefreshCw className="h-3 w-3" /> Retry with the selected model
                  </button>
                )}
                {m.reasoning && <Reasoning text={m.reasoning} />}
                {m.versionId && versions.some((v) => v.id === m.versionId) && (
                  <VersionCard
                    number={versionNumber(m.versionId)}
                    version={versions.find((v) => v.id === m.versionId)!}
                    modelLabel={describeModelRef(versions.find((v) => v.id === m.versionId)!.model, providers)}
                    current={m.versionId === currentVersionId}
                    onRestore={() => onRestore(m.versionId!)}
                  />
                )}
              </div>
            </div>
          ),
        )}

        {live && (
          <div className="flex gap-2.5">
            <AssistantAvatar />
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="flex items-center gap-2"><span className="shimmer-text text-[13.5px] font-medium">{live.status}…</span><Elapsed since={live.startedAt} /></p>
              {live.reasoning && <Reasoning text={live.reasoning} live />}
              {live.bytes > 0 && (
                <div className="mt-2.5 rounded-xl border border-line bg-panel p-3">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-mono text-muted">index.html</span>
                    <span className="font-mono text-faint">{(live.bytes / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-subtle">
                    <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.min(96, (live.bytes / 32000) * 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-line p-3">
        {versions.length > 0 && !live && (
          <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => onSuggestion(s)} className="shrink-0 rounded-full border border-line px-2.5 py-1 text-[12px] text-muted transition hover:bg-subtle hover:text-fg">
                {s}
              </button>
            ))}
          </div>
        )}
        {composer}
      </div>
    </div>
  );
}

function VersionCard({ number, version, modelLabel, current, onRestore }: { number: number; version: Version; modelLabel: string; current: boolean; onRestore: () => void }) {
  return (
    <div className={cx("mt-2.5 flex items-center gap-3 rounded-xl border p-2.5", current ? "border-accent/40 bg-accent/5" : "border-line bg-panel")}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-subtle font-mono text-[11px] text-muted">v{number}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-medium">Version {number}</div>
        <div className="truncate text-[11px] text-muted">{modelLabel} · {timeAgo(version.createdAt)}</div>
      </div>
      {current ? (
        <span className="flex items-center gap-1 text-[11px] text-accent"><History className="h-3 w-3" /> Current</span>
      ) : (
        <button onClick={onRestore} className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11px] text-muted hover:bg-subtle hover:text-fg">
          <RotateCcw className="h-3 w-3" /> Restore
        </button>
      )}
    </div>
  );
}
