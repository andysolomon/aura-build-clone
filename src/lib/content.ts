import { useEffect, useState } from "react";

// Markdown content shipped with the app: Learn docs and agent skills (content/*), plus the
// JSON indexes for the Components and Assets libraries (public/*/index.json).

type Frontmatter = Record<string, string | number | string[]>;

function parseValue(raw: string): string | number | string[] {
  const value = raw.trim();
  if (/^\[.*\]$/.test(value)) {
    return value
      .slice(1, -1)
      .split(",")
      .map((v) => v.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value.replace(/^["']|["']$/g, "");
}

export function parseMarkdownFile(raw: string): { meta: Frontmatter; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { meta: {}, body: raw };
  const meta: Frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*?)(\s+#.*)?$/.exec(line);
    if (kv) meta[kv[1]] = parseValue(kv[2]);
  }
  return { meta, body: raw.slice(match[0].length) };
}

export const slugOf = (filePath: string) => filePath.split("/").pop()!.replace(/\.md$/, "");
export const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : v === undefined ? fallback : String(v));
export const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

// ---------- Components & Assets (fetched JSON indexes) ----------

export interface ComponentEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  tier: "free" | "pro";
  tags: string[];
  background: "light" | "dark" | "transparent";
}

export interface AssetEntry {
  slug: string;
  title: string;
  category: string;
  palette: string;
  ratio: string;
  width: number;
  height: number;
  dark: boolean;
}

const jsonCache = new Map<string, Promise<unknown>>();

export function loadJson<T>(url: string): Promise<T> {
  if (!jsonCache.has(url)) {
    jsonCache.set(url, fetch(url).then((r) => (r.ok ? r.json() : [])).catch(() => []));
  }
  return jsonCache.get(url) as Promise<T>;
}

export function useJson<T>(url: string, fallback: T): T {
  const [data, setData] = useState<T>(fallback);
  useEffect(() => {
    let alive = true;
    void loadJson<T>(url).then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [url]);
  return data;
}

export const componentHtmlUrl = (slug: string) => `/components/${slug}.html`;
export const componentThumbUrl = (slug: string) => `/components/thumbs/${slug}.jpg`;
export const assetUrl = (slug: string) => `/assets/${slug}.svg`;

/** Stable pseudo-stats for library cards, derived from the slug. */
export function pseudoStats(slug: string): { views: number; remixes: number; author: string } {
  let h = 2166136261;
  for (const ch of slug) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const n = Math.abs(h);
  const authors = ["Iris Calder", "Theo Vance", "Mara Ellison", "Jonas Weber", "Naomi Sato", "Leo Martins", "Aisha Thomas"];
  return { views: 400 + (n % 9600), remixes: 20 + ((n >> 8) % 480), author: authors[n % authors.length] };
}
