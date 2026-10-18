import { useEffect, useState } from "react";
import { DEMO_MODEL_REF, findModel } from "../../shared/models";
import type { PendingGeneration, Project } from "../../shared/project";
import type { AppConfig } from "../../shared/protocol";
import { api } from "./api";
import { now, titleFromPrompt, uid } from "./util";

export async function createProjectFromPrompt(pending: PendingGeneration): Promise<string> {
  const project: Project = {
    id: uid(),
    title: titleFromPrompt(pending.prompt),
    createdAt: now(),
    updatedAt: now(),
    model: pending.model,
    designSystemId: pending.designSystemId,
    messages: [],
    versions: [],
    currentVersionId: null,
    pending,
  };
  await api.saveProject(project);
  return project.id;
}

export async function createProjectFromHtml(title: string, html: string, note: string): Promise<string> {
  const versionId = uid();
  const project: Project = {
    id: uid(),
    title,
    createdAt: now(),
    updatedAt: now(),
    // Resolved to the default model when the editor opens.
    model: "",
    designSystemId: null,
    messages: [{ id: uid(), role: "assistant", content: note, createdAt: now(), versionId }],
    versions: [{ id: versionId, html, prompt: note, summary: note, model: "template", createdAt: now() }],
    currentVersionId: versionId,
  };
  await api.saveProject(project);
  return project.id;
}

const OFFLINE: AppConfig = { aiEnabled: false, defaultModel: DEMO_MODEL_REF, providers: [] };
let configPromise: Promise<AppConfig> | null = null;
let currentConfig: AppConfig | null = null;
const listeners = new Set<(config: AppConfig) => void>();

function loadConfig(refresh = false): Promise<AppConfig> {
  configPromise = api.config(refresh).catch(() => OFFLINE);
  void configPromise.then((config) => {
    currentConfig = config;
    listeners.forEach((listener) => listener(config));
  });
  return configPromise;
}

/** Provider and model discovery from the server, shared by every component. */
export function useAppConfig(): AppConfig | null {
  const [config, setConfig] = useState<AppConfig | null>(currentConfig);
  useEffect(() => {
    listeners.add(setConfig);
    void (configPromise ?? loadConfig()).then(setConfig);
    return () => {
      listeners.delete(setConfig);
    };
  }, []);
  return config;
}

/** Re-reads provider status, e.g. after a model failed to authenticate. */
export async function reloadAppConfig(): Promise<void> {
  await loadConfig(false);
}

/** Re-runs provider detection, e.g. after signing in to a CLI. */
export async function refreshAppConfig(): Promise<void> {
  await loadConfig(true);
}

/** The stored model if its provider is still usable, otherwise the server's default. */
export function usableModel(config: AppConfig, ref: string | null | undefined): string {
  const model = findModel(config.providers, ref);
  const provider = model && config.providers.find((p) => p.id === model.provider);
  return model && provider?.available && !model.unavailable ? model.ref : config.defaultModel;
}
