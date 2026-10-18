import { Eye, Shuffle } from "lucide-react";
import { Link } from "react-router";
import { templateThumbUrl, type Template } from "../data/templates";
import { compactNumber } from "../lib/util";
import { Badge } from "./ui";

export function Avatar({ name, className = "h-5 w-5 text-[9px]" }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold text-white ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 45%), hsl(${(hue + 40) % 360} 60% 35%))` }}
    >
      {initials}
    </span>
  );
}

export function TemplateCard({ template }: { template: Template }) {
  return (
    <Link
      to={`/templates/${template.slug}`}
      className="group block rounded-2xl border border-line bg-panel p-1.5 transition hover:-translate-y-0.5 hover:shadow-composer"
    >
      <div className="overflow-hidden rounded-xl border border-line-soft bg-subtle">
        <img
          src={templateThumbUrl(template.slug)}
          alt={template.title}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="px-2 pb-1.5 pt-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate text-[13px] font-medium">{template.title}</h3>
          <Badge tone={template.tier === "pro" ? "pro" : "neutral"}>{template.tier === "pro" ? "Pro" : "Free"}</Badge>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11.5px] text-muted">
          <span className="flex min-w-0 items-center gap-1.5">
            <Avatar name={template.author} />
            <span className="truncate">{template.author}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2.5">
            <span className="flex items-center gap-1">
              <Shuffle className="h-3 w-3" />
              {compactNumber(template.remixes)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {compactNumber(template.views)}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
