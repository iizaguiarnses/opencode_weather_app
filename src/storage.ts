import { homedir } from "node:os";
import { join } from "node:path";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import type { Settings } from "./types";

export function getConfigDir(): string {
  return join(homedir(), ".config", "weather-cli");
}

export function getDataFile(): string {
  return join(getConfigDir(), "data.json");
}

const DEFAULT_SETTINGS: Settings = {
  cities: [],
  defaultCity: null,
  units: "celsius",
};

export function ensureConfigDir(): void {
  const dir = getConfigDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function loadSettings(): Settings {
  ensureConfigDir();
  const dataFile = getDataFile();
  if (!existsSync(dataFile)) {
    writeFileSync(dataFile, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const data = JSON.parse(readFileSync(dataFile, "utf-8"));
    return { ...DEFAULT_SETTINGS, ...data };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  ensureConfigDir();
  const dataFile = getDataFile();
  writeFileSync(dataFile, JSON.stringify(settings, null, 2), "utf-8");
}
