import type { Project, ProjectSummary } from "../../shared/project";
import type { AppConfig, GenerateRequest, PublishResponse, StreamEvent } from "../../shared/protocol";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export const api = {
  config: (refresh = false) => fetch(`/api/config${refresh ? "?refresh=1" : ""}`).then((r) => json<AppConfig>(r)),
  listProjects: () => fetch("/api/projects").then((r) => json<ProjectSummary[]>(r)),
  getProject: (id: string) => fetch(`/api/projects/${id}`).then((r) => json<Project>(r)),
  saveProject: (project: Project) =>
    fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(project),
    }).then((r) => json<{ ok: true }>(r)),
  deleteProject: (id: string) => fetch(`/api/projects/${id}`, { method: "DELETE" }).then((r) => json<{ ok: true }>(r)),
  enhance: (prompt: string, model: string) =>
    fetch("/api/enhance", {
      method: "POST",
      signal: AbortSignal.timeout(150_000),
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, model }),
    }).then((r) => json<{ prompt: string }>(r)),
  enhanceTool: (body: { prompt: string; model: string; projectType: string; outputStyle: string }) =>
    fetch("/api/enhance/tool", {
      method: "POST",
      signal: AbortSignal.timeout(150_000),
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => json<{ prompt: string; short: string; notes: string[] }>(r)),
  publish: (html: string, title: string, slug?: string) =>
    fetch("/api/publish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ html, title, slug }),
    }).then((r) => json<PublishResponse>(r)),
};

/** Streams server-sent generation events. Resolves when the stream ends. */
export async function streamGenerate(
  req: GenerateRequest,
  onEvent: (event: StreamEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
    signal,
  });
  if (!res.ok || !res.body) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Generation failed (${res.status})`);
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const data = chunk
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (data) onEvent(JSON.parse(data) as StreamEvent);
    }
  }
}
