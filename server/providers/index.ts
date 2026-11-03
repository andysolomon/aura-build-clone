import { DEMO_MODEL_REF, PROVIDER_ORDER, type ProviderId, type ProviderInfo } from "../../shared/models";
import { anthropicApi } from "./anthropic";
import { claudeCode } from "./claude-code";
import { codex } from "./codex";
import { cursor } from "./cursor";
import { authFailure, clearAuthFailures, clearModelFailures, modelFailure } from "./health";
import { opencode } from "./opencode";
import type { Provider } from "./types";

const PROVIDERS: Provider[] = [claudeCode, codex, cursor, opencode, anthropicApi];

/** Preferred default model per provider, when the provider lists it. */
const PREFERRED: Partial<Record<ProviderId, string[]>> = {
  "claude-code": ["claude-opus-5-5"],
  anthropic: ["claude-opus-5-5"],
  codex: ["gpt-6.1-sol", "gpt-6-sol"],
  cursor: ["claude-opus-5-5-medium", "auto"],
};

const DEMO: ProviderInfo = {
  id: "demo",
  label: "Offline demo",
  billing: "offline",
  available: true,
  images: false,
  web: false,
  models: [{ ref: DEMO_MODEL_REF, provider: "demo", id: "offline", label: "Demo generator" }],
};

const TTL_MS = 5 * 60_000;
let cache: { at: number; infos: ProviderInfo[] } | null = null;
let inflight: Promise<ProviderInfo[]> | null = null;

async function inspect(provider: Provider): Promise<ProviderInfo> {
  const base = { id: provider.id, label: provider.label, billing: provider.billing, images: provider.images, web: provider.web };
  try {
    const detected = await provider.detect();
    if (!detected.available) return { ...base, available: false, note: detected.note, models: [] };
    const models = await provider.listModels();
    if (!models.length) return { ...base, available: false, note: "No models found.", models };
    return { ...base, available: true, note: detected.note, models };
  } catch (err) {
    return { ...base, available: false, note: `Detection failed: ${err instanceof Error ? err.message : String(err)}`, models: [] };
  }
}

/** Marks models whose calls are currently failing to authenticate. */
function withHealth(infos: ProviderInfo[]): ProviderInfo[] {
  return infos.map((info) => ({
    ...info,
    models: info.models.map((m) => {
      const unavailable = authFailure(info.id, m.id) ?? modelFailure(info.id, m.id);
      return unavailable ? { ...m, unavailable } : m;
    }),
  }));
}

/** Detects installed, signed-in providers and their models. Cached for a few minutes. */
export async function discoverProviders(force = false): Promise<ProviderInfo[]> {
  if (force) {
    clearAuthFailures();
    clearModelFailures();
  }
  return withHealth(await detectAll(force));
}

function detectAll(force: boolean): Promise<ProviderInfo[]> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) return Promise.resolve(cache.infos);
  inflight ??= Promise.all(PROVIDERS.map(inspect))
    .then((infos) => {
      const all = [...infos, DEMO].sort((a, b) => PROVIDER_ORDER.indexOf(a.id) - PROVIDER_ORDER.indexOf(b.id));
      cache = { at: Date.now(), infos: all };
      return all;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function getProvider(id: ProviderId): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function defaultModel(infos: ProviderInfo[]): string {
  for (const info of infos) {
    if (!info.available || info.id === "demo") continue;
    const usable = info.models.filter((m) => !m.unavailable);
    if (!usable.length) continue;
    const preferred = PREFERRED[info.id]?.map((id) => usable.find((m) => m.id === id)).find(Boolean);
    return (preferred ?? usable[0]).ref;
  }
  return DEMO_MODEL_REF;
}
