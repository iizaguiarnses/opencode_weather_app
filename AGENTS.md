# AGENTS.md

## Entorno de ejecución

Este es un proyecto de **Bun.js** — usa `bun`, no `npm` o `node`. El lockfile es `bun.lock`.

## Estructura del proyecto

```
02-weather/
├── index.ts          # Entry point raíz — importa y ejecuta runMenu() desde src/menu.ts
├── package.json      # Scripts de build, start, dev, test, test:watch, tsc
├── tsconfig.json     # Configuración TypeScript (strict, noEmit: true)
├── bun.lock          # Lockfile de Bun
├── plan.md           # Plan de implementación de referencia
├── ideas-revision.md # Lista de ideas pendientes para revisión
├── src/
│   ├── index.ts      # Entry point secundario — delega a src/menu.ts (usado por `bun run dev`)
│   ├── types.ts      # Tipos compartidos (Settings, WeatherData, GeocodingResult, Units, City, DailyForecast)
│   ├── colors.ts     # Funciones de colores ANSI (cyan, cyanBold, yellow, green, red)
│   ├── storage.ts    # Persistencia en ~/.config/weather-cli/data.json (loadSettings, saveSettings, ensureConfigDir, getConfigDir, getDataFile)
│   ├── geocoding.ts  # Fetch a Geocoding API de OpenMeteo (geocodeCity)
│   ├── forecast.ts   # Fetch a Weather API de OpenMeteo (fetchWeather, fetchDailyForecast, getWeatherDescription) + WEATHER_CODE_MAP
│   └── menu.ts       # Menú interactativo con readline (8 opciones)
└── tests/
    ├── colors.test.ts        # Tests de funciones ANSI
    ├── storage.test.ts       # Tests de persistencia
    ├── geocoding.test.ts     # Tests de geocodificación (mockeando fetch)
    ├── forecast.test.ts      # Tests de weather API + getWeatherDescription
    └── menu.test.ts          # Tests de helper functions (formatDate, etc.)
```

## Ejecución

Ejecuta directamente:

```bash
bun index.ts
```

### Scripts definidos en package.json

- `bun run build` — compila un binario ejecutable: `bun build --compile index.ts --outfile weather`
- `bun run start` — ejecuta la app en modo runtime: `bun run index.ts`
- `bun run dev` — modo desarrollo con watch: `bun run src/index.ts --watch`
- `bun run test` — ejecuta todos los tests: `bun test`
- `bun run test:watch` — ejecuta los tests en modo watch: `bun test --watch`
- `bun run tsc` — verifica tipos sin emitir archivos: `bunx tsc`

## Menú

El menú interactivo ofrece las siguientes 8 opciones:

1. **Clima de ciudad default** — consulta el clima actual para la ciudad marcada como default
2. **Clima de todas las ciudades** — itera sobre todas las ciudades registradas (muestra el conteo entre paréntesis)
3. **Buscar y agregar ciudad** — geocodifica y agrega una nueva ciudad a la lista
4. **Eliminar ciudad** — muestra lista numerada y elimina una ciudad; si era el default, la límpia
5. **Establecer ciudad default** — marca una ciudad registrada como default
6. **Pronóstico de 7 dias** — muestra temp max/min + descripción del cielo para los próximos 7 días, aplicado a la ciudad default y a las ciudades guardadas
7. **Ajustes (°C/°F)** — toggle entre unidades celsius/fahrenheit; se persiste en data.json
8. **Salir** — cierra la aplicación con `process.exit(0)`

## Verificación de tipos

Verifica los tipos con:

```
bunx tsc
```

`tsconfig.json` usa `strict: true` y `noEmit: true`, así que solo verifica los tipos (no genera archivos).

## Testing

Los tests se ejecutan con el test runner nativo de Bun:

```bash
bun test              # run all tests once
bun test --watch      # run in watch mode
```

Los tests viven en `/tests` con la misma estructura que `/src`:

```
tests/
├── colors.test.ts        # Tests de funciones ANSI
├── storage.test.ts       # Tests de persistencia (limpia ~/.config/weather-cli antes cada test)
├── geocoding.test.ts     # Tests de geocodificación (mockeando fetch)
├── forecast.test.ts      # Tests de weather API + getWeatherDescription (mockeando fetch)
└── menu.test.ts          # Tests de helper functions (formatDate, etc.)
```

- **No debes construir la aplicación si el testing falla.**
- Para tests de fetch se usa `jest.fn()` con casteo `as unknown as typeof fetch`.

## Persistencia

Los datos de la aplicación (ciudades registradas, ciudad default, unidades) se guardan en:

```
~/.config/weather-cli/data.json
```

Formato del archivo:

```json
{
  "cities": ["Ottawa", "Madrid"],
  "defaultCity": "Ottawa",
  "units": "celsius"
}
```

Funciones de persistencia en `src/storage.ts`: `loadSettings()`, `saveSettings()`, `ensureConfigDir()`, `getConfigDir()`, `getDataFile()`.

## API Integration

### Geocoding (`src/geocoding.ts`)

```
GET https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=es&format=json
```

Extrae `latitude` y `longitude` del primer resultado.

### Forecast (`src/forecast.ts`)

- **Actual:** `GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m&temperature_unit={unit}`
- **7-day:** `GET https://api.open-meteo.com/v1/forecast?...&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit={unit}&forecast_days=7`

## Colores

Los colores ANSI se usan directamente (sin dependencias externas). El menú usa:
- **Cian / cian bold:** bordes, títulos, prompts
- **Amarillo:** temperaturas
- **Verde:** estados OK / confirmaciones
- **Rojo:** errores / mensajes de fallo

## Notas

- El README (español) describe una aplicación CLI de clima con la API OpenMeteo.
- La aplicación está completa y funcional con un menú interactivo de 8 opciones.
- El pronóstico de 7 días incluye un mapeo de códigos WMO a descripciones en español (ver `WEATHER_CODE_MAP` y `getWeatherDescription` en `src/forecast.ts`).
- No hay CI, hooks pre-commit, ni codegen configurados.
- Tests implementados en `/tests` con el test runner nativo de Bun.
