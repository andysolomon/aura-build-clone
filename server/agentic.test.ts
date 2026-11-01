import assert from "node:assert/strict";
import test from "node:test";
import { AGENTIC_SKILL_NAME, isAgenticBrief, withAgenticSkill } from "./agentic";
import { applyAgentEdit, initialAgentSpec, readAgentSpec, renderAgentDemo } from "./demo-agent";
import { renderRequest } from "./prompts";

test("detects agent interface briefs", () => {
  for (const brief of [
    "Build a chatbot for my bakery",
    "An agentic research dashboard",
    "AI agent platform landing page",
    "customer support copilot",
    "A chat interface with tool calls",
    "Build a working agent interface: Chat Thread",
    "Agent part: Tool Calls (collapsible tool cards)",
  ]) {
    assert.equal(isAgenticBrief(brief), true, brief);
  }
});

test("ignores briefs that only mention human agents or agencies", () => {
  for (const brief of ["Landing page for a real estate agent in Austin", "Travel agency site", "A coffee shop with a chat with the owner section", "Insurance agents directory"]) {
    assert.equal(isAgenticBrief(brief), false, brief);
  }
});

test("attaches the skill once, ahead of the user's skills", () => {
  const { req, attached } = withAgenticSkill({ prompt: "Build a chatbot", model: "demo:demo", skills: [{ name: "Motion", instructions: "x" }] });
  assert.equal(attached, true);
  assert.deepEqual(req.skills?.map((s) => s.name), [AGENTIC_SKILL_NAME, "Motion"]);
  assert.match(renderRequest(req), /<skill name="Agentic interfaces">/);
  assert.equal(withAgenticSkill(req).attached, false);
});

test("leaves other briefs alone, but keeps the skill for edits of agent pages", () => {
  assert.equal(withAgenticSkill({ prompt: "A landing page for a bakery", model: "demo:demo" }).attached, false);
  assert.equal(withAgenticSkill({ prompt: "Make the header smaller", model: "demo:demo", html: '<div role="log"></div>' }).attached, true);
  assert.equal(withAgenticSkill({ prompt: "Make the header smaller", model: "demo:demo", html: "<div></div>" }).attached, false);
});

test("the skill fits the request's per-skill limit", () => {
  const { req } = withAgenticSkill({ prompt: "Build a chatbot", model: "demo:demo" });
  const instructions = req.skills?.[0]?.instructions ?? "";
  assert.ok(instructions.length > 1000 && instructions.length <= 8000, `${instructions.length} chars`);
  assert.doesNotMatch(instructions, /^---/);
});

test("the demo agent round-trips its spec and applies structured edits", () => {
  const spec = initialAgentSpec("A coding agent IDE chat app", { brand: "Anvil" });
  assert.equal(spec.domain, "coding");
  const html = renderAgentDemo(spec);
  assert.match(html, /role="log"/);
  assert.match(html, /<title>Anvil/);
  const read = readAgentSpec(html);
  assert.deepEqual(read, spec);
  const notes = applyAgentEdit(read!, "make it dark", undefined);
  assert.equal(read!.dark, true);
  assert.deepEqual(notes, ["switched to a dark theme"]);
  applyAgentEdit(read!, "use a blue accent", "#3b82f6");
  assert.equal(read!.accent, "#3b82f6");
  applyAgentEdit(read!, "rename it to Atlas", undefined);
  assert.equal(read!.brand, "Atlas");
  assert.match(renderAgentDemo(read!), /--accent:#3b82f6/);
});

test("the demo agent escapes brand names and keeps them in its spec", () => {
  const spec = { ...initialAgentSpec("a chatbot", {}), brand: `--></script><b>"x"` };
  const html = renderAgentDemo(spec);
  assert.ok(!html.includes("--></script>"), "brand must not end the comment or a script");
  assert.ok(!html.includes("<b>&quot;") && !html.includes('<b>"x"'), "brand must not become markup");
  assert.deepEqual(readAgentSpec(html), spec);
});
