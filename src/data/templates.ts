export type TemplateTier = "free" | "pro";

export interface Template {
  slug: string;
  title: string;
  description: string;
  category: string;
  tier: TemplateTier;
  author: string;
  views: number;
  remixes: number;
  featured?: boolean;
}

export const TEMPLATE_CATEGORIES = ["SaaS", "Portfolio", "E-commerce", "Services", "Food", "Real Estate", "Health"];

export const TEMPLATES: Template[] = [
  { slug: "lumen-ai", title: "Lumen AI — Product Analytics", description: "Dark AI analytics SaaS with violet glow, glass bento and a CSS-built dashboard mockup.", category: "SaaS", tier: "pro", author: "Iris Calder", views: 2410, remixes: 318, featured: true },
  { slug: "orbit-audio", title: "Orbit One — Headphones Launch", description: "Headphone launch with giant outlined type, SVG product, live colorway swatches and buy box.", category: "E-commerce", tier: "pro", author: "Theo Vance", views: 1980, remixes: 254, featured: true },
  { slug: "atelier-noir", title: "Atelier Noir — Architecture Studio", description: "Monochrome editorial architecture portfolio with serif display type and SVG elevations.", category: "Portfolio", tier: "pro", author: "Mara Ellison", views: 1630, remixes: 197, featured: true },
  { slug: "cadence-pay", title: "Cadence Pay — Fintech Card", description: "Black and lime fintech page with a 3D metal card, spend bento grid and pricing toggle.", category: "SaaS", tier: "pro", author: "Iris Calder", views: 1420, remixes: 176 },
  { slug: "northwind-studio", title: "Northwind Studio — Creative Agency", description: "Swiss-brutalist agency site with oversized type, client marquee and poster case studies.", category: "Services", tier: "free", author: "Jonas Weber", views: 1210, remixes: 143 },
  { slug: "vantage-estates", title: "Vantage Estates — Luxury Homes", description: "Luxury real estate with a dusk villa illustration, property search and listing cards.", category: "Real Estate", tier: "free", author: "Naomi Sato", views: 980, remixes: 121 },
  { slug: "ember-roasters", title: "Ember Roasters — Specialty Coffee", description: "Warm coffee roaster shop with CSS coffee bags, café menu and a live subscription picker.", category: "Food", tier: "free", author: "Leo Martins", views: 860, remixes: 98 },
  { slug: "halcyon-health", title: "Halcyon Health — Primary Care", description: "Soft sage primary-care clinic with an interactive booking widget, services and plans.", category: "Health", tier: "free", author: "Aisha Thomas", views: 740, remixes: 87 },
  { slug: "kitebase", title: "Kitebase — Team Planning", description: "Warm off-white planning SaaS in cobalt and tangerine with a drag-and-drop kanban board, live counts, feature bento and pricing toggle.", category: "SaaS", tier: "pro", author: "Iris Calder", views: 1180, remixes: 142 },
  { slug: "forge-edge", title: "Forge — Edge Deploy Platform", description: "Near-black edge deploy platform with ember glow, a spinning SVG wireframe globe, streaming deploy log, live latency table and tabbed code samples.", category: "SaaS", tier: "pro", author: "Iris Calder", views: 1090, remixes: 131 },
  { slug: "solenne-botanics", title: "Solenne — Botanical Skincare", description: "Sand and sage botanical skincare shop with CSS-built bottles, an ingredient explorer, a ritual quiz and a slide-in cart.", category: "E-commerce", tier: "free", author: "Theo Vance", views: 940, remixes: 112 },
  { slug: "juno-park", title: "Juno Park — Motion Designer", description: "Near-black motion portfolio with a kinetic Syne name, a looping film-strip reel, cursor-following project previews and copy-email contact.", category: "Portfolio", tier: "pro", author: "Mara Ellison", views: 1040, remixes: 126 },
  { slug: "switchback-expeditions", title: "Switchback — Guided Expeditions", description: "Forest and ochre trekking outfitter with layered SVG ridgelines, a live trip finder, day-by-day elevation itinerary and per-trip booking.", category: "Services", tier: "free", author: "Jonas Weber", views: 690, remixes: 74 },
  { slug: "tidehouse-kitchen", title: "Tidehouse — Coastal Seafood Kitchen", description: "Moody ink and brass seafood restaurant with an animated moonlit tide, tabbed menu, oyster tasting notes and a live reservation widget.", category: "Food", tier: "pro", author: "Leo Martins", views: 820, remixes: 96 },
  { slug: "commonhouse", title: "Commonhouse — Flexible Workspaces", description: "Warm concrete coworking brand with an isometric building cutaway, clickable city map, membership calculator and tour booking.", category: "Real Estate", tier: "free", author: "Naomi Sato", views: 610, remixes: 63 },
  { slug: "ironform-studio", title: "Ironform — Strength & Conditioning", description: "Charcoal and signal-red strength club with huge condensed type, an SVG weight plate, filterable class schedule and free-trial form.", category: "Health", tier: "free", author: "Aisha Thomas", views: 530, remixes: 58 },
];

export function findTemplate(slug: string | undefined): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export const templateHtmlUrl = (slug: string) => `/templates/${slug}.html`;
export const templateThumbUrl = (slug: string) => `/templates/thumbs/${slug}.jpg`;

export async function fetchTemplateHtml(slug: string): Promise<string> {
  const res = await fetch(templateHtmlUrl(slug));
  if (!res.ok) throw new Error("Template not found");
  return res.text();
}
