// Hand-off from library pages (components, assets, skills, prompt enhancer) to the Create
// composer: stored in sessionStorage and consumed once by the home page.

export interface Prefill {
  prompt?: string;
  /** Template slugs or "component:<slug>" refs. */
  references?: string[];
  skills?: string[];
  images?: string[];
}

const KEY = "aura-prefill";

export function setPrefill(prefill: Prefill): void {
  sessionStorage.setItem(KEY, JSON.stringify(prefill));
}

export function takePrefill(): Prefill | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  sessionStorage.removeItem(KEY);
  try {
    return JSON.parse(raw) as Prefill;
  } catch {
    return null;
  }
}

/** Renders an SVG (or any image URL) to a PNG data URL, for attaching assets to a prompt. */
export async function imageToPngDataUrl(url: string, maxEdge = 1568): Promise<string> {
  const img = new Image();
  img.src = url;
  await img.decode();
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}
