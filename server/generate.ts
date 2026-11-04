import { parseModelRef } from "../shared/models";
import { splitGeneration, type GenerateRequest, type StreamEvent } from "../shared/protocol";
import { withAgenticSkill } from "./agentic";
import { enhanceDemo, generateDemo } from "./demo";
import { ENHANCE_SYSTEM_PROMPT, ENHANCE_TOOL_SYSTEM_PROMPT, SYSTEM_PROMPT, enhanceToolRequest, renderRequest } from "./prompts";
import { discoverProviders, getProvider } from "./providers";
import { isAuthError, isModelUnavailableError, recordAuthFailure, recordModelFailure } from "./providers/health";
import type { Provider } from "./providers/types";

type Target = { provider: Provider; model: string };

// Model calls in flight. The dev watcher (scripts/dev-api.ts) waits for this to reach zero
// before restarting the server, since a restart kills the CLI mid-generation.
let active = 0;
export const activeGenerations = () => active;

async function resolve(ref: string): Promise<Target | { error: string } | null> {
  const parsed = parseModelRef(ref);
  if (!parsed || parsed.provider === "demo") return null;
  const provider = getProvider(parsed.provider);
  const info = (await discoverProviders()).find((p) => p.id === parsed.provider);
  if (!provider || !info?.available) {
    return { error: `${info?.label ?? parsed.provider} isn't available${info?.note ? `: ${info.note}` : "."}` };
  }
  const unavailable = info.models.find((m) => m.id === parsed.id)?.unavailable;
  if (unavailable) return { error: `${info.label} can't use this model right now. ${unavailable}` };
  return { provider, model: parsed.id };
}

function explain(target: Target, message: string): string {
  if (isAuthError(message)) return recordAuthFailure(target.provider.id, target.model, message);
  if (isModelUnavailableError(message)) return recordModelFailure(target.provider.id, target.model, message);
  return message;
}

export async function* generate(req: GenerateRequest, signal: AbortSignal): AsyncGenerator<StreamEvent> {
  const target = await resolve(req.model);
  if (target === null) {
    yield* generateDemo(req, signal);
    return;
  }
  if ("error" in target) {
    yield { type: "error", message: target.error };
    return;
  }

  const webAccess = Boolean(req.webAccess && target.provider.web);
  yield { type: "status", phase: "thinking", message: webAccess ? "Researching" : req.html ? "Planning the edit" : "Planning the design" };
  if (req.webAccess && !target.provider.web) {
    yield { type: "reasoning", text: `${target.provider.label} can't browse the web, so this runs without web access.\n` };
  }
  const agentic = withAgenticSkill(req);
  if (agentic.attached) {
    yield { type: "reasoning", text: "This is an agent interface, so the Agentic interfaces skill is attached.\n" };
  }
  let raw = "";
  let writing = false;
  const events = target.provider.stream(
    { model: target.model, system: SYSTEM_PROMPT, prompt: renderRequest({ ...agentic.req, webAccess }), images: req.images ?? [], effort: "medium", webAccess },
    signal,
  );
  active++;
  try {
    for await (const event of events) {
      if (event.type === "error") {
        yield { type: "error", message: explain(target, event.message) };
        return;
      }
      if (event.type === "delta") {
        if (!writing) {
          writing = true;
          yield { type: "status", phase: "writing", message: "Writing code" };
        }
        raw += event.text;
      }
      yield event;
    }
  } finally {
    active--;
  }
  if (signal.aborted) {
    yield { type: "error", message: "Generation cancelled." };
    return;
  }

  const { summary, html } = splitGeneration(raw);
  if (!html) {
    const reply = raw.trim().slice(0, 240);
    yield { type: "error", message: `The model didn't return an HTML document.${reply ? ` It replied: “${reply}”` : ""}` };
    return;
  }
  yield { type: "done", html, summary: summary || "Here is your page.", model: req.model, demo: false };
}

const ENHANCE_TIMEOUT_MS = 120_000;

/** Runs a short, non-streamed completion with a time limit (CLIs can queue behind other sessions). */
async function complete(target: Target, system: string, prompt: string): Promise<string> {
  let text = "";
  const signal = AbortSignal.timeout(ENHANCE_TIMEOUT_MS);
  active++;
  try {
    for await (const event of target.provider.stream({ model: target.model, system, prompt, images: [], effort: "low" }, signal)) {
      if (signal.aborted) break;
      if (event.type === "error") throw new Error(explain(target, event.message));
      if (event.type === "delta") text += event.text;
    }
  } finally {
    active--;
  }
  if (signal.aborted) throw new Error("The model took too long to respond. Try again, or pick another model.");
  return text;
}

export async function enhance(prompt: string, ref: string): Promise<string> {
  const target = await resolve(ref);
  if (target === null || "error" in target) return enhanceDemo(prompt);
  return (await complete(target, ENHANCE_SYSTEM_PROMPT, prompt)).trim() || prompt;
}

export interface EnhanceResult {
  prompt: string;
  short: string;
  notes: string[];
}

function parseEnhanceJson(text: string): EnhanceResult | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const data = JSON.parse(text.slice(start, end + 1)) as Partial<EnhanceResult>;
    if (typeof data.prompt !== "string" || !data.prompt.trim()) return null;
    return {
      prompt: data.prompt.trim(),
      short: typeof data.short === "string" ? data.short.trim() : "",
      notes: Array.isArray(data.notes) ? data.notes.filter((n): n is string => typeof n === "string").slice(0, 6) : [],
    };
  } catch {
    return null;
  }
}

/** Prompt enhancer tool: a full prompt, a short version and design notes. */
export async function enhanceTool(prompt: string, ref: string, projectType: string, outputStyle: string): Promise<EnhanceResult> {
  const target = await resolve(ref);
  if (target === null || "error" in target) {
    const full = enhanceDemo(prompt);
    return {
      prompt: full,
      short: `${prompt.trim().replace(/\.$/, "")}, with a bold hero, clear sections and polished motion.`,
      notes: ["Demo mode: pick a signed-in model for AI-written prompts.", `Shaped for a ${projectType.toLowerCase()}.`],
    };
  }
  const text = await complete(target, ENHANCE_TOOL_SYSTEM_PROMPT, enhanceToolRequest(prompt, projectType, outputStyle));
  return parseEnhanceJson(text) ?? { prompt: text.trim() || prompt, short: "", notes: [] };
}
