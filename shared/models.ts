// Models are addressed as "<provider>:<model>", e.g. "claude-code:claude-opus-5-5" or
// "codex:gpt-6.1-sol". The server discovers which providers are installed and signed in.

export type ProviderId = "claude-code" | "codex" | "cursor" | "opencode" | "anthropic" | "demo";

export interface ModelOption {
  ref: string;
  provider: ProviderId;
  id: string;
  label: string;
  /** Set when calls to this model are failing, e.g. an expired sign-in. */
  unavailable?: string;
}

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  /** How the provider is paid for, shown in the model picker. */
  billing: "subscription" | "api-key" | "offline";
  available: boolean;
  /** Why the provider is unavailable, or a caveat about it. */
  note?: string;
  /** Whether image attachments reach the model. */
  images: boolean;
  models: ModelOption[];
}

/** Preferred order when choosing a default model. */
export const PROVIDER_ORDER: ProviderId[] = ["claude-code", "codex", "cursor", "opencode", "anthropic", "demo"];

export const DEMO_MODEL_REF = "demo:offline";

export function modelRef(provider: ProviderId, id: string): string {
  return `${provider}:${id}`;
}

export function parseModelRef(ref: string): { provider: ProviderId; id: string } | null {
  const index = ref.indexOf(":");
  if (index === -1) return null;
  const provider = ref.slice(0, index) as ProviderId;
  if (!PROVIDER_ORDER.includes(provider)) return null;
  return { provider, id: ref.slice(index + 1) };
}

/** Claude models available through both the Claude Code subscription and the API. */
export const CLAUDE_MODELS: { id: string; label: string }[] = [
  { id: "claude-opus-5-5", label: "Claude Opus 5.5" },
  { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5" },
  { id: "claude-fable-5-1", label: "Claude Fable 5.1" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5" },
];

export function findModel(providers: ProviderInfo[], ref: string | null | undefined): ModelOption | undefined {
  if (!ref) return undefined;
  for (const p of providers) {
    const m = p.models.find((x) => x.ref === ref);
    if (m) return m;
  }
  return undefined;
}

/** Readable label for a stored model ref, even if that provider is no longer available. */
export function describeModelRef(ref: string, providers: ProviderInfo[] = []): string {
  if (ref === "template") return "Template";
  if (ref === "demo") return "Demo generator";
  const known = findModel(providers, ref);
  if (known) return known.label;
  const parsed = parseModelRef(ref);
  if (!parsed) return ref;
  if (parsed.provider === "demo") return "Demo generator";
  return CLAUDE_MODELS.find((m) => m.id === parsed.id)?.label ?? parsed.id;
}
