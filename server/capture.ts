import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Browser } from "playwright";
import type { Capture } from "../shared/protocol";

// Website screenshots for "Import website URL": captured with a local Chromium, stored in
// data/captures and served at /captures/<file>, so generated pages can embed the real app.

const DIR = path.resolve("data/captures");
const FILE = /^[a-f0-9]{12}-(desktop|mobile)\.jpg$/;
const VIEWPORTS = [
  { label: "desktop", width: 1440, height: 900, mobile: false },
  { label: "mobile", width: 390, height: 844, mobile: true },
] as const;

const CHROMIUM_CANDIDATES = [process.env.CHROMIUM_PATH, "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"];

let browser: Promise<Browser> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | undefined;

function getBrowser(): Promise<Browser> {
  clearTimeout(idleTimer);
  browser ??= chromium.launch({ executablePath: CHROMIUM_CANDIDATES.find((p) => p && existsSync(p)) }).catch((err) => {
    browser = null;
    throw err;
  });
  return browser;
}

/** Closes the shared browser after a minute without captures. */
function scheduleClose() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    const current = browser;
    browser = null;
    void current?.then((b) => b.close()).catch(() => {});
  }, 60_000);
  idleTimer.unref();
}

export function parseCaptureUrl(raw: string): URL | null {
  try {
    const url = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export async function captureSite(url: URL): Promise<Capture> {
  await mkdir(DIR, { recursive: true });
  const id = randomBytes(6).toString("hex");
  const b = await getBrowser();
  let title = url.hostname;
  const shots: Capture["shots"] = [];
  try {
    for (const vp of VIEWPORTS) {
      const context = await b.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.mobile ? 2 : 1,
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
      });
      try {
        const page = await context.newPage();
        // Pages that never go network-idle (analytics, sockets) still get captured after the timeout.
        await page.goto(url.href, { waitUntil: "networkidle", timeout: 20_000 }).catch(async (err: Error) => {
          if (!/timeout/i.test(err.message)) throw err;
        });
        await page.waitForTimeout(1200);
        if (vp.label === "desktop") title = (await page.title()) || title;
        const file = `${id}-${vp.label}.jpg`;
        await page.screenshot({ path: path.join(DIR, file), type: "jpeg", quality: 82 });
        shots.push({ label: vp.label, path: `/captures/${file}`, width: vp.width, height: vp.height });
      } finally {
        await context.close();
      }
    }
  } finally {
    scheduleClose();
  }
  return { id, source: url.href, title, shots };
}

export async function readCapture(file: string): Promise<Buffer | null> {
  if (!FILE.test(file)) return null;
  try {
    return await readFile(path.join(DIR, file));
  } catch {
    return null;
  }
}
