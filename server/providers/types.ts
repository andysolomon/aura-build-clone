import type { ModelOption, ProviderId, ProviderInfo } from "../../shared/models";

export interface ProviderInput {
  /** Provider-specific model id (the part after "<provider>:"). */
  model: string;
  system: string;
  prompt: string;
  /** Image data URLs. Providers that can't accept images ignore them. */
  images: string[];
  effort: "low" | "medium" | "high";
  /** Read-only web search/fetch, when the provider supports it. */
  webAccess?: boolean;
}

export type ProviderEvent =
  | { type: "reasoning"; text: string }
  | { type: "delta"; text: string }
  | { type: "error"; message: string };

export interface Provider {
  id: ProviderId;
  label: string;
  billing: ProviderInfo["billing"];
  images: boolean;
  /** Whether the provider supports read-only web access. */
  web: boolean;
  /** Checks that the provider is installed and signed in. */
  detect(): Promise<{ available: boolean; note?: string }>;
  listModels(): Promise<ModelOption[]>;
  stream(input: ProviderInput, signal: AbortSignal): AsyncGenerator<ProviderEvent>;
}
