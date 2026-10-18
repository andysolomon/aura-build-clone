import { ArrowRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { DESIGN_SYSTEMS, type DesignSystem } from "../../shared/design-systems";
import { Button } from "../components/ui";

function toMarkdown(ds: DesignSystem): string {
  const t = ds.tokens;
  return `# ${ds.name}\n\n> ${ds.tagline}\n\n## Tokens\n- Mode: ${t.dark ? "dark" : "light"}\n- Background: ${t.bg}\n- Surface: ${t.surface}\n- Text: ${t.text}\n- Muted: ${t.muted}\n- Accent: ${t.accent}\n- Radius: ${t.radius}\n- Display font: ${t.displayFont}\n- Body font: ${t.bodyFont}\n\n## Guidance\n${ds.guidance}\n`;
}

function SystemCard({ ds }: { ds: DesignSystem }) {
  const [copied, setCopied] = useState(false);
  const t = ds.tokens;
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="relative h-44 overflow-hidden p-6" style={{ background: t.bg, color: t.text }}>
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${t.displayFont.replace(/ /g, "+")}&display=swap`} />
        <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: t.muted }}>{ds.name}</div>
        <div className="mt-3 text-4xl leading-none" style={{ fontFamily: `'${t.displayFont}'` }}>Aa Bb Cc</div>
        <div className="mt-5 flex items-center gap-2">
          <span className="px-4 py-2 text-xs font-medium" style={{ background: t.accent, color: t.accentText, borderRadius: `calc(${t.radius} * .6)` }}>Get started</span>
          <span className="border px-4 py-2 text-xs" style={{ borderColor: t.border, borderRadius: `calc(${t.radius} * .6)`, background: t.surface }}>Learn more</span>
        </div>
        <div className="absolute bottom-0 right-0 flex">
          {ds.swatches.map((c) => <span key={c} className="h-10 w-10" style={{ background: c }} />)}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-medium">{ds.name}</h2>
        <p className="text-sm text-muted">{ds.tagline}</p>
        <pre className="mt-4 flex-1 whitespace-pre-wrap rounded-xl bg-subtle p-3 font-mono text-[11.5px] leading-relaxed text-muted">{ds.guidance}</pre>
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(toMarkdown(ds));
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} DESIGN.md
          </Button>
          <Link to={`/?ds=${ds.id}`} className="ml-auto">
            <Button size="sm" variant="primary">Use system <ArrowRight className="h-3.5 w-3.5" /></Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function DesignSystemsPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-10 pt-20">
      <p className="text-[12px] uppercase tracking-wide text-muted">DESIGN.md systems</p>
      <h1 className="mt-3 max-w-3xl text-[clamp(2.2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.035em]">Give every generation a consistent visual language</h1>
      <p className="mt-4 max-w-2xl text-muted">
        A design system is a short DESIGN.md brief with palette, typography and component rules. Attach one in the composer and
        the model treats it as binding for every page and edit.
      </p>
      <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DESIGN_SYSTEMS.map((ds) => <SystemCard key={ds.id} ds={ds} />)}
      </div>
    </div>
  );
}
