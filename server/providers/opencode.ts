import { modelRef } from "../../shared/models";
import { stripVTControlCharacters } from "node:util";
import { agentPreamble } from "../prompts";
import { hasCommand, jsonLines, run, stderrSummary, subscriptionEnv, withScratchDir, writeImages } from "./cli";
import type { Provider, ProviderEvent } from "./types";

// OpenCode's free tier only serves its built-in agents, so the stock "build" agent is used
// with every editing and shell permission denied; design instructions go in the message.
const config = (webAccess?: boolean) => JSON.stringify({ permission: { edit: "deny", bash: "deny", webfetch: webAccess ? "allow" : "deny" } });

function prettyLabel(id: string): string {
  const separator = id.indexOf("/");
  const provider = id.slice(0, separator);
  const model = id.slice(separator + 1);
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
    if (!auth || auth.code !== 0) {
      return { available: true, note: "Couldn't check saved credentials. Run `opencode auth list` to check your sign-ins." };
    }
    const output = stripVTControlCharacters(`${auth.stdout}\n${auth.stderr}`);
    // Older versions print a credential count; newer versions print a table of stored integrations.
    const signedIn = /\b[1-9]\d*\s+credentials?\b/i.test(output)
      || /^\s*\S[^\r\n]*\s+(?:OAuth|API key|Default)\s+stored\s*$/im.test(output);
    return { available: true, note: signedIn ? undefined : "No saved credentials detected; run `opencode auth login` to connect a provider." };
  },

  async listModels() {
    const res = await run("opencode", ["models"], 30_000);
    if (!res || res.code !== 0) return [];
    return res.stdout
      .split("\n")
      .map((l) => stripVTControlCharacters(l).trim())
      // Routed model IDs can include an upstream provider, e.g. openrouter/anthropic/claude-….
      .filter((l) => /^[\w.-]+\/[^\s]+$/.test(l))
      .map((id) => ({ ref: modelRef("opencode", id), provider: "opencode" as const, id, label: prettyLabel(id) }));
  },

  async *stream(input, signal) {
    yield* await withScratchDir(async function* (dir): AsyncGenerator<ProviderEvent> {
      const files = await writeImages(dir, input.images);
      // cwd already selects the scratch workspace. Newer CLIs reject --dir and --pure.
      const args = ["run", "--format", "json", "--thinking", "--agent", "build", "-m", input.model];
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
          // Current OpenCode emits {type, message, status}; older versions nest the message in data.
          const error = line.error as { message?: string; name?: string; type?: string; data?: { message?: string } } | string | undefined;
          failure = typeof error === "string" ? error : error?.message ?? error?.data?.message ?? error?.name ?? error?.type;
          failure ||= "OpenCode reported an error.";
        }
      }
      if (failure) yield { type: "error", message: `OpenCode: ${failure}` };
      else if (!streamed && next.value.code !== 0) {
        yield { type: "error", message: `OpenCode exited with code ${next.value.code}. ${stderrSummary(next.value.stderr)}` };
      }
    });
  },
};
