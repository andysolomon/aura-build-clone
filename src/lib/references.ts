import { TEMPLATES, fetchTemplateHtml, findTemplate, templateThumbUrl } from "../data/templates";
import type { ReferenceInput } from "../../shared/protocol";
import { componentHtmlUrl, componentThumbUrl, loadJson, type ComponentEntry } from "./content";
import { findSkill } from "./skills";

// Composer references are strings: a bare template slug, or "component:<slug>".

export interface ReferenceItem {
  ref: string;
  kind: "template" | "component";
  title: string;
  subtitle: string;
  thumb: string;
}

export const MAX_REFERENCES = 2;
export const MAX_SKILLS = 4;
const MAX_REFERENCE_CHARS = 70_000;

export function componentRef(slug: string): string {
  return `component:${slug}`;
}

export function templateItems(): ReferenceItem[] {
  return TEMPLATES.map((t) => ({ ref: t.slug, kind: "template", title: t.title, subtitle: t.category, thumb: templateThumbUrl(t.slug) }));
}

export function componentItems(components: ComponentEntry[]): ReferenceItem[] {
  return components.map((c) => ({ ref: componentRef(c.slug), kind: "component", title: c.title, subtitle: c.category, thumb: componentThumbUrl(c.slug) }));
}

/** Fetches the HTML behind a reference so it can be sent to the model. */
export async function resolveReference(ref: string): Promise<ReferenceInput> {
  if (ref.startsWith("component:")) {
    const slug = ref.slice("component:".length);
    const index = await loadJson<ComponentEntry[]>("/components/index.json");
    const title = index.find((c) => c.slug === slug)?.title ?? slug;
    const res = await fetch(componentHtmlUrl(slug));
    return { title: `${title} (component)`, html: res.ok ? (await res.text()).slice(0, MAX_REFERENCE_CHARS) : "" };
  }
  return { title: findTemplate(ref)?.title ?? ref, html: (await fetchTemplateHtml(ref)).slice(0, MAX_REFERENCE_CHARS) };
}

/** Skill instructions for the generation request. */
export function resolveSkills(slugs: string[]): { name: string; instructions: string }[] {
  return slugs.flatMap((slug) => {
    const skill = findSkill(slug);
    return skill ? [{ name: skill.name, instructions: skill.body }] : [];
  });
}
