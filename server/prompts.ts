import { findDesignSystem } from "../shared/design-systems";
import type { GenerateRequest } from "../shared/protocol";

export const SYSTEM_PROMPT = `You are the design engine of an AI website builder. You produce premium, production-quality landing pages as a single self-contained HTML document.

Output format, exactly:
<summary>One to three plain sentences telling the user what you built or changed.</summary>
<!DOCTYPE html>
...the complete document...
</html>

Write nothing before the summary and nothing after </html>. Do not wrap output in Markdown code fences.

Technical constraints for the document:
- Tailwind CSS through <script src="https://cdn.tailwindcss.com"></script>. A tailwind.config script block and a small <style> block for custom keyframes or effects are fine.
- Fonts from Google Fonts <link> tags. Icons through <script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"></script> using <iconify-icon icon="lucide:NAME"></iconify-icon>, or inline SVG.
- Images: the screenshot URLs given in <website_screenshots> (use them wherever the real product UI should appear), image URLs from sites the user referenced, or https://picsum.photos/seed/WORD/WIDTH/HEIGHT. Without real screenshots, prefer gradients, SVG art and HTML/CSS-built product mockups for the hero.
- Vanilla JavaScript only, inline at the end of <body>, kept small (scroll reveals, tabs, toggles, counters). Exceptions: when an attached skill explicitly calls for a library (for example GSAP or three.js) or a different Tailwind build, load it from cdn.jsdelivr.net as the skill describes; app and agent interfaces may use as much vanilla JavaScript as their simulated behavior needs.
- Responsive from 375px to 1440px+, semantic, accessible contrast, real-sounding copy (never lorem ipsum).

Design standard: aim for the polish of an award-winning agency site. Commit to a clear art direction (type pairing, palette, spacing rhythm, one memorable visual idea in the hero), keep hierarchy obvious, and make interactive states feel considered. A typical page has navigation, hero, social proof, features, a showcase or product section, testimonials, pricing or an offer where it fits, FAQ or a closing CTA, and a footer, but follow the user's brief over this outline.

Agent and app interfaces: when the brief asks for an AI chat, copilot, assistant or agent interface rather than a marketing page, the page is the working interface itself. Build the thread, composer and every message part the brief implies (reasoning, tool calls with status, approvals, sources, artifacts), and simulate the agent with a scripted run so sending a message streams a believable reply, stop works and disclosures open. Pre-render one complete exchange so the first view is rich. When a page only markets an agent product, make its product mockups interactive the same way.

When you are given a current page and a change request, return the full updated document. Preserve everything the user did not ask to change, including copy, structure and styling. When the request names a selected element, confine the change to that element unless the request clearly asks for more.

When a design system is provided, treat its palette, typography and component guidance as binding. Reference pages are inspiration for layout and quality; do not copy their brand or copy.`;

export const ENHANCE_SYSTEM_PROMPT = `You rewrite rough website ideas into strong design briefs for an AI landing page builder. Keep the user's intent, brand names and facts. Add concrete art direction (palette, typography, layout ideas, one signature hero visual), the sections the page needs, and the tone of the copy. If the idea is an AI chat, copilot or agent interface rather than a marketing page, describe the interface instead: its layout and panels, the message parts it shows (reasoning, tool calls, approvals, sources, artifacts), key states and the scripted interactions. Reply with the improved brief only, as one paragraph of at most 120 words, no preamble.`;

/** Coding-agent CLIs get this extra rule so they answer in text instead of using tools. */
export const AGENT_PREAMBLE = `You are running headless inside a website builder. Do not use any tools, do not read or write files, and do not run commands. Reply with the requested output directly in your message.`;

/** Preamble when the user turned on web access: browsing only, still no files or commands. */
export const AGENT_PREAMBLE_WEB = `You are running headless inside a website builder. You may use web search and web fetch (read-only) to research sites and products the user mentions. Do not use any other tools, do not read or write files, and do not run commands. When you are done researching, reply with the requested output directly in your message.`;

export const agentPreamble = (webAccess?: boolean) => (webAccess ? AGENT_PREAMBLE_WEB : AGENT_PREAMBLE);

/** House style for new pages that arrive with no visual direction at all. */
export const DEFAULT_AESTHETIC = `<default_aesthetic>
No design system, reference page or image came with this brief, so use this house style unless the brief or an attached skill sets its own visual direction:
- Type: one or two readable families from Google Fonts or a web-safe stack, three at most. No novelty or hard-to-read display faces.
- Neutrals: pick one temperature (warm, cool or neutral) and hold it. Use off-whites and off-blacks rather than pure #fff and #000, with the whites only faintly tinted.
- Accents: zero to two, defined as oklch() colors in tailwind.config with the same lightness and chroma and different hues.
- Visuals: no complex hand-drawn SVG illustrations. Keep inline SVG to simple shapes and icons, build product visuals as HTML/CSS mockups, and use picsum.photos for photography.
The hero still needs one memorable idea: carry it with layout, type scale and composition rather than extra colors.
</default_aesthetic>`;

/** True when a new page has no design system, references, images or screenshots to steer its look. */
export function needsDefaultAesthetic(req: GenerateRequest): boolean {
  return !req.html && !findDesignSystem(req.designSystemId) && !req.references?.length && !req.images?.length && !req.screenshots?.length;
}

/** Renders a generation request as one self-contained user message. */
export function renderRequest(req: GenerateRequest): string {
  const parts: string[] = [];
  const history = (req.history ?? []).slice(-8);
  if (history.length) {
    const lines = history.map((t) => `${t.role === "user" ? "User" : "Assistant"}: ${t.content}`);
    parts.push(`<conversation_so_far>\n${lines.join("\n")}\n</conversation_so_far>`);
  }
  for (const skill of (req.skills ?? []).slice(0, 6)) {
    parts.push(`<skill name="${skill.name}">\nFollow these instructions while building the page.\n\n${skill.instructions.slice(0, 8000)}\n</skill>`);
  }
  const designSystem = findDesignSystem(req.designSystemId);
  if (designSystem) {
    parts.push(`<design_system name="${designSystem.name}">\n${designSystem.guidance}\n</design_system>`);
  }
  for (const ref of req.references ?? []) {
    parts.push(`<reference_page title="${ref.title}">\n${ref.html}\n</reference_page>`);
  }
  const shots = req.screenshots ?? [];
  for (const source of [...new Set(shots.map((s) => s.source))]) {
    const lines = shots.filter((s) => s.source === source).map((s) => `- ${s.label} (${s.width}×${s.height}): ${s.url}`);
    parts.push(
      `<website_screenshots source="${source}">\nScreenshots of the user's real product, captured from the live site (also attached as images). Show them in the page wherever the product UI appears (hero, feature sections, device frames) with <img> tags using these exact URLs, instead of illustrating the UI:\n${lines.join("\n")}\n</website_screenshots>`,
    );
  }
  if (req.webAccess) {
    parts.push("Web access is on: fetch the sites the user mentions to get accurate product names, features and copy before writing the page.");
  }
  if (req.images?.length) {
    parts.push("The attached images are visual references from the user (screenshots or inspiration).");
  }
  if (req.html) {
    parts.push(`<current_page>\n${req.html}\n</current_page>`);
    if (req.selection) {
      parts.push(`<selected_element selector="${req.selection.selector}">\n${req.selection.outerHTML}\n</selected_element>`);
    }
    parts.push(`Change request: ${req.prompt}`);
  } else {
    if (needsDefaultAesthetic(req)) parts.push(DEFAULT_AESTHETIC);
    parts.push(`Brief: ${req.prompt}`);
  }
  return parts.join("\n\n");
}

export const PROJECT_TYPES = ["Landing page", "SaaS website", "Agent interface", "Mobile screen", "Portfolio", "Ecommerce", "DESIGN.md direction"];
export const OUTPUT_STYLES = ["Full prompt", "Concise prompt", "Design-heavy", "Conversion-heavy"];

export const ENHANCE_TOOL_SYSTEM_PROMPT = `You turn rough website ideas into strong prompts for AI website builders.
Keep the user's intent, names and facts. Add concrete art direction (palette, typography, layout, one signature visual), the sections the page needs, interaction and motion notes, and the tone of the copy.

Reply with only a JSON object, no Markdown fences:
{"prompt": "the enhanced prompt", "short": "a one or two sentence version", "notes": ["3 to 5 short design notes explaining key choices"]}`;

export function enhanceToolRequest(prompt: string, projectType: string, outputStyle: string): string {
  const style: Record<string, string> = {
    "Full prompt": "Write a complete prompt of 150 to 250 words.",
    "Concise prompt": "Write a tight prompt under 80 words.",
    "Design-heavy": "Emphasize visual design: type, color, layout, imagery and motion. 150 to 250 words.",
    "Conversion-heavy": "Emphasize structure for conversion: value proposition, proof, objections, CTAs. 150 to 250 words.",
  };
  const target =
    projectType === "DESIGN.md direction"
      ? "a DESIGN.md design direction (palette, typography, components, motion rules)"
      : projectType === "Agent interface"
        ? "a working AI agent interface (chat thread, copilot or agent app): describe its layout, message parts (reasoning, tool calls, approvals, sources, artifacts), states and scripted interactions instead of marketing sections"
        : `a ${projectType.toLowerCase()}`;
  return `Project type: ${target}\nOutput style: ${style[outputStyle] ?? style["Full prompt"]}\n\nRough idea:\n${prompt}`;
}
