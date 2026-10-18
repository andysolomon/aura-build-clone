import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { readFile } from "node:fs/promises";
import { parseModelRef } from "../shared/models";
import type { AppConfig, GenerateRequest, PublishResponse } from "../shared/protocol";
import { enhance, generate } from "./generate";
import { defaultModel, discoverProviders } from "./providers";
import { currentHtml, deleteProject, getProject, listProjects, saveProject, validProjectId } from "./projects";
import { loadPublished, publishPage } from "./publish";
import type { Project } from "../shared/project";

const app = new Hono();
const MAX_HTML_BYTES = 1_500_000;

async function config(force = false): Promise<AppConfig> {
  const providers = await discoverProviders(force);
  return {
    aiEnabled: providers.some((p) => p.available && p.id !== "demo"),
    defaultModel: defaultModel(providers),
    providers,
  };
}

// ?refresh=1 re-runs detection, e.g. after signing in to a CLI.
app.get("/api/config", async (c) => c.json(await config(c.req.query("refresh") === "1")));

app.post("/api/generate", async (c) => {
  const body = await c.req.json<Partial<GenerateRequest>>().catch(() => null);
  if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
    return c.json({ error: "A prompt is required." }, 400);
  }
  if (body.html && body.html.length > MAX_HTML_BYTES) {
    return c.json({ error: "The current page is too large to edit." }, 413);
  }
  const req: GenerateRequest = {
    prompt: body.prompt.trim(),
    model: typeof body.model === "string" && parseModelRef(body.model) ? body.model : (await config()).defaultModel,
    designSystemId: body.designSystemId ?? null,
    html: body.html ?? null,
    selection: body.selection ?? null,
    history: Array.isArray(body.history) ? body.history : [],
    references: Array.isArray(body.references) ? body.references.slice(0, 3) : [],
    images: Array.isArray(body.images) ? body.images.slice(0, 4) : [],
  };

  const controller = new AbortController();
  const events = generate(req, controller.signal);

  return streamSSE(c, async (stream) => {
    stream.onAbort(() => controller.abort());
    for await (const event of events) {
      if (stream.aborted) break;
      await stream.writeSSE({ data: JSON.stringify(event) });
    }
  });
});

app.post("/api/enhance", async (c) => {
  const body = await c.req.json<{ prompt?: string; model?: string }>().catch(() => null);
  const prompt = body?.prompt?.trim();
  if (!prompt) return c.json({ error: "A prompt is required." }, 400);
  try {
    return c.json({ prompt: await enhance(prompt, body?.model ?? (await config()).defaultModel) });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Enhance failed." }, 502);
  }
});

app.post("/api/publish", async (c) => {
  const body = await c.req.json<{ html?: string; title?: string; slug?: string }>().catch(() => null);
  if (!body?.html) return c.json({ error: "Nothing to publish." }, 400);
  if (body.html.length > MAX_HTML_BYTES) return c.json({ error: "Page is too large to publish." }, 413);
  const slug = await publishPage(body.html, body.title ?? "Untitled", body.slug);
  const origin = new URL(c.req.url).origin;
  return c.json<PublishResponse>({ slug, url: `${origin}/s/${slug}` });
});

app.get("/api/projects", async (c) => c.json(await listProjects()));

app.get("/api/projects/:id", async (c) => {
  const project = await getProject(c.req.param("id"));
  return project ? c.json(project) : c.json({ error: "Project not found." }, 404);
});

app.put("/api/projects/:id", async (c) => {
  const id = c.req.param("id");
  const project = await c.req.json<Project>().catch(() => null);
  if (!project || project.id !== id || !validProjectId(id)) return c.json({ error: "Invalid project." }, 400);
  await saveProject(project);
  return c.json({ ok: true });
});

app.delete("/api/projects/:id", async (c) => {
  await deleteProject(c.req.param("id"));
  return c.json({ ok: true });
});

// Rendered inside sandboxed iframes (no allow-same-origin) for project thumbnails.
app.get("/api/projects/:id/preview", async (c) => {
  const project = await getProject(c.req.param("id"));
  const html = project && currentHtml(project);
  return html ? c.html(html) : c.text("No page yet.", 404);
});

app.get("/s/:slug", async (c) => {
  const page = await loadPublished(c.req.param("slug"));
  if (!page) return c.text("This page has not been published.", 404);
  return c.html(page.html);
});

if (process.env.NODE_ENV === "production") {
  app.use("/*", serveStatic({ root: "./dist" }));
  const indexHtml = await readFile("./dist/index.html", "utf8");
  app.get("*", (c) => c.html(indexHtml));
}

const port = Number(process.env.API_PORT ?? 8787);
serve({ fetch: app.fetch, port, hostname: "127.0.0.1" }, (info) => {
  console.log(`API listening on http://127.0.0.1:${info.port}`);
  // Warm the provider cache so the first page load doesn't wait on CLI detection.
  void discoverProviders().then((providers) => {
    for (const p of providers) {
      console.log(`  ${p.available ? "✓" : "✗"} ${p.label}${p.available ? ` (${p.models.length} models)` : ""}${p.note ? ` - ${p.note}` : ""}`);
    }
  });
});
