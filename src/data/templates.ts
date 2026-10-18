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
