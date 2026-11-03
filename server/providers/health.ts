import type { ProviderId } from "../../shared/models";

// Sign-in problems only surface when a model is actually called, so failures are remembered
// and the affected models are disabled in the picker until providers are re-detected.

const AUTH_ERROR =
  /api key (has )?expired|invalid (x-)?api[- ]?key|api key .*(invalid|revoked)|unauthori[sz]ed|\b401\b|authentication|not logged in|log ?in again|sign ?in again|(token|session|credentials?) (has )?expired/i;

const FIX: Record<ProviderId, string> = {
  "claude-code": "Run `claude auth login --claudeai` in a terminal to sign in again.",
  codex: "Run `codex login` in a terminal.",
  cursor: "Run `cursor-agent login` in a terminal.",
  opencode: "Run `opencode auth login` and reconnect the provider used by this model.",
  anthropic: "Check ANTHROPIC_API_KEY in .env.",
  demo: "",
};

const failures = new Map<string, string>();
const modelFailures = new Map<string, string>();

/** A retired or inaccessible model should not disable other models using the same login. */
export function isModelUnavailableError(message: string): boolean {
  return /no longer available|model[^\n]*(?:not found|does not exist|not available|not supported)|model_not_found/i.test(message);
}

export function recordModelFailure(provider: ProviderId, model: string, message: string): string {
  const reason = `${message} Choose another model in the model picker.`;
  modelFailures.set(`${provider}:${model}`, reason);
  return reason;
}

export function modelFailure(provider: ProviderId, model: string): string | undefined {
  return modelFailures.get(`${provider}:${model}`);
}

export function clearModelFailures(): void {
  modelFailures.clear();
}

/** OpenCode fronts several upstream providers, each with its own credential. */
function scope(provider: ProviderId, model: string): string {
  return provider === "opencode" ? `opencode:${model.split("/")[0]}` : provider;
}

export function isAuthError(message: string): boolean {
  return AUTH_ERROR.test(message);
}

/** Records an auth failure and returns the message with a fix appended. */
export function recordAuthFailure(provider: ProviderId, model: string, message: string): string {
  const fix = FIX[provider];
  failures.set(scope(provider, model), `Sign-in problem: ${fix}`);
  return fix ? `${message} ${fix} Pick another model in the meantime.` : message;
}

export function authFailure(provider: ProviderId, model: string): string | undefined {
  return failures.get(scope(provider, model));
}

export function clearAuthFailures(): void {
  failures.clear();
}
