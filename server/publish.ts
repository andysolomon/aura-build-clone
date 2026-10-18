import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DIR = path.resolve("data/published");
const SLUG = /^[a-z0-9-]{3,64}$/;

interface PublishedPage {
  slug: string;
  title: string;
  html: string;
  updatedAt: string;
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base || "page"}-${randomBytes(3).toString("hex")}`;
}

/** Re-publishing with an existing slug overwrites that page, so share links stay stable. */
export async function publishPage(html: string, title: string, slug?: string): Promise<string> {
  const finalSlug = slug && SLUG.test(slug) ? slug : slugify(title);
  await mkdir(DIR, { recursive: true });
  const page: PublishedPage = { slug: finalSlug, title, html, updatedAt: new Date().toISOString() };
  await writeFile(path.join(DIR, `${finalSlug}.json`), JSON.stringify(page));
  return finalSlug;
}

export async function loadPublished(slug: string): Promise<PublishedPage | null> {
  if (!SLUG.test(slug)) return null;
  try {
    return JSON.parse(await readFile(path.join(DIR, `${slug}.json`), "utf8")) as PublishedPage;
  } catch {
    return null;
  }
}
