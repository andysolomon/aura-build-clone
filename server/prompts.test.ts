import assert from "node:assert/strict";
import test from "node:test";
import type { GenerateRequest } from "../shared/protocol";
import { renderRequest } from "./prompts";

const brief: GenerateRequest = { prompt: "A landing page for a bakery", model: "demo:demo" };
const hasDefault = (req: GenerateRequest) => renderRequest(req).includes("<default_aesthetic>");

test("adds the default aesthetic to a new page with no visual direction", () => {
  assert.equal(hasDefault(brief), true);
  assert.equal(hasDefault({ ...brief, designSystemId: "no-such-system" }), true);
});

test("leaves it out once anything steers the look", () => {
  assert.equal(hasDefault({ ...brief, designSystemId: "mono-minimal" }), false);
  assert.equal(hasDefault({ ...brief, references: [{ title: "Ref", html: "<html></html>" }] }), false);
  assert.equal(hasDefault({ ...brief, images: ["data:image/png;base64,AA=="] }), false);
  assert.equal(hasDefault({ ...brief, screenshots: [{ url: "/captures/a.png", label: "Desktop", source: "example.com", width: 1440, height: 900 }] }), false);
  assert.equal(hasDefault({ ...brief, html: "<html></html>" }), false);
});
