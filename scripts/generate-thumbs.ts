// Renders library thumbnails with Playwright's Chromium: templates at 1440×900 and components at
// 1280×800, written as JPEGs to public/<library>/thumbs/<slug>.jpg. Components with a transparent
// page are shot on the same light-gray backdrop the library cards use.
//
//   npm run thumbs                          # every template and component
//   npm run thumbs -- lumen-ai button-x     # only these slugs
import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(import.meta.dirname, "..");
const LIBRARIES = [
  { dir: "public/templates", viewport: { width: 1440, height: 900 } },
  { dir: "public/components", viewport: { width: 1280, height: 800 } },
];
const only = new Set(process.argv.slice(2));

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
let rendered = 0;
try {
  for (const { dir, viewport } of LIBRARIES) {
    const slugs = readdirSync(path.join(ROOT, dir))
      .filter((f) => f.endsWith(".html"))
      .map((f) => f.slice(0, -".html".length))
      .filter((slug) => only.size === 0 || only.has(slug));
    if (slugs.length === 0) continue;

    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    for (const slug of slugs) {
      const url = pathToFileURL(path.join(ROOT, dir, `${slug}.html`)).href;
      // CDN scripts and fonts occasionally keep the network busy; render whatever has loaded.
      await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 }).catch(() => {});
      await page.evaluate("document.fonts.ready");
      await page.waitForTimeout(1800); // let entrance animations settle
      // Strings, not functions: tsx's keepNames helpers don't exist inside the page.
      await page.evaluate(`(() => {
        const clear = (el) => {
          const style = getComputedStyle(el);
          return style.backgroundColor === "rgba(0, 0, 0, 0)" && style.backgroundImage === "none";
        };
        if (clear(document.documentElement) && clear(document.body)) document.documentElement.style.background = "#f4f4f4";
      })()`);
      const out = path.join(ROOT, dir, "thumbs", `${slug}.jpg`);
      await page.screenshot({ path: out, type: "jpeg", quality: 85 });
      console.log(`✓ ${path.relative(ROOT, out)}`);
      rendered++;
    }
    await page.close();
  }
} finally {
  await browser.close();
}
if (only.size > 0 && rendered < only.size) console.warn(`Rendered ${rendered} of ${only.size} requested slugs; check the names.`);
