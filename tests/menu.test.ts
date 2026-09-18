import { test, expect, jest, beforeEach, afterEach } from "bun:test";
import type { DailyForecast, Units } from "../src/types";

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const monthNames = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = dayNames[date.getDay()];
  const dayNum = String(date.getDate()).padStart(2, "0");
  const month = monthNames[date.getMonth()];
  return `${day} ${dayNum} ${month}`;
}

test("formatDate formatea fecha correctamente", () => {
  const result = formatDate("2024-01-15");
  expect(result).toBe("Lun 15 ene");
});

test("formatDate formatea día de semana correcto", () => {
  const monday = formatDate("2024-03-04");
  expect(monday).toBe("Lun 04 mar");
});

test("formatDate usa padding cero para día", () => {
  const result = formatDate("2024-05-07");
  const parts = result.split(" ");
  expect(parts[1]).toBe("07");
});

test("formatDate maneja fin de mes", () => {
  const result = formatDate("2024-12-31");
  expect(result).toBe("Mar 31 dic");
});

test("formatDate maneja día 1", () => {
  const result = formatDate("2024-07-01");
  expect(result).toBe("Lun 01 jul");
});

test("formatDate maneja meses de un solo dígito", () => {
  const result = formatDate("2024-03-10");
  expect(result).toContain("mar");
});

test("formatDate retorna string de longitud consistente", () => {
  const result = formatDate("2024-01-15");
  expect(result.length).toBe(10);
});