import { ArrowLeft, Download, ExternalLink, Eye, Shuffle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { DEVICE_WIDTH, DeviceToggle, type Device } from "../components/DeviceToggle";
import { Avatar, TemplateCard } from "../components/TemplateCard";
import { Badge, Button, Spinner } from "../components/ui";
import { TEMPLATES, fetchTemplateHtml, findTemplate, templateHtmlUrl } from "../data/templates";
import { createProjectFromHtml } from "../lib/projects";
import { compactNumber, downloadFile } from "../lib/util";
import { NotFoundPage } from "./NotFoundPage";

export function TemplateDetailPage() {
  const { slug } = useParams();
  const template = findTemplate(slug);
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device>("desktop");
  const [remixing, setRemixing] = useState(false);

  if (!template) return <NotFoundPage />;

  async function remix() {
    if (!template) return;
    setRemixing(true);
    try {
      const html = await fetchTemplateHtml(template.slug);
      const id = await createProjectFromHtml(
        `${template.title.split(" — ")[0]} remix`,
        html,
        `Remixed “${template.title}”. Describe what you'd like to change, or switch to Design mode to edit text and styles directly.`,
      );
      navigate(`/build/${id}`);
    } catch {
      setRemixing(false);
    }
  }

  async function download() {
    if (!template) return;
    downloadFile(`${template.slug}.html`, await fetchTemplateHtml(template.slug));
  }

  const width = DEVICE_WIDTH[device];
  const more = TEMPLATES.filter((t) => t.slug !== template.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-[1360px] px-6 pb-10 pt-10">
      <Link to="/templates" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-3.5 w-3.5" /> All templates
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone={template.tier === "pro" ? "pro" : "neutral"}>{template.tier}</Badge>
            <span className="text-sm text-muted">{template.category}</span>
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">{template.title}</h1>
          <p className="mt-2 max-w-2xl text-muted">{template.description}</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-2">
              <Avatar name={template.author} className="h-6 w-6 text-[10px]" />
              {template.author}
            </span>
            <span className="flex items-center gap-1"><Shuffle className="h-3.5 w-3.5" /> {compactNumber(template.remixes)} remixes</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {compactNumber(template.views)} views</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={download}><Download className="h-4 w-4" /> HTML</Button>
          <a href={templateHtmlUrl(template.slug)} target="_blank" rel="noreferrer">
            <Button><ExternalLink className="h-4 w-4" /> Live preview</Button>
          </a>
          <Button variant="primary" onClick={remix} disabled={remixing}>
            {remixing ? <Spinner /> : <Shuffle className="h-4 w-4" />} Remix in editor
          </Button>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-line bg-panel p-3 shadow-composer">
        <div className="flex items-center justify-between px-2 pb-3">
          <div className="flex gap-1.5">
            {["bg-red-400/80", "bg-amber-400/80", "bg-emerald-400/80"].map((c) => <span key={c} className={`h-2.5 w-2.5 rounded-full ${c}`} />)}
          </div>
          <DeviceToggle value={device} onChange={setDevice} />
          <span className="w-12" />
        </div>
        <div className="flex justify-center overflow-hidden rounded-2xl border border-line bg-subtle">
          <iframe
            title={template.title}
            src={templateHtmlUrl(template.slug)}
            sandbox="allow-scripts"
            className="h-[78vh] border-0 bg-white transition-[width] duration-300"
            style={{ width: width ?? "100%" }}
          />
        </div>
      </div>

      <h2 className="mt-16 text-lg font-medium">More templates</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {more.map((t) => <TemplateCard key={t.slug} template={t} />)}
      </div>
    </div>
  );
}
