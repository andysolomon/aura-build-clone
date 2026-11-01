import { ArrowUp, Bookmark, Bot, Brain, ChevronDown, CircleCheck, Copy, FileText, GitBranch, Mic, Paperclip, Plus, RefreshCw, ShieldCheck, ThumbsDown, ThumbsUp, Wrench } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { BuilderState } from "../../data/promptBuilder";
import type { Palette } from "./BuilderPreview";

// Live preview for the Prompt Builder's Agent UI section: a miniature agent interface showing the
// chosen surface and message parts, in the selected colors and visual style.

interface Props {
  s: BuilderState;
  p: Palette;
  card: CSSProperties;
  button: CSSProperties;
}

const has = (s: BuilderState, part: string) => s.agentParts.includes(part);

function Pill({ p, children, tone }: { p: Palette; children: ReactNode; tone?: "ok" | "warn" }) {
  const color = tone === "ok" ? "#059669" : tone === "warn" ? "#d97706" : p.muted;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[9.5px] font-medium" style={{ color, background: `${color}1a`, boxShadow: `inset 0 0 0 1px ${color}33` }}>
      {children}
    </span>
  );
}

function Line({ p, w, strong }: { p: Palette; w: string; strong?: boolean }) {
  return <span className="block h-[6px] rounded-full" style={{ width: w, background: strong ? p.text : p.muted, opacity: strong ? 0.75 : 0.35 }} />;
}

function Thread({ s, p, card, compact }: Props & { compact?: boolean }) {
  const subtle = p.dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.045)";
  const mono = { fontFamily: "'Geist Mono', ui-monospace, monospace" };
  return (
    <div className="flex min-h-0 flex-col gap-2.5 text-[10.5px]" style={{ color: p.text }}>
      <div className="flex flex-col items-end gap-1">
        {has(s, "Attachments") && (
          <span className="flex gap-1">
            <span className="h-7 w-9 rounded-md" style={{ background: `linear-gradient(135deg, ${p.accent}88, ${p.accent}22)` }} />
            <span className="grid h-7 w-9 place-items-center rounded-md" style={{ background: subtle }}><FileText className="h-3 w-3" style={{ color: p.muted }} /></span>
          </span>
        )}
        <span className="max-w-[80%] rounded-xl px-2.5 py-1.5" style={{ background: subtle }}>Find late orders and refund the damaged ones</span>
      </div>
      {has(s, "Reasoning") && (
        <span className="flex items-center gap-1" style={{ color: p.muted }}><Brain className="h-3 w-3" /> Thought for 4 seconds <ChevronDown className="h-3 w-3" /></span>
      )}
      {has(s, "Plan") && (
        <div className="space-y-1 p-2" style={{ ...card, borderRadius: 8 }}>
          <span className="font-semibold">Plan · Refund damaged orders</span>
          {["Search late orders", "Check damage reports", "Issue refunds"].map((step, i) => (
            <span key={step} className="flex items-center gap-1.5" style={{ color: i < 2 ? p.muted : p.text }}>
              <CircleCheck className="h-3 w-3" style={{ color: i < 2 ? "#059669" : p.muted }} /> {step}
            </span>
          ))}
        </div>
      )}
      {has(s, "Tool Calls") && (
        <div className="flex items-center justify-between px-2 py-1.5" style={{ ...card, borderRadius: 8 }}>
          <span className="flex items-center gap-1.5"><Wrench className="h-3 w-3" style={{ color: p.muted }} /><span style={mono}>search_orders</span><Pill p={p} tone="ok"><CircleCheck className="h-2.5 w-2.5" />Completed</Pill></span>
          <ChevronDown className="h-3 w-3" style={{ color: p.muted }} />
        </div>
      )}
      {has(s, "Approvals") && (
        <div className="space-y-1.5 p-2" style={{ ...card, borderRadius: 8 }}>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" style={{ color: "#d97706" }} />Refund <span style={mono}>#4821</span> ($64.00)?</span>
          <span className="flex justify-end gap-1">
            <span className="rounded-md px-2 py-0.5" style={{ boxShadow: `inset 0 0 0 1px ${p.border}` }}>Deny</span>
            <span className="rounded-md px-2 py-0.5" style={{ background: p.accent, color: p.onAccent }}>Approve</span>
          </span>
        </div>
      )}
      {has(s, "Generative UI") && (
        <div className="flex items-end gap-1 p-2" style={{ ...card, borderRadius: 8, height: 54 }}>
          <span className="mr-auto self-start"><span className="block text-[9px]" style={{ color: p.muted }}>Late orders</span><span className="text-[13px] font-semibold">27</span></span>
          {[40, 65, 30, 80, 55, 92].map((h, i) => <span key={i} className="w-2.5 rounded-sm" style={{ height: `${h * 0.38}px`, background: p.accent, opacity: 0.35 + i * 0.1 }} />)}
        </div>
      )}
      <div className="space-y-1.5">
        <Line p={p} w="94%" strong />
        <Line p={p} w="86%" strong />
        <span className="flex items-center gap-1">
          <Line p={p} w={has(s, "Sources") ? "48%" : "62%"} strong />
          {has(s, "Sources") && <span className="rounded-full px-1.5 text-[8.5px]" style={{ ...mono, background: subtle, color: p.muted }}>help.acme.co +2</span>}
        </span>
      </div>
      {(has(s, "Feedback") || has(s, "Branching")) && (
        <span className="flex items-center gap-2" style={{ color: p.muted }}>
          <Copy className="h-3 w-3" /><RefreshCw className="h-3 w-3" />
          {has(s, "Feedback") && <><ThumbsUp className="h-3 w-3" /><ThumbsDown className="h-3 w-3" /></>}
          {has(s, "Branching") && <span className="flex items-center gap-0.5 text-[9.5px]"><GitBranch className="h-3 w-3" />‹ 2 / 2 ›</span>}
        </span>
      )}
      {has(s, "Checkpoints") && (
        <span className="flex items-center gap-1.5 text-[9.5px]" style={{ color: p.muted }}>
          <Bookmark className="h-3 w-3" /> Restore checkpoint <span className="h-px flex-1" style={{ background: p.border }} />
        </span>
      )}
      {has(s, "Task Queue") && (
        <div className="space-y-1 p-2" style={{ ...card, borderRadius: 8 }}>
          <span className="text-[9.5px] font-medium" style={{ color: p.muted }}>2 Queued</span>
          {["Email the customers", "Update the ops sheet"].map((t) => <span key={t} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ boxShadow: `inset 0 0 0 1px ${p.muted}` }} />{t}</span>)}
        </div>
      )}
      {has(s, "Suggestions") && !compact && (
        <span className="flex flex-wrap gap-1">
          {["Draft the replies", "Show refund total"].map((t) => <span key={t} className="rounded-full px-2 py-0.5 text-[9.5px]" style={{ boxShadow: `inset 0 0 0 1px ${p.border}` }}>{t}</span>)}
        </span>
      )}
    </div>
  );
}

function Composer({ s, p, card, button }: Props) {
  return (
    <div className="mt-auto p-2" style={{ ...card, borderRadius: 12 }}>
      <span className="block px-0.5 pb-2 text-[10.5px]" style={{ color: p.muted }}>Ask anything…</span>
      <span className="flex items-center gap-1.5" style={{ color: p.muted }}>
        <Plus className="h-3 w-3" />
        {has(s, "Attachments") && <Paperclip className="h-3 w-3" />}
        {has(s, "Model Picker") && <span className="rounded-full px-1.5 text-[9px]" style={{ boxShadow: `inset 0 0 0 1px ${p.border}` }}>Sonnet 5.5 ▾</span>}
        <span className="ml-auto flex items-center gap-1.5">
          {has(s, "Context Meter") && (
            <span className="flex items-center gap-0.5 text-[9px]">
              <svg viewBox="0 0 12 12" className="h-3 w-3"><circle cx="6" cy="6" r="4.5" fill="none" stroke={p.border} strokeWidth="1.6" /><circle cx="6" cy="6" r="4.5" fill="none" stroke={p.accent} strokeWidth="1.6" strokeDasharray="28.3" strokeDashoffset="19.5" transform="rotate(-90 6 6)" /></svg>31%
            </span>
          )}
          <Mic className="h-3 w-3" />
          <span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: button.background ?? p.accent, color: p.onAccent }}><ArrowUp className="h-3 w-3" /></span>
        </span>
      </span>
    </div>
  );
}

export function AgentPreview(props: Props) {
  const { s, p, card } = props;
  const subtle = p.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.035)";
  const chat = (compact = false) => (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <Thread {...props} compact={compact} />
      <Composer {...props} />
    </div>
  );
  const sidebarItems = ["Refund damaged orders", "Weekly support digest", "Address change", "VIP escalation"];

  switch (s.agentSurface) {
    case "App Shell":
      return (
        <div className="flex h-full">
          <div className="w-[30%] space-y-1 p-3 text-[10px]" style={{ borderRight: `1px solid ${p.border}`, color: p.muted }}>
            <span className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: p.text }}><Bot className="h-3.5 w-3.5" style={{ color: p.accent }} />Harbor</span>
            {sidebarItems.map((t, i) => <span key={t} className="block truncate rounded-md px-2 py-1" style={i === 0 ? { background: subtle, color: p.text } : undefined}>{t}</span>)}
          </div>
          <div className="min-w-0 flex-1 p-4">{chat()}</div>
        </div>
      );
    case "Copilot Sidebar":
      return (
        <div className="flex h-full">
          <div className="flex-1 space-y-2 p-4">
            <Line p={p} w="40%" strong />
            <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-12" style={{ ...card, borderRadius: 8 }} />)}</div>
            <div className="h-28" style={{ ...card, borderRadius: 8 }} />
          </div>
          <div className="w-[44%] p-3" style={{ borderLeft: `1px solid ${p.border}` }}>{chat(true)}</div>
        </div>
      );
    case "Chat + Artifact":
      return (
        <div className="flex h-full">
          <div className="w-[46%] p-3" style={{ borderRight: `1px solid ${p.border}` }}>{chat(true)}</div>
          <div className="flex flex-1 flex-col p-3">
            <span className="mb-2 flex gap-3 text-[10px]" style={{ color: p.muted }}>
              <span style={{ color: p.text, borderBottom: `1.5px solid ${p.accent}` }}>Preview</span><span>Code</span><span>Terminal</span>
            </span>
            <div className="flex-1 space-y-1.5 p-2.5" style={{ ...card, borderRadius: 8 }}>
              {["70%", "52%", "84%", "40%", "66%", "58%"].map((w, i) => <span key={i} className="block h-[5px] rounded-full" style={{ width: w, marginLeft: i % 3 ? 10 : 0, background: i % 2 ? p.accent : p.muted, opacity: 0.45 }} />)}
            </div>
          </div>
        </div>
      );
    case "Floating Widget":
      return (
        <div className="relative h-full p-4">
          <Line p={p} w="50%" strong />
          <div className="mt-3 h-24 w-[55%]" style={{ ...card, borderRadius: 8, opacity: 0.6 }} />
          <div className="absolute bottom-12 right-4 flex h-[78%] w-[52%] flex-col p-2.5" style={{ ...card, borderRadius: 14, background: p.page, boxShadow: "0 18px 40px -16px rgba(0,0,0,.35)" }}>{chat(true)}</div>
          <span className="absolute bottom-3 right-4 grid h-7 w-7 place-items-center rounded-full" style={{ background: p.accent, color: p.onAccent }}><Bot className="h-3.5 w-3.5" /></span>
        </div>
      );
    case "Voice Agent":
      return (
        <div className="grid h-full place-items-center p-6 text-center">
          <div>
            <div className="mx-auto h-28 w-28 rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, #ffffffaa, ${p.accent} 45%, ${p.accent}22 75%)`, boxShadow: `0 0 60px ${p.accent}55` }} />
            <p className="mt-5 text-[11px]" style={{ color: p.muted }}>Listening…</p>
            <p className="mx-auto mt-2 max-w-[80%] text-[12px]">“Which orders arrived <span style={{ background: `${p.accent}33`, borderRadius: 4, padding: "0 2px" }}>damaged</span> this week?”</p>
            <span className="mt-4 inline-grid h-9 w-9 place-items-center rounded-full" style={{ background: p.accent, color: p.onAccent }}><Mic className="h-4 w-4" /></span>
          </div>
        </div>
      );
    case "Workflow Canvas": {
      const nodes = [{ x: 8, y: 18, t: "Webhook" }, { x: 36, y: 40, t: "Classify" }, { x: 64, y: 18, t: "Refund tool" }, { x: 64, y: 62, t: "Notify" }];
      return (
        <div className="relative h-full" style={{ backgroundImage: `radial-gradient(${p.muted}55 1px, transparent 1px)`, backgroundSize: "14px 14px" }}>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M28 24 C 34 24, 30 46, 36 46 M 56 46 C 60 46, 58 24, 64 24 M 56 46 C 60 46, 58 68, 64 68" fill="none" stroke={p.accent} strokeWidth="0.6" strokeDasharray="2 1.5" />
          </svg>
          {nodes.map((n) => (
            <div key={n.t} className="absolute w-[22%] px-2 py-1.5 text-[10px] font-medium" style={{ ...card, borderRadius: 8, left: `${n.x}%`, top: `${n.y}%` }}>
              {n.t}<span className="block text-[8.5px] font-normal" style={{ color: p.muted, fontFamily: "'Geist Mono', monospace" }}>{n.t === "Classify" ? "llm" : n.t === "Refund tool" ? "tool" : "step"}</span>
            </div>
          ))}
        </div>
      );
    }
    case "Agent Console":
      return (
        <div className="flex h-full gap-3 p-4 text-[10px]">
          <div className="w-[36%] space-y-2 p-2.5" style={{ ...card, borderRadius: 8 }}>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold"><Bot className="h-3.5 w-3.5" style={{ color: p.accent }} />Refund agent</span>
            <span className="block rounded px-1.5 py-0.5 text-[9px]" style={{ background: subtle, color: p.muted, fontFamily: "'Geist Mono', monospace" }}>sonnet-5.5</span>
            {["search_orders", "issue_refund", "send_email"].map((t) => <span key={t} className="flex items-center gap-1.5" style={{ fontFamily: "'Geist Mono', monospace" }}><Wrench className="h-3 w-3" style={{ color: p.muted }} />{t}</span>)}
          </div>
          <div className="flex-1 space-y-2 p-2.5" style={{ ...card, borderRadius: 8 }}>
            {[[0, 30], [10, 22], [32, 26], [58, 14], [72, 24]].map(([x, w], i) => (
              <span key={i} className="block h-2.5 rounded" style={{ marginLeft: `${x}%`, width: `${w}%`, background: i === 3 ? "#d97706" : p.accent, opacity: 0.4 + (i % 2) * 0.3 }} />
            ))}
          </div>
        </div>
      );
    default:
      return <div className="mx-auto h-full max-w-[420px] px-4 py-5">{chat()}</div>;
  }
}
