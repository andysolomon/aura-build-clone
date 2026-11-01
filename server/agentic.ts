// Agent interfaces: briefs that ask for a chat, copilot or agent UI get the "Agentic interfaces"
// skill (content/skills/agentic-interfaces.md) attached automatically, so every provider follows
// the same anatomy, status system and scripted-run conventions as the Agent UI kit.

import { readFileSync } from "node:fs";
import path from "node:path";
import type { GenerateRequest } from "../shared/protocol";

export const AGENTIC_SKILL_NAME = "Agentic interfaces";
const SKILL_FILE = path.resolve(import.meta.dirname, "../content/skills/agentic-interfaces.md");

const AGENTIC_BRIEF = [
  /\bagentic\b/,
  /\b(?:ai|llm|autonomous|coding|research|voice|browser|computer[- ]use|multi[- ]agent)\s+agents?\b/,
  /\bagents?\s+(?:ui|interface|app|console|dashboard|workspace|workflow|builder|playground|inbox|chat)\b/,
  /\bchat\s?bots?\b/,
  /\bchat\s+(?:ui|interface|app|widget|experience|thread|window)\b/,
  /\bco-?pilot\b/,
  /\b(?:ai|virtual)\s+assistant\b/,
  /\bassistant\s+(?:ui|interface|app|widget|panel|sidebar)\b/,
  /\bconversational\s+(?:ui|interface|ai)\b/,
  /\b(?:llm|prompt)\s+playground\b/,
  /\btool[- ]calls?\b/,
];

/** True when the brief asks for (or markets) an AI chat, copilot or agent interface. */
export function isAgenticBrief(text: string): boolean {
  const lower = text.toLowerCase();
  return AGENTIC_BRIEF.some((pattern) => pattern.test(lower));
}

/** Pages built from the kit or the skill render their thread as an ARIA log. */
const AGENTIC_PAGE = /role=["']log["']/i;

let cached: string | null = null;

function skillInstructions(): string | null {
  if (cached === null) {
    try {
      cached = readFileSync(SKILL_FILE, "utf8").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
    } catch {
      cached = "";
    }
  }
  return cached || null;
}

/** Adds the agentic-interfaces skill to agent briefs and to edits of agent pages, once. */
export function withAgenticSkill(req: GenerateRequest): { req: GenerateRequest; attached: boolean } {
  const skills = req.skills ?? [];
  if (skills.some((s) => s.name === AGENTIC_SKILL_NAME)) return { req, attached: false };
  const agentic = isAgenticBrief(req.prompt) || (req.html ? AGENTIC_PAGE.test(req.html) : false);
  const instructions = agentic ? skillInstructions() : null;
  if (!instructions) return { req, attached: false };
  return { req: { ...req, skills: [{ name: AGENTIC_SKILL_NAME, instructions }, ...skills] }, attached: true };
}
