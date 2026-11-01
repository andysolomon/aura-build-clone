import { ArrowRight, AudioLines, BookOpen, Boxes, Code2, Headset, Layers, MessageCircle, Search, Workflow, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { LibraryHero, LibraryPanel, PulseRow } from "../components/LibraryHero";
import { AGENT_UI_INDEX, loadJson, type AgentComponentEntry } from "../lib/content";
import { setPrefill } from "../lib/prefill";
import { componentRef } from "../lib/references";
import { AGENT_PARTS, AGENT_SURFACES } from "../data/promptBuilder";
import { ComponentCard } from "./ComponentsPage";

const AGENT_SKILL = "agentic-interfaces";

const GROUPS: { name: string; description: string }[] = [
  { name: "Chat", description: "The conversation itself: threads, app shells, embeddable widgets and the composer." },
  { name: "Reasoning & tools", description: "Show the agent's work as it happens: thinking, tool calls, citations and loading states." },
  { name: "Human in the loop", description: "Keep people in control with approvals, questions, plans and queues." },
  { name: "Workspace", description: "Where the agent's output lives: artifacts, previews, terminals, tests and run traces." },
  { name: "Voice & workflow", description: "Beyond text: voice personas and visual workflow editors." },
];

const STARTERS: { title: string; description: string; icon: LucideIcon; reference: string; prompt: string }[] = [
  {
    title: "Support copilot",
    description: "Looks up orders, asks before refunding, and cites the help center.",
    icon: Headset,
    reference: "agent-app-shell",
    prompt:
      "Build a working support copilot for Harbor, an online homewares store. Use a thread-list sidebar and a thread where the agent looks up orders with tool calls, asks for approval before issuing a refund, cites the help center inline, and renders order status as a card. Sending a message plays a scripted run with streaming text and a working stop button.",
  },
  {
    title: "Research assistant",
    description: "An answer engine with source cards and inline citations.",
    icon: Search,
    reference: "agent-sources-citations",
    prompt:
      "Build a working research assistant called Lumen. Show collapsible reasoning, a web search tool call, a streamed answer with inline citation pills that open hover cards, a “Used 6 sources” disclosure, and related questions that stream a new answer when clicked.",
  },
  {
    title: "Coding agent workspace",
    description: "Chat beside an artifact panel with preview, code, terminal and tests.",
    icon: Code2,
    reference: "agent-artifact-workspace",
    prompt:
      "Build a working coding agent workspace called Forge. Put chat on the left with task steps, file chips and restore-checkpoint separators. Put an artifact panel on the right with Preview, Code, Terminal and Tests tabs. Running the agent streams build output and updates the test results.",
  },
  {
    title: "Docs chat widget",
    description: "A launcher bubble and cited answers on top of a marketing page.",
    icon: MessageCircle,
    reference: "agent-chat-widget",
    prompt:
      "Build a landing page for Parcelwise, a shipping API, with a floating chat widget. The launcher opens a compact panel with quick-action chips, streamed answers with numbered citations, a “Talk to a human” handoff and a feedback bar.",
  },
  {
    title: "Voice concierge",
    description: "An animated persona with a live transcript and voice controls.",
    icon: AudioLines,
    reference: "agent-voice-mode",
    prompt:
      "Build a working voice concierge for a boutique hotel. Use an animated persona orb with idle, listening, thinking and speaking states, a live transcript that highlights the spoken word, and mic and voice selectors. Pressing the mic plays a scripted conversation.",
  },
  {
    title: "Agent workflow builder",
    description: "A node graph of agent steps with a human approval gate.",
    icon: Workflow,
    reference: "agent-workflow-canvas",
    prompt:
      "Build a working agent workflow builder for lead triage. Use a dotted canvas with draggable nodes for trigger, classify, condition, tool, agent and human approval steps, bezier edges with an animated active path, zoom controls and a node inspector. Run animates through the graph and pauses for approval.",
  },
];

export function AgentUIPage() {
  const navigate = useNavigate();
  const [kit, setKit] = useState<AgentComponentEntry[]>([]);

  useEffect(() => {
    let alive = true;
    void loadJson<AgentComponentEntry[]>(AGENT_UI_INDEX).then((entries) => alive && setKit(entries));
    return () => {
      alive = false;
    };
  }, []);

  const grouped = useMemo(() => GROUPS.map((group) => ({ ...group, items: kit.filter((c) => c.group === group.name) })), [kit]);

  function start(starter: (typeof STARTERS)[number]) {
    setPrefill({ prompt: starter.prompt, references: [componentRef(starter.reference)], skills: [AGENT_SKILL] });
    navigate("/");
  }

  return (
    <div className="relative">
      <LibraryHero
        eyebrow="Agent UI"
        title="Build agentic interfaces"
        description="Describe a chat, copilot or agent and get a working interface: streaming replies, reasoning, tool calls, approvals, sources and artifacts, simulated with a scripted run so you can click through it."
        pulseTitle="In the kit"
        pulse={
          <>
            <PulseRow icon={<Boxes className="h-3.5 w-3.5 text-blue-500" />} label="Components" value={kit.length} />
            <PulseRow icon={<Layers className="h-3.5 w-3.5 text-emerald-500" />} label="Surfaces" value={Object.keys(AGENT_SURFACES).length} />
            <PulseRow icon={<BookOpen className="h-3.5 w-3.5 text-amber-500" />} label="Message parts" value={Object.keys(AGENT_PARTS).length} />
          </>
        }
      />
      <LibraryPanel>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight">Start from a brief</h2>
            <p className="mt-1 text-[13px] text-muted">Opens the composer with the prompt, a matching component and the Agentic interfaces skill attached.</p>
          </div>
          <Link to="/learn/agentic-interfaces" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-fg">
            How to prompt for agent UIs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STARTERS.map((starter) => (
            <button
              key={starter.title}
              type="button"
              onClick={() => start(starter)}
              className="group flex items-start gap-3 rounded-2xl border border-line p-4 text-left transition hover:-translate-y-0.5 hover:bg-subtle/60 hover:shadow-composer"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-subtle text-muted transition group-hover:text-fg">
                <starter.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-[14px] font-medium">
                  {starter.title}
                  <ArrowRight className="h-3.5 w-3.5 text-faint transition group-hover:translate-x-0.5 group-hover:text-fg" />
                </span>
                <span className="mt-1 block text-[12.5px] leading-relaxed text-muted">{starter.description}</span>
              </span>
            </button>
          ))}
        </div>

        {grouped.map((group) => (
          <section key={group.name} className="mt-10">
            <h2 className="text-[17px] font-semibold tracking-tight">{group.name}</h2>
            <p className="mt-1 text-[13px] text-muted">{group.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.items.map((c) => <ComponentCard key={c.slug} component={c} />)}
            </div>
          </section>
        ))}
        {kit.length === 0 && <p className="py-20 text-center text-sm text-muted">Loading the kit…</p>}
      </LibraryPanel>
    </div>
  );
}
