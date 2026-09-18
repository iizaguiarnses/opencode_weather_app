import { test, expect, beforeEach, afterEach, jest } from "bun:test";
import { fetchWeather, fetchDailyForecast, getWeatherDescription } from "../src/forecast";
import type { GeocodingResult, Units, DailyForecast } from "../src/types";

let originalFetch: typeof fetch;

const COORDS: GeocodingResult = { lat: 40.4168, lon: -3.7038 };

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

test("getWeatherDescription retorna descripción para código 0", () => {
  expect(getWeatherDescription(0)).toBe("Despejado");
});

test("getWeatherDescription retorna descripción para código 3 (nublado)", () => {
  expect(getWeatherDescription(3)).toBe("Nublado");
});

test("getWeatherDescription retorna descripción para código 45 (neblina)", () => {
  expect(getWeatherDescription(45)).toBe("Neblina");
});

test("getWeatherDescription retorna descripción para código 61 (lluvia ligera)", () => {
  expect(getWeatherDescription(61)).toBe("Lluvia ligera");
});

test("getWeatherDescription retorna descripción para código 95 (tormenta)", () => {
  expect(getWeatherDescription(95)).toBe("Tormenta");
});

test("getWeatherDescription retorna 'Desconocido' para código no mapeado", () => {
  expect(getWeatherDescription(999)).toBe("Desconocido");
});

test("getWeatherDescription retorna 'Desconocido' para código negativo", () => {
  expect(getWeatherDescription(-1)).toBe("Desconocido");
});

test("fetchWeather retorna datos actuales correctamente", async () => {
  mockFetch({
    current: { temperature_2m: 22.5, time: "2024-01-15T10:00" },
  });

  const result = await fetchWeather("Madrid", COORDS, "celsius");
  expect(result.city).toBe("Madrid");
  expect(result.temperature).toBe(22.5);
  expect(result.units).toBe("°C");
  expect(result.time).toBe("2024-01-15T10:00");
});

test("fetchWeather usa unidad fahrenheit correctamente", async () => {
  mockFetch({
    current: { temperature_2m: 72.3, time: "2024-01-15T10:00" },
  });

  const result = await fetchWeather("Madrid", COORDS, "fahrenheit");
  expect(result.units).toBe("°F");
  expect(result.temperature).toBe(72.3);
});

test("fetchWeather incluye temperature_unit en URL", async () => {
  const fetchSpy = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          current: { temperature_2m: 20, time: "2024-01-01" },
        }),
    })
  ) as unknown as typeof fetch;
  globalThis.fetch = fetchSpy;

  await fetchWeather("Test", COORDS, "celsius");
  expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringContaining("temperature_unit=celsius")
  );

  await fetchWeather("Test", COORDS, "fahrenheit");
  expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringContaining("temperature_unit=fahrenheit")
  );
});

test("fetchWeather lanza error si HTTP falla", async () => {
  mockFetch(null, false, 500);

  await expect(fetchWeather("Madrid", COORDS, "celsius")).rejects.toThrow(
    "Error fetching weather for Madrid"
  );
});

test("fetchDailyForecast retorna array de 7 elementos", async () => {
  mockFetch({
    daily: {
      time: [
        "2024-01-01",
        "2024-01-02",
        "2024-01-03",
        "2024-01-04",
        "2024-01-05",
        "2024-01-06",
        "2024-01-07",
      ],
      temperature_2m_max: [25, 26, 27, 28, 29, 30, 31],
      temperature_2m_min: [15, 16, 17, 18, 19, 20, 21],
      weathercode: [0, 1, 2, 3, 45, 61, 95],
    },
  });

  const result = await fetchDailyForecast(COORDS, "celsius");
  expect(result).toHaveLength(7);
});

test("fetchDailyForecast parsea correctamente los datos", async () => {
  mockFetch({
    daily: {
      time: ["2024-01-01", "2024-01-02"],
      temperature_2m_max: [25, 26],
      temperature_2m_min: [15, 16],
      weathercode: [0, 1],
    },
  });

  const result: DailyForecast[] = await fetchDailyForecast(COORDS, "celsius");
  expect(result[0]).toEqual({
    date: "2024-01-01",
    tempMax: 25,
    tempMin: 15,
    weatherCode: 0,
  });
  expect(result[1]!.date).toBe("2024-01-02");
  expect(result[1]!.tempMax).toBe(26);
  expect(result[1]!.tempMin).toBe(16);
  expect(result[1]!.weatherCode).toBe(1);
});

test("fetchDailyForecast incluye forecast_days=7 en URL", async () => {
  const fetchSpy = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          daily: {
            time: ["2024-01-01"],
            temperature_2m_max: [25],
            temperature_2m_min: [15],
            weathercode: [0],
          },
        }),
    })
  ) as unknown as typeof fetch;
  globalThis.fetch = fetchSpy;

  await fetchDailyForecast(COORDS, "celsius");
  expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringContaining("forecast_days=7")
  );
});

test("fetchDailyForecast lanza error si HTTP falla", async () => {
  mockFetch(null, false, 500);

  await expect(fetchDailyForecast(COORDS, "celsius")).rejects.toThrow(
    "Error fetching daily forecast"
  );
});

test("fetchWeather usa latitude y longitude correctos", async () => {
  const fetchSpy = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          current: { temperature_2m: 20, time: "2024-01-01" },
        }),
    })
  ) as unknown as typeof fetch;
  globalThis.fetch = fetchSpy;

  await fetchWeather("Test", { lat: 10.5, lon: -20.3 }, "celsius");
  expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringContaining("latitude=10.5")
  );
  expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringContaining("longitude=-20.3")
  );
});