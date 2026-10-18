import type { Capture } from "./protocol";

export interface Version {
  id: string;
  html: string;
  prompt: string;
  summary: string;
  model: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  versionId?: string;
  reasoning?: string;
  error?: boolean;
  /** Small previews of images attached to a user message. */
  images?: string[];
}

export interface PendingGeneration {
  prompt: string;
  model: string;
  designSystemId: string | null;
  /** Template slugs or "component:<slug>" refs. */
  referenceSlugs: string[];
  skillSlugs?: string[];
  images: string[];
  captures?: Capture[];
  webAccess?: boolean;
}

export interface Project {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  designSystemId: string | null;
  messages: ChatMessage[];
  versions: Version[];
  currentVersionId: string | null;
  publishedSlug?: string;
  /** Set by the home composer; the editor starts this generation on open. */
  pending?: PendingGeneration;
}

export interface ProjectSummary {
  id: string;
  title: string;
  updatedAt: string;
  versionCount: number;
  hasPage: boolean;
}
