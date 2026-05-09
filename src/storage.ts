import type { AppState } from "./types";

const KEY = "trippack:v1";
export const STORAGE_KEYS = ["trippack:v1", "trippack:pin_hash", "trippack:theme"] as const;

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota / serialization errors in MVP
  }
}

export function uid(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export interface ExportEnvelope {
  trippack_export_version: 1;
  exportedAt: string;
  data: AppState;
}

export function exportData(state: AppState): string {
  const env: ExportEnvelope = {
    trippack_export_version: 1,
    exportedAt: new Date().toISOString(),
    data: state,
  };
  return JSON.stringify(env, null, 2);
}

export function importData(json: string): AppState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Not valid JSON.");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("File is empty or malformed.");
  }
  const env = parsed as Partial<ExportEnvelope>;
  if (env.trippack_export_version !== 1) {
    throw new Error("This file is not a TripPack export (or has an unsupported version).");
  }
  const data = env.data as Partial<AppState> | undefined;
  if (
    !data ||
    !Array.isArray(data.trips) ||
    !Array.isArray(data.bags) ||
    !Array.isArray(data.items) ||
    !Array.isArray(data.modules)
  ) {
    throw new Error("Backup is missing required sections.");
  }
  return {
    trips: data.trips,
    bags: data.bags,
    items: data.items,
    modules: data.modules,
    seeded: data.seeded ?? true,
  } as AppState;
}

export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
