import { marked } from "marked";

export function slugifyHeading(text: string): string {
  return text.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

/** Renders Markdown to HTML with stable ids on h2/h3 for the table of contents. */
export function renderMarkdown(body: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const inner = marked.Parser.parseInline(tokens);
    const text = inner.replace(/<[^>]+>/g, "");
    const id = slugifyHeading(text);
    if (depth === 2 || depth === 3) headings.push({ id, text, level: depth });
    return `<h${depth} id="${id}">${inner}</h${depth}>`;
  };
  const html = marked.parse(body, { renderer, async: false }) as string;
  return { html, headings };
}
