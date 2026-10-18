import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { ProjectSummary } from "../../shared/project";
import { ProjectThumb } from "../components/ProjectThumb";
import { Button, Spinner } from "../components/ui";
import { api } from "../lib/api";
import { timeAgo } from "../lib/util";

export function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);

  useEffect(() => {
    api.listProjects().then(setProjects, () => setProjects([]));
  }, []);

  async function remove(project: ProjectSummary) {
    if (!confirm(`Delete “${project.title}”? This can't be undone.`)) return;
    await api.deleteProject(project.id);
    setProjects((list) => list?.filter((p) => p.id !== project.id) ?? null);
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-10 pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.03em]">Projects</h1>
          <p className="mt-2 text-muted">Every page you've generated or remixed, with its full version history.</p>
        </div>
        <Link to="/">
          <Button variant="primary"><Plus className="h-4 w-4" /> New project</Button>
        </Link>
      </div>

      {projects === null ? (
        <div className="grid h-60 place-items-center text-muted"><Spinner /></div>
      ) : projects.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-line py-24 text-center">
          <FolderOpen className="h-8 w-8 text-faint" />
          <p className="mt-4 font-medium">No projects yet</p>
          <p className="mt-1 text-sm text-muted">Describe a page on the Create screen, or remix a template.</p>
          <div className="mt-6 flex gap-2">
            <Link to="/"><Button variant="primary">Create a page</Button></Link>
            <Link to="/templates"><Button>Browse templates</Button></Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="group relative rounded-2xl border border-line bg-panel p-1.5 transition hover:shadow-composer">
              <Link to={`/build/${p.id}`} className="block">
                {p.hasPage ? <ProjectThumb projectId={p.id} updatedAt={p.updatedAt} /> : <div className="grid aspect-[16/10] place-items-center rounded-xl bg-subtle text-sm text-faint">Not generated yet</div>}
                <div className="px-2 pb-1.5 pt-3">
                  <div className="truncate text-[13px] font-medium">{p.title}</div>
                  <div className="mt-1 text-[11.5px] text-muted">
                    {p.versionCount} version{p.versionCount === 1 ? "" : "s"} · edited {timeAgo(p.updatedAt)}
                  </div>
                </div>
              </Link>
              <button
                onClick={() => remove(p)}
                className="absolute right-3 top-3 hidden h-8 w-8 place-items-center rounded-lg border border-line bg-panel text-muted hover:text-red-500 group-hover:grid"
                aria-label="Delete project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
