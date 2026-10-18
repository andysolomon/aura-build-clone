import { parseModelRef } from "../shared/models";
import { splitGeneration, type GenerateRequest, type StreamEvent } from "../shared/protocol";
import { enhanceDemo, generateDemo } from "./demo";
import { ENHANCE_SYSTEM_PROMPT, SYSTEM_PROMPT, renderRequest } from "./prompts";
import { discoverProviders, getProvider } from "./providers";
import { isAuthError, recordAuthFailure } from "./providers/health";
import type { Provider } from "./providers/types";

type Target = { provider: Provider; model: string };

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
  return isAuthError(message) ? recordAuthFailure(target.provider.id, target.model, message) : message;
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

  yield { type: "status", phase: "thinking", message: req.html ? "Planning the edit" : "Planning the design" };
  let raw = "";
  let writing = false;
  const events = target.provider.stream(
    { model: target.model, system: SYSTEM_PROMPT, prompt: renderRequest(req), images: req.images ?? [], effort: "medium" },
    signal,
  );
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

export async function enhance(prompt: string, ref: string): Promise<string> {
  const target = await resolve(ref);
  if (target === null || "error" in target) return enhanceDemo(prompt);
  let text = "";
  const controller = new AbortController();
  for await (const event of target.provider.stream(
    { model: target.model, system: ENHANCE_SYSTEM_PROMPT, prompt, images: [], effort: "low" },
    controller.signal,
  )) {
    if (event.type === "error") throw new Error(explain(target, event.message));
    if (event.type === "delta") text += event.text;
  }
  return text.trim() || prompt;
}
