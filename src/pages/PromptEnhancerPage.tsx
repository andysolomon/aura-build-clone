import { ArrowRight, Check, Copy, WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ModelPicker } from "../components/ModelPicker";
import { Button, Spinner } from "../components/ui";
import { api } from "../lib/api";
import { setPrefill } from "../lib/prefill";
import { refreshAppConfig, usableModel, useAppConfig } from "../lib/projects";
import { cx, useDismiss } from "../lib/util";

const PROJECT_TYPES = ["Landing page", "SaaS website", "Agent interface", "Mobile screen", "Portfolio", "Ecommerce", "DESIGN.md direction"];
const OUTPUT_STYLES = ["Full prompt", "Concise prompt", "Design-heavy", "Conversion-heavy"];
const EXAMPLES = [
  "A modern SaaS landing page for a meeting notes app with a clean dashboard hero.",
  "Mobile onboarding screens for a meditation app with warm colors and calm motion.",
  "A premium agency homepage that feels editorial, bold, and conversion-focused.",
];
const MAX = 4000;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy
    </Button>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-lg border border-line bg-panel px-3 text-sm outline-none focus:border-faint">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function PromptEnhancerPage() {
  const navigate = useNavigate();
  const config = useAppConfig();
  const [rough, setRough] = useState("");
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [outputStyle, setOutputStyle] = useState(OUTPUT_STYLES[0]);
  const [model, setModel] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ prompt: string; short: string; notes: string[] } | null>(null);
  const pickerRef = useDismiss<HTMLDivElement>(pickerOpen, () => setPickerOpen(false));

  useEffect(() => {
    if (config) setModel((m) => usableModel(config, m));
  }, [config]);

  async function enhance() {
    if (!rough.trim() || state === "loading") return;
    setState("loading");
    setError("");
    try {
      setResult(await api.enhanceTool({ prompt: rough.trim(), model, projectType, outputStyle }));
      setState("idle");
    } catch (err) {
      setError(err instanceof DOMException && err.name === "TimeoutError" ? "The request timed out. Try again, or pick another model." : err instanceof Error ? err.message : "Enhance failed.");
      setState("error");
    }
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6 pb-10 pt-16">
      <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Resources · Free AI web design tool</p>
      <h1 className="mt-3 max-w-3xl text-[clamp(2.2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.035em]">AI prompt enhancer for website builders</h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
        Turn a rough idea into a practical prompt for landing pages, mobile screens, SaaS websites and portfolios. Works with any AI website builder, and especially well here.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-panel p-5 shadow-composer">
          <p className="text-[12px] font-medium text-muted">Try an example</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button key={e} type="button" onClick={() => setRough(e)} className="rounded-lg border border-line px-3 py-1.5 text-left text-[12.5px] text-muted transition hover:bg-subtle hover:text-fg">
                {e}
              </button>
            ))}
          </div>
          <label className="mt-5 block">
            <span className="mb-1.5 flex justify-between text-[12px] font-medium text-muted">
              Rough prompt <span className={cx("font-mono", rough.length > MAX && "text-red-500")}>{rough.length}/{MAX}</span>
            </span>
            <textarea
              value={rough}
              onChange={(e) => setRough(e.target.value.slice(0, MAX))}
              rows={7}
              placeholder="A landing page for my coffee subscription…"
              className="w-full resize-y rounded-xl border border-line bg-canvas p-3 text-[14px] outline-none focus:border-faint"
            />
          </label>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Select label="Project type" value={projectType} options={PROJECT_TYPES} onChange={setProjectType} />
            <Select label="Output style" value={outputStyle} options={OUTPUT_STYLES} onChange={setOutputStyle} />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div ref={pickerRef}>
              <ModelPicker
                providers={config?.providers ?? null}
                value={model}
                onChange={(m) => (setModel(m), setPickerOpen(false))}
                open={pickerOpen}
                onToggle={() => setPickerOpen((v) => !v)}
                side="top"
                buttonClassName="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-line bg-panel px-2.5 text-[12.5px] hover:bg-subtle"
                onRefresh={refreshAppConfig}
              />
            </div>
            <Button variant="primary" size="lg" onClick={enhance} disabled={!rough.trim() || state === "loading"}>
              {state === "loading" ? <Spinner /> : <WandSparkles className="h-4 w-4" />} Enhance prompt
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-5">
          {state === "loading" ? (
            <div className="grid h-full min-h-72 place-items-center text-center">
              <div>
                <Spinner className="text-accent" />
                <p className="mt-3 font-medium">Enhancing your prompt</p>
                <p className="mt-1 text-sm text-muted">Turning the rough idea into a structured design prompt.</p>
              </div>
            </div>
          ) : result ? (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enhanced prompt</p>
                  <p className="text-[12.5px] text-muted">Ready for your website builder</p>
                </div>
                <CopyButton text={result.prompt} />
              </div>
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-subtle p-4 text-[14px] leading-relaxed">{result.prompt}</p>
              {result.short && (
                <>
                  <div className="mt-5 flex items-center justify-between">
                    <p className="font-medium">Short version</p>
                    <CopyButton text={result.short} />
                  </div>
                  <p className="mt-2 rounded-xl bg-subtle p-3 text-[13.5px] leading-relaxed">{result.short}</p>
                </>
              )}
              <p className="mt-5 font-medium">Design notes</p>
              {result.notes.length ? (
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13.5px] text-muted">{result.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
              ) : (
                <p className="mt-2 text-[13.5px] text-muted">No notes returned.</p>
              )}
              <Button
                variant="primary"
                className="mt-6"
                onClick={() => {
                  setPrefill({ prompt: result.prompt });
                  navigate("/");
                }}
              >
                Try it in Create <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid h-full min-h-72 place-items-center text-center">
              <div>
                <WandSparkles className="mx-auto h-7 w-7 text-faint" />
                <p className="mt-3 font-medium">{state === "error" ? "Something went wrong" : "Your enhanced prompt will appear here"}</p>
                <p className="mt-1 max-w-sm text-sm text-muted">{state === "error" ? error : "Add the rough idea, choose the page type, and let the enhancer turn it into a clearer design prompt."}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
