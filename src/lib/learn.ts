import { num, parseMarkdownFile, slugOf, str } from "./content";

export interface LearnPage {
  slug: string;
  title: string;
  description: string;
  group: string;
  order: number;
  icon: string;
  body: string;
}

export const LEARN_GROUPS = ["Getting started", "Prompting", "Reference"];

const learnFiles = import.meta.glob("/content/learn/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export const LEARN_PAGES: LearnPage[] = Object.entries(learnFiles)
  .map(([file, raw]) => {
    const { meta, body } = parseMarkdownFile(raw);
    return {
      slug: slugOf(file),
      title: str(meta.title, slugOf(file)),
      description: str(meta.description),
      group: str(meta.group, "Getting started"),
      order: num(meta.order),
      icon: str(meta.icon, "book-open"),
      body,
    };
  })
  .sort((a, b) => LEARN_GROUPS.indexOf(a.group) - LEARN_GROUPS.indexOf(b.group) || a.order - b.order);
