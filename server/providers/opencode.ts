import { modelRef } from "../../shared/models";
import { agentPreamble } from "../prompts";
import { hasCommand, jsonLines, run, stderrSummary, subscriptionEnv, withScratchDir, writeImages } from "./cli";
import type { Provider, ProviderEvent } from "./types";

// OpenCode's free tier only serves its built-in agents, so the stock "build" agent is used
// with every editing and shell permission denied; design instructions go in the message.
const config = (webAccess?: boolean) => JSON.stringify({ permission: { edit: "deny", bash: "deny", webfetch: webAccess ? "allow" : "deny" } });

function prettyLabel(id: string): string {
  const [provider, model = id] = id.split("/");
  const name = model.replace(/-free$/, "").replace(/-/g, " ");
  return `${name} · ${provider}${model.endsWith("-free") ? " (free)" : ""}`;
}

/** OpenCode CLI (`opencode run`), using whatever providers are signed in to OpenCode. */
export const opencode: Provider = {
  id: "opencode",
  label: "OpenCode",
  billing: "subscription",
  images: true,
  web: true,

  async detect() {
    if (!(await hasCommand("opencode"))) return { available: false, note: "Install OpenCode to use its providers." };
    const auth = await run("opencode", ["auth", "list"]);
    const signedIn = auth && /\d+\s+credentials?/.test(auth.stdout) && !/\b0\s+credentials/.test(auth.stdout);
    return { available: true, note: signedIn ? undefined : "Only free models; run `opencode auth login` for your plan." };
  },

  async listModels() {
    const res = await run("opencode", ["models"], 30_000);
    if (!res || res.code !== 0) return [];
    return res.stdout
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => /^[\w.-]+\/[\w.:-]+$/.test(l))
      .map((id) => ({ ref: modelRef("opencode", id), provider: "opencode" as const, id, label: prettyLabel(id) }));
  },

  async *stream(input, signal) {
    yield* await withScratchDir(async function* (dir): AsyncGenerator<ProviderEvent> {
      const files = await writeImages(dir, input.images);
      const args = ["run", "--format", "json", "--thinking", "--pure", "--agent", "build", "--dir", dir, "-m", input.model];
      for (const file of files) args.push("-f", file);
      const stdin = `${agentPreamble(input.webAccess)}\n\n<instructions>\n${input.system}\n</instructions>\n\n${input.prompt}`;

      const lines = jsonLines("opencode", args, { stdin, cwd: dir, signal, env: subscriptionEnv({ OPENCODE_CONFIG_CONTENT: config(input.webAccess) }) });
      let streamed = false;
      let failure: string | undefined;
      let next = await lines.next();
      for (; !next.done; next = await lines.next()) {
        const line = next.value;
        const part = line.part as { text?: string } | undefined;
        if (line.type === "text" && part?.text) {
          streamed = true;
          yield { type: "delta", text: part.text };
        } else if (line.type === "reasoning" && part?.text) {
          yield { type: "reasoning", text: `${part.text}\n` };
        } else if (line.type === "error") {
          const error = line.error as { name?: string; data?: { message?: string } } | undefined;
          failure = error?.data?.message ?? error?.name ?? "OpenCode reported an error.";
        }
      }
      if (failure) yield { type: "error", message: `OpenCode: ${failure}` };
      else if (!streamed && next.value.code !== 0) {
        yield { type: "error", message: `OpenCode exited with code ${next.value.code}. ${stderrSummary(next.value.stderr)}` };
      }
    });
  },
};
