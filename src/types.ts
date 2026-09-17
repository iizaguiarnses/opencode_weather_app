export type Units = "celsius" | "fahrenheit";

export interface City {
  name: string;
  latitude: number;
  longitude: number;
}

export interface Settings {
  cities: string[];
  defaultCity: string | null;
  units: Units;
}

export interface WeatherData {
  city: string;
  temperature: number;
  units: "°C" | "°F";
  time: string;
}

export interface GeocodingResult {
  lat: number;
  lon: number;
}
