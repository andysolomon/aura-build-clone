import { CLAUDE_MODELS, modelRef } from "../../shared/models";
import { jsonLines, run, stderrSummary, withScratchDir } from "./cli";
import type { Provider, ProviderEvent } from "./types";

const DATA_URL = /^data:(image\/(?:png|jpeg|gif|webp));base64,(.+)$/;

/** Claude Code CLI in headless print mode, billed to the signed-in Claude subscription. */
export const claudeCode: Provider = {
  id: "claude-code",
  label: "Claude Code",
  billing: "subscription",
  images: true,
  web: true,

  async detect() {
    const res = await run("claude", ["auth", "status"]);
    if (!res) return { available: false, note: "Install Claude Code to use your Claude subscription." };
    try {
      const status = JSON.parse(res.stdout) as { loggedIn?: boolean; authMethod?: string };
      if (status.loggedIn) {
        return { available: true, note: status.authMethod === "claude.ai" ? undefined : `Signed in with ${status.authMethod}` };
      }
    } catch {
      // Fall through to the signed-out message.
    }
    return { available: false, note: "Run `claude` and sign in with your Claude account." };
  },

  async listModels() {
    return CLAUDE_MODELS.map((m) => ({ ref: modelRef("claude-code", m.id), provider: "claude-code" as const, id: m.id, label: m.label }));
  },

  async *stream(input, signal) {
    yield* await withScratchDir(async function* (dir): AsyncGenerator<ProviderEvent> {
      const args = [
        "-p",
        "--output-format", "stream-json",
        "--verbose",
        "--include-partial-messages",
        "--input-format", "stream-json",
        "--model", input.model,
        // No MCP servers, user settings, hooks or slash commands. Tools are off unless the user
        // turned on web access, which allows only the read-only web tools (pre-approved).
        "--tools", input.webAccess ? "WebFetch,WebSearch" : "",
        ...(input.webAccess ? ["--allowedTools", "WebFetch WebSearch"] : []),
        "--system-prompt", input.system,
        "--setting-sources", "project",
        "--strict-mcp-config",
        "--no-session-persistence",
        "--disable-slash-commands",
      ];
      if (input.model !== "claude-haiku-4-5") args.push("--effort", input.effort);

      const content: unknown[] = [];
      for (const image of input.images) {
        const match = DATA_URL.exec(image);
        if (match) content.push({ type: "image", source: { type: "base64", media_type: match[1], data: match[2] } });
      }
      content.push({ type: "text", text: input.prompt });
      const stdin = `${JSON.stringify({ type: "user", message: { role: "user", content } })}\n`;

      const lines = jsonLines("claude", args, { stdin, cwd: dir, signal });
      let streamed = false;
      let result: string | undefined;
      let failure: string | undefined;
      let next = await lines.next();
      for (; !next.done; next = await lines.next()) {
        const line = next.value;
        if (line.type === "stream_event") {
          const event = line.event as
            | { type?: string; delta?: { type?: string; text?: string; thinking?: string }; content_block?: { type?: string; name?: string } }
            | undefined;
          if (event?.type === "content_block_start" && event.content_block?.type === "tool_use") {
            yield { type: "reasoning", text: `${event.content_block.name === "WebSearch" ? "Searching the web" : "Fetching a page"}…\n` };
            continue;
          }
          if (event?.type !== "content_block_delta") continue;
          if (event.delta?.type === "text_delta" && event.delta.text) {
            streamed = true;
            yield { type: "delta", text: event.delta.text };
          } else if (event.delta?.type === "thinking_delta" && event.delta.thinking) {
            yield { type: "reasoning", text: event.delta.thinking };
          }
        } else if (line.type === "result") {
          if (line.is_error || line.subtype !== "success") failure = String(line.result ?? line.subtype ?? "unknown error");
          else result = String(line.result ?? "");
        }
      }
      if (failure) yield { type: "error", message: `Claude Code: ${failure}` };
      else if (!streamed && result) yield { type: "delta", text: result };
      else if (!streamed && next.value.code !== 0) {
        yield { type: "error", message: `Claude Code exited with code ${next.value.code}. ${stderrSummary(next.value.stderr)}` };
      }
    });
  },
};
