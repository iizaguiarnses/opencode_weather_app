import { test, expect, beforeEach, afterEach, jest } from "bun:test";
import { homedir } from "node:os";
import { join } from "node:path";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import type { Settings } from "../src/types";

const REAL_CONFIG_DIR = join(homedir(), ".config", "weather-cli");

beforeEach(() => {
  if (existsSync(REAL_CONFIG_DIR)) {
    rmSync(REAL_CONFIG_DIR, { recursive: true });
  }
});

afterEach(() => {
  if (existsSync(REAL_CONFIG_DIR)) {
    rmSync(REAL_CONFIG_DIR, { recursive: true });
  }
});

test("getConfigDir retorna ruta correcta", async () => {
  const { getConfigDir } = await import("../src/storage");
  expect(getConfigDir()).toContain(".config");
  expect(getConfigDir()).toContain("weather-cli");
});

test("getDataFile retorna ruta correcta", async () => {
  const { getDataFile } = await import("../src/storage");
  expect(getDataFile()).toContain("data.json");
  expect(getDataFile()).toContain("weather-cli");
});

test("loadSettings crea data.json con default si no existe", async () => {
  const mockSettings: Settings = {
    cities: ["TestCity"],
    defaultCity: "TestCity",
    units: "celsius",
  };

  const { saveSettings, loadSettings, getConfigDir, getDataFile } = await import(
    "../src/storage"
  );

  const settings = loadSettings();
  expect(settings.cities).toEqual([]);
  expect(settings.defaultCity).toBeNull();
  expect(settings.units).toBe("celsius");
  expect(existsSync(getDataFile())).toBe(true);

  saveSettings(mockSettings);
  const loaded = loadSettings();
  expect(loaded.cities).toEqual(["TestCity"]);
  expect(loaded.defaultCity).toBe("TestCity");
  expect(loaded.units).toBe("celsius");
});

test("loadSettings lee datos persistidos correctamente", async () => {
  const { saveSettings, loadSettings, getConfigDir, getDataFile } = await import(
    "../src/storage"
  );

  const mockSettings: Settings = {
    cities: ["Madrid", "Ottawa"],
    defaultCity: "Ottawa",
    units: "fahrenheit",
  };
  saveSettings(mockSettings);

  const settings = loadSettings();
  expect(settings.cities).toEqual(["Madrid", "Ottawa"]);
  expect(settings.defaultCity).toBe("Ottawa");
  expect(settings.units).toBe("fahrenheit");
});

test("loadSettings retorna defaults si data.json está corrupto", async () => {
  const { ensureConfigDir, loadSettings, getDataFile } = await import(
    "../src/storage"
  );
  ensureConfigDir();
  writeFileSync(getDataFile(), "not valid json {{{", "utf-8");

  const settings = loadSettings();
  expect(settings.cities).toEqual([]);
  expect(settings.defaultCity).toBeNull();
  expect(settings.units).toBe("celsius");
});

test("loadSettings fusiona con defaults si faltan campos", async () => {
  const { ensureConfigDir, loadSettings, getDataFile } = await import(
    "../src/storage"
  );
  ensureConfigDir();
  writeFileSync(
    getDataFile(),
    JSON.stringify({ cities: ["Lima"] }, null, 2),
    "utf-8"
  );

  const settings = loadSettings();
  expect(settings.cities).toEqual(["Lima"]);
  expect(settings.defaultCity).toBeNull();
  expect(settings.units).toBe("celsius");
});

test("saveSettings persiste correctamente", async () => {
  const { saveSettings, loadSettings } = await import("../src/storage");
  const newSettings: Settings = {
    cities: ["Berlin", "Tokyo"],
    defaultCity: "Berlin",
    units: "fahrenheit",
  };

  saveSettings(newSettings);

  const loaded = loadSettings();
  expect(loaded.cities).toEqual(["Berlin", "Tokyo"]);
  expect(loaded.defaultCity).toBe("Berlin");
  expect(loaded.units).toBe("fahrenheit");
});

test("ensureConfigDir crea el directorio si no existe", async () => {
  const { ensureConfigDir, getConfigDir } = await import("../src/storage");
  const dirPath = getConfigDir();
  if (existsSync(dirPath)) {
    rmSync(dirPath, { recursive: true });
  }
  expect(existsSync(dirPath)).toBe(false);

  ensureConfigDir();
  expect(existsSync(dirPath)).toBe(true);
});

test("ensureConfigDir no falla si ya existe", async () => {
  const { ensureConfigDir } = await import("../src/storage");
  expect(() => ensureConfigDir()).not.toThrow();
});

test("data.json contiene JSON válido después de saveSettings", async () => {
  const { saveSettings, getDataFile } = await import("../src/storage");
  const newSettings: Settings = {
    cities: ["Roma"],
    defaultCity: "Roma",
    units: "celsius",
  };

  saveSettings(newSettings);

  const content = readFileSync(getDataFile(), "utf-8");
  const parsed = JSON.parse(content);
  expect(parsed.cities).toEqual(["Roma"]);
  expect(parsed.defaultCity).toBe("Roma");
  expect(parsed.units).toBe("celsius");
});