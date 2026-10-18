import { modelRef } from "../../shared/models";
import { AGENT_PREAMBLE } from "../prompts";
import { jsonLines, run, stderrSummary, withScratchDir } from "./cli";
import type { Provider, ProviderEvent } from "./types";

const MODEL_LINE = /^(\S+) - (.+?)(?:\s+\((?:current, )?default\))?$/;
const VARIANT = /(-thinking)?(-(none|minimal|low|medium|high|xhigh|extra-high|max))?(-thinking)?$/;
// Which effort variant represents a model family in the picker.
const VARIANT_RANK = ["-medium", "-high", "", "-xhigh", "-low", "-max", "-none", "-minimal"];

/** Cursor lists every effort and thinking variant separately; keep one entry per model family. */
function collapseVariants<T extends { id: string }>(models: T[]): T[] {
  const families = new Map<string, T[]>();
  for (const m of models) {
    const base = m.id.replace(VARIANT, "") || m.id;
    families.set(base, [...(families.get(base) ?? []), m]);
  }
  const rank = (m: T) => {
    const r = VARIANT_RANK.indexOf(VARIANT.exec(m.id)?.[2] ?? "");
    return (r === -1 ? VARIANT_RANK.length : r) + (m.id.includes("thinking") ? 0.5 : 0);
  };
  return [...families.values()].map((variants) => [...variants].sort((a, b) => rank(a) - rank(b))[0]);
}

/** Cursor Agent CLI in print mode, billed to the signed-in Cursor plan. */
export const cursor: Provider = {
  id: "cursor",
  label: "Cursor",
  billing: "subscription",
  images: false,

  async detect() {
    const res = await run("cursor-agent", ["status"]);
    if (!res) return { available: false, note: "Install the Cursor Agent CLI to use your Cursor plan." };
    if (/logged in/i.test(`${res.stdout}\n${res.stderr}`) && !/not logged in/i.test(res.stdout)) return { available: true };
    return { available: false, note: "Run `cursor-agent login` to sign in." };
  },

  async listModels() {
    const res = await run("cursor-agent", ["--list-models"], 45_000);
    if (!res || res.code !== 0) return [];
    const models = res.stdout
      .split("\n")
      .map((line) => MODEL_LINE.exec(line.replace(/[\u200b\u001b]|\[\d+m/g, "").trim()))
      .filter((m): m is RegExpExecArray => m !== null)
      // "-fast" variants duplicate their base model at a different speed tier.
      .filter((m) => !m[1].endsWith("-fast"))
      .map((m) => ({ ref: modelRef("cursor", m[1]), provider: "cursor" as const, id: m[1], label: m[2].replace(/\s+/g, " ").trim() }));
    return collapseVariants(models);
  },

  async *stream(input, signal) {
    yield* await withScratchDir(async function* (dir): AsyncGenerator<ProviderEvent> {
      const args = [
        "-p",
        "--output-format", "stream-json",
        "--stream-partial-output",
        // Ask mode is read-only: the agent can't edit files or run commands.
        "--mode", "ask",
        "--trust",
        "--workspace", dir,
        "--model", input.model,
      ];
      const stdin = `${AGENT_PREAMBLE}\n\n<instructions>\n${input.system}\n</instructions>\n\n${input.prompt}`;

      const lines = jsonLines("cursor-agent", args, { stdin, cwd: dir, signal });
      let streamed = false;
      let result: string | undefined;
      let failure: string | undefined;
      let next = await lines.next();
      for (; !next.done; next = await lines.next()) {
        const line = next.value;
        if (line.type === "assistant") {
          // With --stream-partial-output, timestamped events are deltas; the untimestamped
          // event that follows repeats the whole message and is skipped.
          if (line.timestamp_ms === undefined) continue;
          const message = line.message as { content?: { type: string; text?: string }[] } | undefined;
          const text = (message?.content ?? []).map((c) => (c.type === "text" ? (c.text ?? "") : "")).join("");
          if (text) {
            streamed = true;
            yield { type: "delta", text };
          }
        } else if (line.type === "thinking" && typeof line.text === "string" && line.text) {
          yield { type: "reasoning", text: line.text };
        } else if (line.type === "result") {
          if (line.is_error || line.subtype !== "success") failure = String(line.result ?? line.subtype ?? "unknown error");
          else result = String(line.result ?? "");
        }
      }
      if (failure) yield { type: "error", message: `Cursor: ${failure}` };
      else if (!streamed && result) yield { type: "delta", text: result };
      else if (!streamed && next.value.code !== 0) {
        yield { type: "error", message: `Cursor exited with code ${next.value.code}. ${stderrSummary(next.value.stderr)}` };
      }
    });
  },
};
