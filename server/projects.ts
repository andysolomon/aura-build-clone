import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Project, ProjectSummary } from "../shared/project";

const DIR = path.resolve("data/projects");
const ID = /^[a-zA-Z0-9_-]{6,64}$/;

function file(id: string): string {
  return path.join(DIR, `${id}.json`);
}

export function validProjectId(id: string): boolean {
  return ID.test(id);
}

export async function getProject(id: string): Promise<Project | null> {
  if (!validProjectId(id)) return null;
  try {
    return JSON.parse(await readFile(file(id), "utf8")) as Project;
  } catch {
    return null;
  }
}

export async function saveProject(project: Project): Promise<void> {
  await mkdir(DIR, { recursive: true });
  await writeFile(file(project.id), JSON.stringify(project));
}

export async function deleteProject(id: string): Promise<void> {
  if (validProjectId(id)) await rm(file(id), { force: true });
}

export function currentHtml(project: Project): string | null {
  return project.versions.find((v) => v.id === project.currentVersionId)?.html ?? null;
}

export async function listProjects(): Promise<ProjectSummary[]> {
  let names: string[] = [];
  try {
    names = await readdir(DIR);
  } catch {
    return [];
  }
  const projects = await Promise.all(
    names.filter((n) => n.endsWith(".json")).map((n) => getProject(n.slice(0, -".json".length))),
  );
  return projects
    .filter((p): p is Project => p !== null)
    .map((p) => ({
      id: p.id,
      title: p.title,
      updatedAt: p.updatedAt,
      versionCount: p.versions.length,
      hasPage: currentHtml(p) !== null,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
