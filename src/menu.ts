import { stdin, stdout } from "node:process";
import readline from "node:readline";
import type { Settings, WeatherData, GeocodingResult, Units, DailyForecast } from "./types";
import { loadSettings, saveSettings } from "./storage";
import { geocodeCity } from "./geocoding";
import { fetchWeather, fetchDailyForecast, getWeatherDescription } from "./forecast";
import { cyan, cyanBold, yellow, green, red } from "./colors";

const rl = readline.createInterface({ input: stdin, output: stdout });

function prompt(message: string): Promise<string> {
  return new Promise((resolve) => rl.question(message, resolve));
}

function printWeather(w: WeatherData): void {
  console.log(
    `\n  ${w.city}: ${yellow(`${w.temperature}${w.units}`)} (${w.time})\n`
  );
}

function printDivider(): void {
  console.log(cyan("═".repeat(39)));
}

export async function runMenu(): Promise<void> {
  let settings = loadSettings();

  while (true) {
    const unitsLabel = settings.units === "celsius" ? "°C" : "°F";
    console.clear();
    printDivider();
    console.log(cyanBold("        WEATHER CLI"));
    printDivider();
    console.log("  1. Clima de ciudad default");
    console.log("  2. Clima de todas las ciudades");
    console.log("  3. Buscar y agregar ciudad");
    console.log("  4. Eliminar ciudad");
    console.log("  5. Establecer ciudad default");
    console.log("  6. Pronostico de 7 dias");
    console.log(`  7. Ajustes (${unitsLabel})`);
    console.log("  8. Salir");
    printDivider();

    const option = (await prompt(cyan("  Selecciona una opción: "))).trim();

    switch (option) {
      case "1": {
        await showDefaultCityWeather(settings);
        break;
      }
      case "2": {
        await showAllCitiesWeather(settings);
        break;
      }
      case "3": {
        settings = await searchAndAddCity(settings);
        break;
      }
      case "4": {
        settings = await removeCity(settings);
        break;
      }
      case "5": {
        settings = await setDefaultCity(settings);
        break;
      }
      case "6": {
        await show7DayForecast(settings);
        break;
      }
      case "7": {
        settings = await toggleUnits(settings);
        break;
      }
      case "8": {
        rl.close();
        process.exit(0);
      }
      default:
        console.log(`\n  ${red("Opción no válida.")}\n`);
        await prompt("  Presiona Enter para continuar...");
    }
  }
}

async function showDefaultCityWeather(settings: Settings): Promise<void> {
  if (!settings.defaultCity) {
    console.log("\n  No hay ciudad por defecto establecida.\n");

    await prompt("  Presiona Enter para continuar...");
    return;
  }
  try {
    const coords = await geocodeCity(settings.defaultCity);
    if (!coords) {
      console.log(`\n  ${red(`No se encontró la ciudad: ${settings.defaultCity}`)}\n`);
      await prompt("  Presiona Enter para continuar...");
      return;
    }
    const weather = await fetchWeather(settings.defaultCity, coords, settings.units);
    printWeather(weather);
    await prompt("  Presiona Enter para continuar...");
  } catch (err) {
    console.log(`\n  ${red(`Error: ${(err as Error).message}`)}\n`);
    await prompt("  Presiona Enter para continuar...");
  }
}

async function showAllCitiesWeather(settings: Settings): Promise<void> {
  if (settings.cities.length === 0) {
    console.log("\n  No hay ciudades registradas.\n");
    await prompt("  Presiona Enter para continuar...");
    return;
  }
  for (const city of settings.cities) {
    try {
      const coords = await geocodeCity(city);
      if (!coords) {
        console.log(`\n  No se encontró: ${city}\n`);
        continue;
      }
       const weather = await fetchWeather(city, coords, settings.units);
       printWeather(weather);
     } catch (err) {
       console.log(`\n  ${red(`Error en ${city}: ${(err as Error).message}`)}\n`);
     }
  }
  await prompt("  Presiona Enter para continuar...");
}

async function searchAndAddCity(settings: Settings): Promise<Settings> {
  const input = (await prompt("\n  Ingresa el nombre de la ciudad: ")).trim();
   if (!input) {
    console.log(`\n  ${red("Nombre inválido.")}\n`);
    await prompt("  Presiona Enter para continuar...");
    return settings;
  }
  const coords = await geocodeCity(input);
  if (!coords) {
    console.log(`\n  ${red(`No se encontró la ciudad: ${input}`)}\n`);
    await prompt("  Presiona Enter para continuar...");
    return settings;
  }
  if (settings.cities.includes(input)) {
    console.log(`\n  ${input} ya está registrada.\n`);
    await prompt("  Presiona Enter para continuar...");
    return settings;
  }
  const newSettings: Settings = {
    ...settings,
    cities: [...settings.cities, input],
  };
   saveSettings(newSettings);
  console.log(`\n  ${green(`${input} agregada exitosamente.`)}\n`);
  await prompt("  Presiona Enter para continuar...");
  return newSettings;
}

async function removeCity(settings: Settings): Promise<Settings> {
  if (settings.cities.length === 0) {
    console.log("\n  No hay ciudades registradas.\n");
    await prompt("  Presiona Enter para continuar...");
    return settings;
  }
  console.log("\n  Ciudades registradas:");
  settings.cities.forEach((c, i) => console.log(`    ${i + 1}. ${c}`));
  const input = await prompt("\n  Ingresa el número de la ciudad a eliminar: ");
     const index = parseInt(input.trim(), 10) - 1;
  if (isNaN(index) || index < 0 || index >= settings.cities.length) {
    console.log(`\n  ${red("Número inválido.")}\n`);
    await prompt("  Presiona Enter para continuar...");
    return settings;
  }
  const removed = settings.cities[index]!;
  const newSettings: Settings = {
    ...settings,
    cities: settings.cities.filter((_, i) => i !== index),
  };
  if (newSettings.defaultCity === removed) {
    newSettings.defaultCity = null;
  }
  saveSettings(newSettings);
  console.log(`\n  ${green(`${removed} eliminada.`)}\n`);
  await prompt("  Presiona Enter para continuar...");
  return newSettings;
}

async function setDefaultCity(settings: Settings): Promise<Settings> {
  if (settings.cities.length === 0) {
    console.log("\n  No hay ciudades registradas. Agrega una primero.\n");
    await prompt("  Presiona Enter para continuar...");
    return settings;
  }
  console.log("\n  Ciudades registradas:");
  settings.cities.forEach((c, i) =>
    console.log(`    ${i + 1}. ${c}${c === settings.defaultCity ? " (default)" : ""}`)
  );
   const input = await prompt("\n  Ingresa el número de la ciudad a establecer como default: ");
  const index = parseInt(input.trim(), 10) - 1;
  if (isNaN(index) || index < 0 || index >= settings.cities.length) {
    console.log(`\n  ${red("Número inválido.")}\n`);
    await prompt("  Presiona Enter para continuar...");
    return settings;
  }
  const city = settings.cities[index]!;
  const newSettings: Settings = { ...settings, defaultCity: city };
  saveSettings(newSettings);
  console.log(`\n  ${green(`${city} establecida como ciudad default.`)}\n`);
  await prompt("  Presiona Enter para continuar...");
  return newSettings;
}

async function toggleUnits(settings: Settings): Promise<Settings> {
  const newUnits: Units = settings.units === "celsius" ? "fahrenheit" : "celsius";
  const newSettings: Settings = { ...settings, units: newUnits };
  saveSettings(newSettings);
  const label = newUnits === "celsius" ? "°C" : "°F";
  console.log(`\n  ${green(`Unidades cambiadas a ${label}.`)}\n`);
  await prompt("  Presiona Enter para continuar...");
  return newSettings;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const day = dayNames[date.getDay()];
  const dayNum = String(date.getDate()).padStart(2, "0");
  const monthNames = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  const month = monthNames[date.getMonth()];
  return `${day} ${dayNum} ${month}`;
}

function printDailyForecast(city: string, forecasts: DailyForecast[], units: Units): void {
  const unitLabel = units === "celsius" ? "°C" : "°F";
  console.log(`\n  ${cyanBold(city)}`);
  console.log(cyan("  " + "─".repeat(35)));
  for (const f of forecasts) {
    const desc = getWeatherDescription(f.weatherCode);
    console.log(
      `  ${formatDate(f.date)} | ${yellow(`${f.tempMax}${unitLabel}`)} / ${f.tempMin}${unitLabel} | ${desc}`
    );
  }
  console.log("");
}

async function show7DayForecast(settings: Settings): Promise<void> {
  const citiesToFetch: string[] = [];
  if (settings.defaultCity) {
    citiesToFetch.push(settings.defaultCity);
  }
  citiesToFetch.push(...settings.cities);

  if (citiesToFetch.length === 0) {
    console.log("\n  No hay ciudades registradas.\n");
    await prompt("  Presiona Enter para continuar...");
    return;
  }

  for (const city of citiesToFetch) {
    try {
      const coords: GeocodingResult | null = await geocodeCity(city);
      if (!coords) {
        console.log(`\n  ${red(`No se encontro: ${city}`)}\n`);
        continue;
      }
      const forecasts = await fetchDailyForecast(coords, settings.units);
      printDailyForecast(city, forecasts, settings.units);
    } catch (err) {
      console.log(`\n  ${red(`Error en ${city}: ${(err as Error).message}`)}\n`);
    }
  }
  await prompt("  Presiona Enter para continuar...");
}
