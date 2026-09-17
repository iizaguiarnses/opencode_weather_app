import type { GeocodingResult, WeatherData, Units, DailyForecast } from "./types";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const WEATHER_CODE_MAP: Record<number, string> = {
  0: "Despejado",
  1: "Principalmente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Neblina",
  48: "Neblina de escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna densa",
  56: "Llovizna helada ligera",
  57: "Llovizna helada densa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia fuerte",
  66: "Lluvia helada ligera",
  67: "Lluvia helada fuerte",
  71: "Chaparrón de nieve ligero",
  73: "Chaparrón de nieve moderado",
  75: "Chaparrón de nieve fuerte",
  77: "Granizo de nieve",
  80: "Chubascos de lluvia",
  81: "Chubascos de lluvia moderada",
  82: "Chubascos de lluvia fuerte",
  85: "Chubascos de nieve",
  95: "Tormenta",
  96: "Tormenta con granizo",
  99: "Tormenta con granizo fuerte",
};

export const getWeatherDescription = (code: number): string => {
  return WEATHER_CODE_MAP[code] ?? "Desconocido";
};

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

export async function fetchDailyForecast(
  coords: GeocodingResult,
  units: Units
): Promise<DailyForecast[]> {
  const tempUnit = units === "celsius" ? "celsius" : "fahrenheit";
  const url = `${FORECAST_URL}?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=${tempUnit}&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Error fetching daily forecast");
  }
  const data = await res.json() as {
    daily: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      weathercode: number[];
    };
  };
  return data.daily.time.map((date, i) => ({
    date,
    tempMax: data.daily.temperature_2m_max[i]!,
    tempMin: data.daily.temperature_2m_min[i]!,
    weatherCode: data.daily.weathercode[i]!,
  }));
}
