import { homedir } from "node:os";
import { join } from "node:path";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import type { Settings } from "./types";

const CONFIG_DIR = join(homedir(), ".config", "weather-cli");
const DATA_FILE = join(CONFIG_DIR, "data.json");

const DEFAULT_SETTINGS: Settings = {
  cities: [],
  defaultCity: null,
  units: "celsius",
};

export function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadSettings(): Settings {
  ensureConfigDir();
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const data = JSON.parse(readFileSync(DATA_FILE, "utf-8"));
    return { ...DEFAULT_SETTINGS, ...data };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  ensureConfigDir();
  writeFileSync(DATA_FILE, JSON.stringify(settings, null, 2), "utf-8");
}
