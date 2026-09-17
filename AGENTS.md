# AGENTS.md

## Entorno de ejecución

Este es un proyecto de **Bun.js** — usa `bun`, no `npm` o `node`. El lockfile es `bun.lock`.

## Estructura del proyecto

```
02-weather/
├── index.ts          # Entry point — importa y ejecuta runMenu() desde src/menu.ts
├── package.json      # Scripts de build, start, dev
├── tsconfig.json     # Configuración TypeScript (noEmit: true)
├── bun.lock          # Lockfile de Bun
├── plan.md           # Plan de implementación de referencia
├── ideas-revision.md # Lista de ideas pendientes para revisión
└── src/
    ├── index.ts      # Entry point — importa y ejecuta runMenu()
    ├── types.ts      # Tipos compartidos (Settings, WeatherData, GeocodingResult, Units, City, DailyForecast)
    ├── colors.ts     # Funciones de colores ANSI (cyan, cyanBold, yellow, green, red)
    ├── storage.ts    # Persistencia en ~/.config/weather-cli/data.json
    ├── geocoding.ts  # Fetch a Geocoding API de OpenMeteo
    ├── forecast.ts   # Fetch a Weather API de OpenMeteo (actual + 7 day forecast)
    └── menu.ts       # Menú interactivo con readline
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

## Menú

El menú interactivo ofrece las siguientes opciones:

1. Clima de ciudad default
2. Clima de todas las ciudades
3. Buscar y agregar ciudad
4. Eliminar ciudad
5. Establecer ciudad default
6. Pronóstico de 7 dias — muestra temp max/min + descripción del cielo para 7 días, aplicado a ciudad default + ciudades guardadas
7. Ajustes (°C/°F) — toggle de unidades
8. Salir

## Verificación de tipos

Verifica los tipos con:

```bash
bunx tsc
```

`tsconfig.json` ya tiene `"noEmit": true`, así que solo verifica los tipos.

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

## Notas

- El README (español) describe una aplicación CLI de clima con la API OpenMeteo.
- La aplicación está funcional con un menú interactivo que incluye: clima de ciudad default, clima de todas las ciudades, búsqueda y agregado de ciudades, eliminación de ciudades, establecimiento de ciudad default, pronóstico de 7 días (temp max/min + descripción del cielo para 7 días), toggle de unidades (°C/°F) y salida.
- La pronóstico de 7 días incluye un mapeo de códigos WMO a descripciones en español (ver función `getWeatherDescription` en `src/forecast.ts`).
- Los colores ANSI se usan directamente (sin dependencias externas). El menú usa cian, temperaturas amarillas, estados de OK/error verde/rojo.
- No hay CI, hooks pre-commit, ni codegen configurados.
- No existen tests. Ver `ideas-revision.md` para pendientes.
