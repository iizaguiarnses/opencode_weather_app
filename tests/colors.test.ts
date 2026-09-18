import { test, expect } from "bun:test";
import { cyan, cyanBold, yellow, green, red } from "../src/colors";

const ESC = "\x1b[";
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;
const CYAN = `${ESC}36m`;
const YELLOW = `${ESC}33m`;
const GREEN = `${ESC}32m`;
const RED = `${ESC}31m`;

test("cyan envuelve texto con código ANSI cian", () => {
  expect(cyan("hola")).toBe(`${CYAN}hola${RESET}`);
});

test("cyanBold envuelve texto con cian negrita", () => {
  expect(cyanBold("hola")).toBe(`${CYAN}${BOLD}hola${RESET}`);
});

test("yellow envuelve texto con código ANSI amarillo", () => {
  expect(yellow("42°C")).toBe(`${YELLOW}42°C${RESET}`);
});

test("green envuelve texto con código ANSI verde", () => {
  expect(green("OK")).toBe(`${GREEN}OK${RESET}`);
});

test("red envuelve texto con código ANSI rojo", () => {
  expect(red("ERROR")).toBe(`${RED}ERROR${RESET}`);
});

test("cyan maneja texto vacío", () => {
  expect(cyan("")).toBe(`${CYAN}${RESET}`);
});

test("yellow preserva contenido numérico", () => {
  expect(yellow("12.5")).toBe(`${YELLOW}12.5${RESET}`);
});