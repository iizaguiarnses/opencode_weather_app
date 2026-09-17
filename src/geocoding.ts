import type { GeocodingResult } from "./types";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

export async function geocodeCity(city: string): Promise<GeocodingResult | null> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as {
    results?: Array<{ latitude: number; longitude: number; name: string }>;
  };
  if (!data.results || data.results.length === 0) return null;
  const result = data.results[0]!;
  return {
    lat: result.latitude,
    lon: result.longitude,
  };
}
