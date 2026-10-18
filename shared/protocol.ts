import type { ProviderInfo } from "./models";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ReferenceInput {
  title: string;
  html: string;
}

export interface GenerateRequest {
  prompt: string;
  /** Model ref, "<provider>:<model>". */
  model: string;
  designSystemId?: string | null;
  /** Current page HTML; when present the request is an edit of that page. */
  html?: string | null;
  /** When set, edits must be scoped to the element matching this CSS selector. */
  selection?: { selector: string; outerHTML: string } | null;
  history?: ChatTurn[];
  references?: ReferenceInput[];
  /** Agent skills referenced with @: instructions the model must follow. */
  skills?: { name: string; instructions: string }[];
  /** Data URLs of attached screenshots / inspiration images. */
  images?: string[];
}

export type StreamEvent =
  | { type: "status"; phase: "thinking" | "writing"; message: string }
  | { type: "reasoning"; text: string }
  | { type: "delta"; text: string }
  | { type: "done"; html: string; summary: string; model: string; demo: boolean }
  | { type: "error"; message: string };

export interface AppConfig {
  /** True when at least one real AI provider (not the demo) is usable. */
  aiEnabled: boolean;
  defaultModel: string;
  providers: ProviderInfo[];
}

export interface PublishResponse {
  slug: string;
  url: string;
}

const DOC_START = /<!doctype html|<html[\s>]/i;

/**
 * Generated output is `<summary>…</summary>` followed by a full HTML document.
 * Works on partial streams too, so the preview can render while text is still arriving.
 */
export function splitGeneration(raw: string): { summary: string; html: string } {
  const text = raw.replace(/```(?:html)?/gi, "");
  const match = DOC_START.exec(text);
  const head = match ? text.slice(0, match.index) : text;
  let html = match ? text.slice(match.index) : "";
  const end = html.search(/<\/html>/i);
  if (end !== -1) html = html.slice(0, end + "</html>".length);
  const summary = head
    .replace(/<\/?summary>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return { summary, html: html.trim() };
}
