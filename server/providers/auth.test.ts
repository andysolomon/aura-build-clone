import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { claudeCode } from "./claude-code";
import { cursor } from "./cursor";
import { authFailure, clearAuthFailures, clearModelFailures, isAuthError, isModelUnavailableError, modelFailure, recordAuthFailure, recordModelFailure } from "./health";
import { opencode } from "./opencode";

// Exercise discovery through the real CLI runner without touching local credentials or the network.
type Response = { stdout?: string; stderr?: string; code?: number };
let dir: string;
const originalPath = process.env.PATH;

before(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "aura-auth-test-"));
  const script = `#!${process.execPath}
const fs = require("node:fs");
const path = require("node:path");
const responses = JSON.parse(fs.readFileSync(path.join(__dirname, "responses.json"), "utf8"));
const key = [path.basename(process.argv[1]), ...process.argv.slice(2)].join(" ");
const response = responses[key];
if (!response) { process.stderr.write("Unexpected test command: " + key); process.exit(1); }
process.stdout.write(response.stdout || "");
process.stderr.write(response.stderr || "");
process.exit(response.code || 0);
`;
  for (const command of ["claude", "cursor-agent", "opencode"]) {
    await writeFile(path.join(dir, command), script, { mode: 0o700 });
  }
  process.env.PATH = `${dir}${path.delimiter}${originalPath ?? ""}`;
});

after(async () => {
  if (originalPath === undefined) delete process.env.PATH;
  else process.env.PATH = originalPath;
  clearAuthFailures();
  clearModelFailures();
  await rm(dir, { recursive: true, force: true });
});

async function respond(responses: Record<string, Response>) {
  await writeFile(path.join(dir, "responses.json"), JSON.stringify(responses));
}

test("Claude requires a successful signed-in status and gives a subscription login command", async () => {
  for (const response of [
    { stdout: '{"loggedIn":false,"authMethod":"none"}', code: 1 },
    { stdout: '{"loggedIn":true}', code: 1 },
    { stdout: "invalid JSON" },
  ]) {
    await respond({ "claude auth status": response });
    const status = await claudeCode.detect();
    assert.equal(status.available, false);
    assert.match(status.note ?? "", /claude auth login --claudeai/);
  }
  await respond({ "claude auth status": { stdout: '{"loggedIn":true,"authMethod":"claude.ai"}' } });
  assert.deepEqual(await claudeCode.detect(), { available: true, note: undefined });
});

test("Cursor surfaces stale credentials when status claims it is logged in", async () => {
  await respond({
    "cursor-agent status": { stdout: "✓ Login successful!\nLogged in (unable to fetch user details)" },
    "cursor-agent --list-models": { stderr: "Error: Authentication required. Run 'agent login'", code: 1 },
  });
  assert.equal((await cursor.detect()).available, true);
  await assert.rejects(cursor.listModels(), /Cursor authentication failed.*cursor-agent login/);
});

test("Cursor rejects a signed-out message on stderr and a failed status command", async () => {
  for (const response of [
    { stdout: "Logged in", stderr: "Not logged in" },
    { stdout: "Logged in", code: 1 },
  ]) {
    await respond({ "cursor-agent status": response });
    assert.equal((await cursor.detect()).available, false);
  }
});

test("Cursor still discovers colored model lists and collapses effort variants", async () => {
  await respond({ "cursor-agent --list-models": { stdout: "\u001b[1;32mclaude-opus-medium - Claude Opus\u001b[0m\nclaude-opus-high - Claude Opus\nclaude-opus-fast - Claude Opus Fast\nauto - Auto (default)\n" } });
  const models = await cursor.listModels();
  assert.deepEqual(models.map((m) => m.id), ["claude-opus-medium", "auto"]);
  assert.equal(models[1].label, "Auto");
});

test("OpenCode recognizes stored integrations and legacy credential counts on either stream", async () => {
  for (const response of [
    { stdout: "Anthropic          OAuth                       stored\nGoogle             API key                     stored\nOpenCode Console   Default                     stored\n" },
    { stderr: "\u001b[32mAnthropic          OAuth                       stored\u001b[0m\n" },
    { stdout: "└  7 credentials\n" },
    { stderr: "\u001b[90m└  2 credentials\u001b[0m\n" },
  ]) {
    await respond({ "opencode auth list": response });
    assert.deepEqual(await opencode.detect(), { available: true, note: undefined });
  }
});

test("OpenCode distinguishes missing credentials from a failed credential check", async () => {
  await respond({ "opencode auth list": { stdout: "└  0 credentials\n" } });
  const signedOut = await opencode.detect();
  assert.equal(signedOut.available, true);
  assert.match(signedOut.note ?? "", /No saved credentials detected/);
  await respond({ "opencode auth list": { code: 1, stderr: "service unavailable" } });
  assert.match((await opencode.detect()).note ?? "", /Couldn't check saved credentials/);
});

test("OpenCode preserves routed model IDs and their upstream names", async () => {
  await respond({ "opencode models": { stdout: "opencode/beam-free\nopenrouter/anthropic/claude-sonnet-5.5\nvercel/openai/gpt-6.1-sol\nopenrouter/~anthropic/claude-latest\nNot a model\n" } });
  const models = await opencode.listModels();
  assert.equal(models.length, 4);
  assert.equal(models[1].ref, "opencode:openrouter/anthropic/claude-sonnet-5.5");
  assert.match(models[1].label, /^anthropic\/claude sonnet 5.5/);
});

test("OpenCode auth recovery targets the connected provider and isolates other integrations", () => {
  clearAuthFailures();
  const message = recordAuthFailure("opencode", "anthropic/claude-sonnet-5.5", "Authentication required");
  assert.match(message, /reconnect the provider used by this model/);
  assert.doesNotMatch(message, /Create a new key/);
  assert.ok(authFailure("opencode", "anthropic/claude-opus-5.5"));
  assert.equal(authFailure("opencode", "google/gemini-pro"), undefined);
  clearAuthFailures();
});

test("OpenCode generation uses flags supported by the installed CLI", async () => {
  await respond({
    "opencode run --format json --thinking --agent build -m opencode/beam-free": {
      stdout: JSON.stringify({ type: "text", part: { text: "<html>Test</html>" } }) + "\n",
    },
  });
  const events = [];
  for await (const event of opencode.stream({ model: "opencode/beam-free", system: "Test", prompt: "Test", images: [], effort: "low" }, new AbortController().signal)) {
    events.push(event);
  }
  assert.deepEqual(events, [{ type: "delta", text: "<html>Test</html>" }]);
});

test("OpenCode preserves current, legacy, and string provider errors", async () => {
  for (const error of [
    { type: "provider.invalid-request", message: "This model models/gemini-2.5-pro is no longer available to new users.", status: 404 },
    { type: "provider.rate-limit", message: "Your prepayment credits are depleted.", status: 429 },
    { name: "APIError", data: { message: "API key expired." } },
    "Authentication required.",
  ]) {
    await respond({
      "opencode run --format json --thinking --agent build -m google/gemini-2.5-pro": {
        stdout: JSON.stringify({ type: "error", error }) + "\n",
        code: 1,
      },
    });
    const events = [];
    for await (const event of opencode.stream({ model: "google/gemini-2.5-pro", system: "Test", prompt: "Test", images: [], effort: "low" }, new AbortController().signal)) {
      events.push(event);
    }
    const message = typeof error === "string" ? error : "message" in error ? error.message : error.data.message;
    assert.deepEqual(events, [{ type: "error", message: `OpenCode: ${message}` }]);
  }
});

test("Retired models are disabled individually without invalidating their provider login", () => {
  clearAuthFailures();
  clearModelFailures();
  const message = "OpenCode: This model models/gemini-2.5-pro is no longer available to new users.";
  assert.equal(isAuthError(message), false);
  assert.equal(isModelUnavailableError(message), true);
  assert.equal(isModelUnavailableError("Your prepayment credits are depleted."), false);
  assert.match(recordModelFailure("opencode", "google/gemini-2.5-pro", message), /Choose another model/);
  assert.ok(modelFailure("opencode", "google/gemini-2.5-pro"));
  assert.equal(modelFailure("opencode", "google/gemini-3.1-pro-preview"), undefined);
  assert.equal(authFailure("opencode", "google/gemini-2.5-pro"), undefined);
  clearModelFailures();
  assert.equal(modelFailure("opencode", "google/gemini-2.5-pro"), undefined);
});
