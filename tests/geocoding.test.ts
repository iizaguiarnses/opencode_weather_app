import { test, expect, beforeEach, afterEach, jest } from "bun:test";
import { geocodeCity } from "../src/geocoding";

let originalFetch: typeof fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(data: unknown, ok = true, status = 200) {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(data),
    })
  ) as unknown as typeof fetch;
}

test("geocodeCity retorna coords del primer resultado", async () => {
  mockFetch({
    results: [
      { latitude: 40.4168, longitude: -3.7038, name: "Madrid" },
      { latitude: 45.42, longitude: -75.69, name: "Madrid, Canada" },
    ],
  });

  const result = await geocodeCity("Madrid");
  expect(result).toEqual({ lat: 40.4168, lon: -3.7038 });
});

test("geocodeCity retorna null si no hay resultados", async () => {
  mockFetch({ results: [] });

  const result = await geocodeCity("CiudadInexistente");
  expect(result).toBeNull();
});

test("geocodeCity retorna null si results es undefined", async () => {
  mockFetch({});

  const result = await geocodeCity("Madrid");
  expect(result).toBeNull();
});

test("geocodeCity retorna null si el HTTP falla", async () => {
  mockFetch(null, false, 500);

  const result = await geocodeCity("Madrid");
  expect(result).toBeNull();
});

test("geocodeCity usa encodeURIComponent para ciudades con espacios", async () => {
  const fetchSpy = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [{ latitude: 1, longitude: 2, name: "Santo Domingo" }],
        }),
    })
  ) as unknown as typeof fetch;
  globalThis.fetch = fetchSpy;

  await geocodeCity("Santo Domingo");
  expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringContaining("Santo%20Domingo")
  );
});

test("geocodeCity usa parameter count=1", async () => {
  const fetchSpy = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [{ latitude: 1, longitude: 2, name: "Test" }],
        }),
    })
  ) as unknown as typeof fetch;
  globalThis.fetch = fetchSpy;

  await geocodeCity("Test");
  expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining("count=1"));
});

test("geocodeCity usa language=es", async () => {
  const fetchSpy = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [{ latitude: 1, longitude: 2, name: "Test" }],
        }),
    })
  ) as unknown as typeof fetch;
  globalThis.fetch = fetchSpy;

  await geocodeCity("Test");
  expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining("language=es"));
});

test("geocodeCity usa format=json", async () => {
  const fetchSpy = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [{ latitude: 1, longitude: 2, name: "Test" }],
        }),
    })
  ) as unknown as typeof fetch;
  globalThis.fetch = fetchSpy;

  await geocodeCity("Test");
  expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining("format=json"));
});