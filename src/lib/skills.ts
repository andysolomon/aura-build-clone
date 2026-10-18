import { num, parseMarkdownFile, slugOf, str } from "./content";

export interface Skill {
  slug: string;
  name: string;
  description: string;
  author: string;
  source: string;
  tags: string[];
  views: number;
  uses: number;
  body: string;
}

const skillFiles = import.meta.glob("/content/skills/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export const SKILLS: Skill[] = Object.entries(skillFiles)
  .map(([file, raw]) => {
    const { meta, body } = parseMarkdownFile(raw);
    return {
      slug: slugOf(file),
      name: str(meta.name, slugOf(file)),
      description: str(meta.description),
      author: str(meta.author, "Aura Clone"),
      source: str(meta.source),
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      views: num(meta.views),
      uses: num(meta.uses),
      body: body.trim(),
    };
  })
  .sort((a, b) => b.views - a.views);

export function findSkill(slug: string | undefined): Skill | undefined {
  return SKILLS.find((s) => s.slug === slug);
}
