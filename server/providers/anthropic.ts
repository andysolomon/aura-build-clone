import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODELS, modelRef } from "../../shared/models";
import type { Provider, ProviderEvent } from "./types";

type BetaContentBlockParam = Anthropic.Beta.Messages.BetaContentBlockParam;
type BetaMessageStreamParams = Anthropic.Beta.Messages.MessageCreateParamsStreaming;

const DATA_URL = /^data:(image\/(?:png|jpeg|gif|webp));base64,(.+)$/;

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic());

/** Per-model request options: Haiku 4.5 takes neither effort nor server-side fallbacks. */
function modelOptions(model: string, effort: string): Partial<BetaMessageStreamParams> {
  if (model === "claude-haiku-4-5") return {};
  return {
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive", display: "summarized" },
    output_config: { effort: effort as "low" | "medium" | "high" },
  };
}

export function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY.";
  if (err instanceof Anthropic.NotFoundError) return "That model is not available to this API key.";
  if (err instanceof Anthropic.RateLimitError) return "Rate limited by the Anthropic API. Wait a moment and try again.";
  if (err instanceof Anthropic.APIConnectionError) return "Could not reach the Anthropic API.";
  if (err instanceof Anthropic.APIError) return `Anthropic API error (${err.status ?? "unknown"}): ${err.message}`;
  if (err instanceof Error && err.name === "AbortError") return "Generation cancelled.";
  return err instanceof Error ? err.message : String(err);
}

/** Anthropic API with ANTHROPIC_API_KEY (usage-billed). */
export const anthropicApi: Provider = {
  id: "anthropic",
  label: "Anthropic API",
  billing: "api-key",
  images: true,

  async detect() {
    return process.env.ANTHROPIC_API_KEY
      ? { available: true }
      : { available: false, note: "Set ANTHROPIC_API_KEY in .env to use the API." };
  },

  async listModels() {
    return CLAUDE_MODELS.map((m) => ({ ref: modelRef("anthropic", m.id), provider: "anthropic" as const, id: m.id, label: m.label }));
  },

  async *stream(input, signal): AsyncGenerator<ProviderEvent> {
    const content: BetaContentBlockParam[] = [];
    for (const image of input.images) {
      const match = DATA_URL.exec(image);
      if (!match) continue;
      const mediaType = match[1] as "image/png" | "image/jpeg" | "image/gif" | "image/webp";
      content.push({ type: "image", source: { type: "base64", media_type: mediaType, data: match[2] } });
    }
    content.push({ type: "text", text: input.prompt });

    try {
      const stream = getClient().beta.messages.stream(
        {
          model: input.model,
          max_tokens: 64000,
          system: [{ type: "text", text: input.system, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content }],
          ...modelOptions(input.model, input.effort),
        },
        { signal },
      );
      for await (const event of stream) {
        if (event.type !== "content_block_delta") continue;
        if (event.delta.type === "thinking_delta" && event.delta.thinking) yield { type: "reasoning", text: event.delta.thinking };
        else if (event.delta.type === "text_delta") yield { type: "delta", text: event.delta.text };
      }
      const final = await stream.finalMessage();
      if (final.stop_reason === "refusal") yield { type: "error", message: "The model declined this request. Try rephrasing the brief." };
      else if (final.stop_reason === "max_tokens") yield { type: "error", message: "The output hit the length limit before the page was finished." };
    } catch (err) {
      yield { type: "error", message: describeError(err) };
    }
  },
};
