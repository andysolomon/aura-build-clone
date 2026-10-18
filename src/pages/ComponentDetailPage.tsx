import { ArrowLeft, AtSign, Check, Copy, Download, Eye, Shuffle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { CodeBlock } from "../components/CodeBlock";
import { DEVICE_WIDTH, DeviceToggle, type Device } from "../components/DeviceToggle";
import { Avatar } from "../components/TemplateCard";
import { Badge, Button, Spinner } from "../components/ui";
import { componentHtmlUrl, pseudoStats, useJson, type ComponentEntry } from "../lib/content";
import { setPrefill } from "../lib/prefill";
import { createProjectFromHtml } from "../lib/projects";
import { componentRef } from "../lib/references";
import { compactNumber, cx, downloadFile } from "../lib/util";
import { ComponentCard } from "./ComponentsPage";

export function ComponentDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const components = useJson<ComponentEntry[]>("/components/index.json", []);
  const component = components.find((c) => c.slug === slug);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [backdrop, setBackdrop] = useState<"white" | "black">("white");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [remixing, setRemixing] = useState(false);

  useEffect(() => {
    setCode("");
    fetch(componentHtmlUrl(slug)).then((r) => (r.ok ? r.text() : "")).then(setCode, () => setCode(""));
  }, [slug]);

  useEffect(() => {
    if (component?.background === "dark") setBackdrop("black");
    else setBackdrop("white");
  }, [component?.background]);

  if (components.length === 0) return <div className="grid h-[60vh] place-items-center text-muted"><Spinner /></div>;
  if (!component) {
    return (
      <div className="grid h-[60vh] place-items-center text-center">
        <div>
          <p className="text-lg font-medium">Component not found</p>
          <Link to="/components" className="mt-3 inline-block text-sm text-accent">Browse components</Link>
        </div>
      </div>
    );
  }

  const stats = pseudoStats(component.slug);
  const related = components.filter((c) => c.category === component.category && c.slug !== component.slug).slice(0, 4);
  const width = DEVICE_WIDTH[device];

  async function remix() {
    if (!component || !code) return;
    setRemixing(true);
    try {
      const id = await createProjectFromHtml(`${component.title} remix`, code, `Remixed the “${component.title}” component. Ask for changes, or open Design mode to edit it directly.`);
      navigate(`/build/${id}`);
    } catch {
      setRemixing(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1360px] px-6 pb-10 pt-10">
      <Link to="/components" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-3.5 w-3.5" /> All components
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone={component.tier === "pro" ? "pro" : "neutral"}>{component.tier}</Badge>
            <Link to={`/components?category=${component.category}`} className="text-sm text-muted hover:text-fg">{component.category}</Link>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{component.title}</h1>
          <p className="mt-2 max-w-2xl text-muted">{component.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={async () => {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            disabled={!code}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy code
          </Button>
          <Button onClick={() => downloadFile(`${component.slug}.html`, code)} disabled={!code}><Download className="h-4 w-4" /> HTML</Button>
          <Button
            onClick={() => {
              setPrefill({ references: [componentRef(component.slug)] });
              navigate("/");
            }}
          >
            <AtSign className="h-4 w-4" /> Use in prompt
          </Button>
          <Button variant="primary" onClick={remix} disabled={!code || remixing}>
            {remixing ? <Spinner /> : <Shuffle className="h-4 w-4" />} Remix
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 rounded-3xl border border-line bg-panel p-3 shadow-composer">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-3">
            <div className="inline-flex rounded-lg border border-line bg-subtle/70 p-0.5">
              {(["preview", "code"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)} className={cx("h-6 rounded-md px-3 text-[12.5px] capitalize", tab === t ? "bg-panel text-fg shadow-sm" : "text-muted")}>
                  {t}
                </button>
              ))}
            </div>
            {tab === "preview" && (
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-line bg-subtle/70 p-0.5">
                  {(["white", "black"] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      title={`${b === "white" ? "White" : "Black"} background`}
                      onClick={() => setBackdrop(b)}
                      className={cx("grid h-6 w-7 place-items-center rounded-md", backdrop === b && "bg-panel shadow-sm")}
                    >
                      <span className={cx("h-3 w-3 rounded-full border border-line", b === "white" ? "bg-white" : "bg-black")} />
                    </button>
                  ))}
                </div>
                <DeviceToggle value={device} onChange={setDevice} />
              </div>
            )}
          </div>
          {tab === "preview" ? (
            <div className={cx("flex justify-center overflow-hidden rounded-2xl border border-line", backdrop === "black" ? "bg-black" : "bg-white")}>
              <iframe
                title={component.title}
                src={componentHtmlUrl(component.slug)}
                sandbox="allow-scripts"
                className="h-[70vh] border-0 transition-[width] duration-300"
                style={{ width: width ?? "100%", background: "transparent", colorScheme: "normal" }}
              />
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-auto rounded-2xl border border-line bg-canvas">
              {code ? <CodeBlock code={code} /> : <div className="grid h-40 place-items-center text-muted"><Spinner /></div>}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-panel p-5 text-sm">
          <h2 className="text-[12px] font-medium uppercase tracking-wide text-faint">About</h2>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between"><dt className="text-muted">Category</dt><dd>{component.category}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Views</dt><dd className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-faint" />{compactNumber(stats.views)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Remixes</dt><dd className="flex items-center gap-1"><Shuffle className="h-3.5 w-3.5 text-faint" />{compactNumber(stats.remixes)}</dd></div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Creator</dt>
              <dd className="flex items-center gap-2"><Avatar name={stats.author} />{stats.author}</dd>
            </div>
          </dl>
          {component.tags.length > 0 && (
            <>
              <h2 className="mt-6 text-[12px] font-medium uppercase tracking-wide text-faint">Tags</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {component.tags.map((t) => <span key={t} className="rounded-md bg-subtle px-2 py-0.5 text-[12px] text-muted">{t}</span>)}
              </div>
            </>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <>
          <h2 className="mt-16 text-lg font-medium">Related components</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((c) => <ComponentCard key={c.slug} component={c} />)}
          </div>
        </>
      )}
    </div>
  );
}
