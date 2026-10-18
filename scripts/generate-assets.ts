// Generates the Assets library: original, deterministic SVG backgrounds and graphics.
// Run with `npm run assets`. Output: public/assets/<slug>.svg and public/assets/index.json.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type Ratio = "16:9" | "4:3" | "1:1" | "3:4" | "9:16";

const SIZES: Record<Ratio, [number, number]> = {
  "16:9": [1600, 900],
  "4:3": [1600, 1200],
  "1:1": [1200, 1200],
  "3:4": [1200, 1600],
  "9:16": [900, 1600],
};

interface Palette {
  name: string;
  dark: boolean;
  base: string;
  colors: string[];
}

const PALETTES: Palette[] = [
  { name: "Sunset", dark: false, base: "#fff4ec", colors: ["#ff7a59", "#ffb347", "#ff4f8b", "#ffd166"] },
  { name: "Ocean", dark: false, base: "#eef7ff", colors: ["#3b82f6", "#06b6d4", "#60a5fa", "#a5f3fc"] },
  { name: "Forest", dark: true, base: "#07130d", colors: ["#16a34a", "#84cc16", "#0f766e", "#bef264"] },
  { name: "Neon", dark: true, base: "#07060f", colors: ["#a855f7", "#ec4899", "#22d3ee", "#6366f1"] },
  { name: "Pastel", dark: false, base: "#fbf8ff", colors: ["#c4b5fd", "#f9a8d4", "#a7f3d0", "#fde68a"] },
  { name: "Mono", dark: true, base: "#0a0a0a", colors: ["#3f3f46", "#a1a1aa", "#27272a", "#e4e4e7"] },
  { name: "Ember", dark: true, base: "#120806", colors: ["#f97316", "#dc2626", "#fbbf24", "#7c2d12"] },
  { name: "Lavender", dark: false, base: "#f6f3ff", colors: ["#8b5cf6", "#a78bfa", "#f0abfc", "#c7d2fe"] },
  { name: "Mint", dark: false, base: "#f0fdf8", colors: ["#10b981", "#5eead4", "#a3e635", "#99f6e4"] },
  { name: "Midnight", dark: true, base: "#030712", colors: ["#1d4ed8", "#7c3aed", "#0ea5e9", "#312e81"] },
];

/** Small deterministic PRNG so every run produces identical files. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => Math.round(n * 10) / 10;

function svg(w: number, h: number, body: string, defs = ""): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>\n`;
}

const grain = (opacity: number) =>
  `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="${opacity}"/></feComponentTransfer></filter>`;

type Generator = (w: number, h: number, p: Palette, r: () => number) => string;

const GENERATORS: Record<string, { title: (p: Palette) => string; category: string; render: Generator }> = {
  mesh: {
    title: (p) => `${p.name} mesh gradient`,
    category: "gradient",
    render: (w, h, p, r) => {
      const blobs = Array.from({ length: 6 }, (_, i) => {
        const c = p.colors[i % p.colors.length];
        return `<circle cx="${f(r() * w)}" cy="${f(r() * h)}" r="${f((0.25 + r() * 0.35) * Math.max(w, h))}" fill="${c}" opacity="${f(0.55 + r() * 0.4)}"/>`;
      }).join("");
      return svg(w, h, `<rect width="100%" height="100%" fill="${p.base}"/><g filter="url(#blur)">${blobs}</g><rect width="100%" height="100%" filter="url(#grain)" opacity="0.5"/>`, `<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${f(Math.max(w, h) / 9)}"/></filter>${grain(0.18)}`);
    },
  },
  aurora: {
    title: (p) => `${p.name} aurora`,
    category: "gradient",
    render: (w, h, p, r) => {
      const bands = Array.from({ length: 4 }, (_, i) => {
        const c = p.colors[i % p.colors.length];
        return `<ellipse cx="${f(w * (0.2 + r() * 0.6))}" cy="${f(h * (0.25 + r() * 0.4))}" rx="${f(w * (0.45 + r() * 0.3))}" ry="${f(h * (0.08 + r() * 0.1))}" fill="${c}" opacity="${f(0.5 + r() * 0.4)}" transform="rotate(${f(-25 + r() * 50)} ${f(w / 2)} ${f(h / 2)})"/>`;
      }).join("");
      const base = p.dark ? p.base : "#0b1020";
      return svg(w, h, `<rect width="100%" height="100%" fill="${base}"/><g filter="url(#blur)" style="mix-blend-mode:screen">${bands}</g><rect width="100%" height="100%" filter="url(#grain)" opacity="0.6"/>`, `<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${f(Math.min(w, h) / 10)}"/></filter>${grain(0.22)}`);
    },
  },
  grain: {
    title: (p) => `${p.name} grain gradient`,
    category: "texture",
    render: (w, h, p, r) => {
      const angle = Math.round(r() * 360);
      return svg(w, h, `<rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" filter="url(#grain)"/>`, `<linearGradient id="g" gradientTransform="rotate(${angle} 0.5 0.5)"><stop offset="0" stop-color="${p.colors[0]}"/><stop offset="0.55" stop-color="${p.colors[1]}"/><stop offset="1" stop-color="${p.colors[2]}"/></linearGradient>${grain(0.35)}`);
    },
  },
  grid: {
    title: (p) => `${p.name} spotlight grid`,
    category: "pattern",
    render: (w, h, p) => {
      const line = p.dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.13)";
      return svg(w, h, `<rect width="100%" height="100%" fill="${p.base}"/><rect width="100%" height="100%" fill="url(#glow)"/><rect width="100%" height="100%" fill="url(#grid)" mask="url(#fade)"/>`, `<pattern id="grid" width="${f(w / 18)}" height="${f(w / 18)}" patternUnits="userSpaceOnUse"><path d="M${f(w / 18)} 0H0V${f(w / 18)}" fill="none" stroke="${line}" stroke-width="${f(Math.max(w, h) / 700)}"/></pattern><radialGradient id="glow" cx="0.5" cy="0.15" r="0.7"><stop offset="0" stop-color="${p.colors[0]}" stop-opacity="0.45"/><stop offset="1" stop-color="${p.colors[0]}" stop-opacity="0"/></radialGradient><radialGradient id="fadeG" cx="0.5" cy="0.3" r="0.75"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="fade"><rect width="100%" height="100%" fill="url(#fadeG)"/></mask>`);
    },
  },
  dots: {
    title: (p) => `${p.name} dot field`,
    category: "pattern",
    render: (w, h, p) => {
      const dot = p.dark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.26)";
      return svg(w, h, `<rect width="100%" height="100%" fill="${p.base}"/><rect width="100%" height="100%" fill="url(#glow)"/><rect width="100%" height="100%" fill="url(#dots)" mask="url(#fade)"/>`, `<pattern id="dots" width="${f(w / 28)}" height="${f(w / 28)}" patternUnits="userSpaceOnUse"><circle cx="${f(w / 56)}" cy="${f(w / 56)}" r="${f(Math.max(w, h) / 420)}" fill="${dot}"/></pattern><radialGradient id="glow" cx="0.75" cy="0.8" r="0.8"><stop offset="0" stop-color="${p.colors[1]}" stop-opacity="0.5"/><stop offset="1" stop-color="${p.colors[1]}" stop-opacity="0"/></radialGradient><radialGradient id="fadeG" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="fade"><rect width="100%" height="100%" fill="url(#fadeG)"/></mask>`);
    },
  },
  waves: {
    title: (p) => `${p.name} layered waves`,
    category: "abstract",
    render: (w, h, p, r) => {
      const layers = p.colors.map((c, i) => {
        const y0 = h * (0.45 + i * 0.13);
        const amp = h * (0.04 + r() * 0.05);
        const freq = 1.2 + r() * 1.5;
        const phase = r() * Math.PI * 2;
        let d = `M0 ${f(y0)}`;
        for (let x = 0; x <= w; x += w / 48) d += ` L${f(x)} ${f(y0 + Math.sin((x / w) * Math.PI * 2 * freq + phase) * amp)}`;
        d += ` L${w} ${h} L0 ${h}Z`;
        return `<path d="${d}" fill="${c}" opacity="${f(0.55 + i * 0.1)}"/>`;
      }).join("");
      return svg(w, h, `<rect width="100%" height="100%" fill="${p.base}"/>${layers}`);
    },
  },
  blob: {
    title: (p) => `${p.name} organic blob`,
    category: "abstract",
    render: (w, h, p, r) => {
      const cx = w / 2;
      const cy = h / 2;
      const rad = Math.min(w, h) * 0.32;
      const n = 8;
      const pts = Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const k = rad * (0.75 + r() * 0.5);
        return [cx + Math.cos(a) * k, cy + Math.sin(a) * k];
      });
      // Smooth closed curve through the points (Catmull-Rom to cubic Bézier).
      let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
        d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
      }
      return svg(w, h, `<rect width="100%" height="100%" fill="${p.base}"/><path d="${d}Z" fill="url(#g)" filter="url(#soft)"/><path d="${d}Z" fill="url(#g)"/>`, `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.colors[0]}"/><stop offset="1" stop-color="${p.colors[2]}"/></linearGradient><filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${f(rad / 3)}"/></filter>`);
    },
  },
  contour: {
    title: (p) => `${p.name} topographic lines`,
    category: "pattern",
    render: (w, h, p, r) => {
      const stroke = p.dark ? p.colors[1] : p.colors[0];
      const cx = w * (0.3 + r() * 0.4);
      const cy = h * (0.3 + r() * 0.4);
      const rings = Array.from({ length: 16 }, (_, i) => {
        const base = 40 + i * Math.max(w, h) * 0.045;
        const n = 10;
        const pts = Array.from({ length: n }, (_, j) => {
          const a = (j / n) * Math.PI * 2;
          const k = base * (0.85 + r() * 0.3);
          return `${f(cx + Math.cos(a) * k)},${f(cy + Math.sin(a) * k * 0.8)}`;
        });
        return `<polygon points="${pts.join(" ")}" fill="none" stroke="${stroke}" stroke-opacity="${f(i % 4 === 0 ? 0.75 : 0.4)}" stroke-width="${f((Math.max(w, h) / 500) * (i % 4 === 0 ? 1.8 : 1))}" stroke-linejoin="round"/>`;
      }).join("");
      return svg(w, h, `<rect width="100%" height="100%" fill="${p.base}"/><g filter="url(#round)">${rings}</g>`, `<filter id="round"><feGaussianBlur stdDeviation="${f(Math.max(w, h) / 1600)}"/></filter>`);
    },
  },
  rays: {
    title: (p) => `${p.name} light rays`,
    category: "abstract",
    render: (w, h, p, r) => {
      const ox = w / 2;
      const oy = -h * 0.1;
      const rays = Array.from({ length: 14 }, (_, i) => {
        const a = Math.PI * (0.18 + (i / 14) * 0.64) + (r() - 0.5) * 0.05;
        const spread = 0.025 + r() * 0.03;
        const len = Math.hypot(w, h) * 1.2;
        const x1 = ox + Math.cos(a - spread) * len, y1 = oy + Math.sin(a - spread) * len;
        const x2 = ox + Math.cos(a + spread) * len, y2 = oy + Math.sin(a + spread) * len;
        return `<polygon points="${f(ox)},${f(oy)} ${f(x1)},${f(y1)} ${f(x2)},${f(y2)}" fill="${p.colors[i % p.colors.length]}" opacity="${f(0.12 + r() * 0.2)}"/>`;
      }).join("");
      const base = p.dark ? p.base : "#0d0f17";
      return svg(w, h, `<rect width="100%" height="100%" fill="${base}"/><g filter="url(#blur)">${rays}</g><rect width="100%" height="100%" filter="url(#grain)" opacity="0.5"/>`, `<filter id="blur"><feGaussianBlur stdDeviation="${f(Math.min(w, h) / 60)}"/></filter>${grain(0.2)}`);
    },
  },
  orbs: {
    title: (p) => `${p.name} glass orbs`,
    category: "3d",
    render: (w, h, p, r) => {
      const orbs = Array.from({ length: 5 }, (_, i) => {
        const rad = Math.min(w, h) * (0.08 + r() * 0.16);
        const cx = f(rad + r() * (w - rad * 2));
        const cy = f(rad + r() * (h - rad * 2));
        const c = p.colors[i % p.colors.length];
        return `<g><circle cx="${cx}" cy="${cy}" r="${f(rad)}" fill="url(#orb${i})"/><ellipse cx="${f(Number(cx) - rad * 0.3)}" cy="${f(Number(cy) - rad * 0.38)}" rx="${f(rad * 0.38)}" ry="${f(rad * 0.22)}" fill="#fff" opacity="0.55" filter="url(#hl)"/></g><radialGradient id="orb${i}" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="0.25" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="0.35"/></radialGradient>`;
      });
      const defs = orbs.map((o) => o.slice(o.indexOf("<radialGradient"))).join("") + `<filter id="hl"><feGaussianBlur stdDeviation="${f(Math.min(w, h) / 120)}"/></filter><radialGradient id="bg" cx="0.5" cy="0.4" r="0.9"><stop offset="0" stop-color="${p.dark ? "#1f1f2b" : "#ffffff"}"/><stop offset="1" stop-color="${p.base}"/></radialGradient>`;
      const body = orbs.map((o) => o.slice(0, o.indexOf("<radialGradient"))).join("");
      return svg(w, h, `<rect width="100%" height="100%" fill="url(#bg)"/>${body}`, defs);
    },
  },
};

const RATIOS: Ratio[] = ["16:9", "4:3", "1:1", "3:4", "9:16"];

async function main() {
  const out = path.resolve("public/assets");
  await mkdir(out, { recursive: true });
  const index: { slug: string; title: string; category: string; palette: string; ratio: Ratio; width: number; height: number; dark: boolean }[] = [];
  let seed = 7;
  for (const [kind, gen] of Object.entries(GENERATORS)) {
    // Six palettes per generator, rotating so each generator gets a different mix.
    for (let i = 0; i < 6; i++) {
      const palette = PALETTES[(i * 3 + kind.length) % PALETTES.length];
      const ratio = RATIOS[(i + kind.length) % RATIOS.length];
      const [w, h] = SIZES[ratio];
      const slug = `${kind}-${palette.name.toLowerCase()}-${ratio.replace(":", "x")}`;
      await writeFile(path.join(out, `${slug}.svg`), gen.render(w, h, palette, rng(seed++ * 7919)));
      index.push({ slug, title: gen.title(palette), category: gen.category, palette: palette.name, ratio, width: w, height: h, dark: palette.dark || ["aurora", "rays"].includes(kind) });
    }
  }
  await writeFile(path.join(out, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`Wrote ${index.length} assets to ${out}`);
}

void main();
