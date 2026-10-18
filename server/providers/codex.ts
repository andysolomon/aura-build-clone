import { modelRef } from "../../shared/models";
import { AGENT_PREAMBLE } from "../prompts";
import { jsonLines, run, stderrSummary, withScratchDir, writeImages } from "./cli";
import type { Provider, ProviderEvent } from "./types";

interface CodexItem {
  id?: string;
  type?: string;
  text?: string;
  message?: string;
}

/** Codex CLI (`codex exec`), billed to the signed-in ChatGPT plan. */
export const codex: Provider = {
  id: "codex",
  label: "Codex",
  billing: "subscription",
  images: true,

  async detect() {
    const res = await run("codex", ["login", "status"]);
    if (!res) return { available: false, note: "Install the Codex CLI to use your ChatGPT plan." };
    const out = `${res.stdout}\n${res.stderr}`;
    if (res.code === 0 && /logged in/i.test(out)) {
      return { available: true, note: /chatgpt/i.test(out) ? undefined : out.trim().split("\n")[0] };
    }
    return { available: false, note: "Run `codex login` to sign in with ChatGPT." };
  },

  async listModels() {
    const res = await run("codex", ["debug", "models"]);
    if (!res || res.code !== 0) return [];
    const catalog = JSON.parse(res.stdout) as { models?: { slug: string; display_name?: string; visibility?: string }[] };
    return (catalog.models ?? [])
      .filter((m) => m.visibility === "list")
      .map((m) => ({ ref: modelRef("codex", m.slug), provider: "codex" as const, id: m.slug, label: m.display_name ?? m.slug }));
  },

  async *stream(input, signal) {
    yield* await withScratchDir(async function* (dir): AsyncGenerator<ProviderEvent> {
      const images = await writeImages(dir, input.images);
      const args = [
        "exec",
        "--json",
        "--skip-git-repo-check",
        "--ephemeral",
        "--ignore-user-config",
        "--ignore-rules",
        "--sandbox", "read-only",
        "-C", dir,
        "-m", input.model,
        "-c", `model_reasoning_effort="${input.effort}"`,
        // The prompt is read from stdin when no positional prompt is given.
        ...images.map((file) => `--image=${file}`),
      ];
      const stdin = `${AGENT_PREAMBLE}\n\n<instructions>\n${input.system}\n</instructions>\n\n${input.prompt}`;

      const lines = jsonLines("codex", args, { stdin, cwd: dir, signal });
      const emitted = new Map<string, number>();
      let streamed = false;
      let failure: string | undefined;
      let next = await lines.next();
      for (; !next.done; next = await lines.next()) {
        const line = next.value;
        const type = String(line.type ?? "");
        if (type.startsWith("item.")) {
          const item = (line.item ?? {}) as CodexItem;
          if (item.type === "agent_message" && item.text) {
            // Messages may arrive as growing updates or only on completion; emit the new suffix.
            const key = item.id ?? "message";
            const sent = emitted.get(key) ?? 0;
            if (item.text.length > sent) {
              streamed = true;
              yield { type: "delta", text: item.text.slice(sent) };
              emitted.set(key, item.text.length);
            }
          } else if (item.type === "reasoning" && item.text && type === "item.completed") {
            yield { type: "reasoning", text: `${item.text}\n` };
          } else if (item.type === "error" && item.message) {
            failure = item.message;
          }
        } else if (type === "turn.failed" || type === "error") {
          const error = (line.error ?? line) as { message?: string };
          failure = error.message ?? "Codex reported an error.";
        }
      }
      if (failure) yield { type: "error", message: `Codex: ${failure}` };
      else if (!streamed && next.value.code !== 0) {
        yield { type: "error", message: `Codex exited with code ${next.value.code}. ${stderrSummary(next.value.stderr)}` };
      }
    });
  },
};
