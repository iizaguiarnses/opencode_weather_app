# Plan de Implementación - Weather CLI

## Arquitectura Modular (src/)

| Archivo | Responsabilidad |
|---|---|
| `src/types.ts` | Tipos compartidos (City, Settings, WeatherData, Units) |
| `src/storage.ts` | Persistencia en `~/.config/weather-cli/` (JSON) |
| `src/geocoding.ts` | Fetch a Geocoding API de OpenMeteo |
| `src/forecast.ts` | Fetch a Weather API de OpenMeteo |
| `src/menu.ts` | Menú interactivo con readline |
| `src/index.ts` | Entry point — orquesta todo |

## Persistencia

- **Path:** `~/.config/weather-cli/data.json`
- **Contenido:**
  ```json
  {
    "cities": ["Ottawa", "Madrid"],
    "defaultCity": "Ottawa",
    "units": "celsius"
  }
  ```

## API Integration

### Geocoding (`src/geocoding.ts`)
```
GET https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=es&format=json
```
Extrae `latitude` y `longitude`.

### Forecast (`src/forecast.ts`)
```
GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m&timezone=auto
```

## Toggle de Unidades

- **Estado:** `Settings.units` (`"celsius"` | `"fahrenheit"`)
- **Menú opción 8:** muestra `(°C)` o `(°F)` según estado
- **Al cambiar:** persiste en `data.json`
- **En `forecast.ts`:** pasa el parámetro `temperature_unit=fahrenheit` a la API si corresponde

## Menú (íntegras)

1. **Clima ciudad default** → `forecast.ts` sobre la ciudad por defecto
2. **Clima de todas las ciudades** → itera sobre `storage.cities`
3. **Buscar y agregar ciudad** → `geocoding.ts` → agrega a lista
4. **Eliminar ciudad** → remueve de `storage.cities`
5. **Establecer ciudad default** → setea `storage.defaultCity`
8. **Ajustes (°C/°F)** → toggle de unidades
9. **Salir** → `process.exit(0)`

## Ejecución

```bash
bun index.ts
```

## Verificación de Tipos

```bash
bunx tsc
```
