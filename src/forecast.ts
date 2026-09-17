import type { GeocodingResult, WeatherData, Units } from "./types";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchWeather(
  city: string,
  coords: GeocodingResult,
  units: Units
): Promise<WeatherData> {
  const tempUnit = units === "celsius" ? "celsius" : "fahrenheit";
  const url = `${FORECAST_URL}?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m&temperature_unit=${tempUnit}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error fetching weather for ${city}`);
  }
  const data = await res.json() as {
    current: { temperature_2m: number; time: string };
  };
  return {
    city,
    temperature: data.current.temperature_2m,
    units: units === "celsius" ? "°C" : "°F",
    time: data.current.time,
  };
}
