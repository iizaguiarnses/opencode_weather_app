# AGENTS.md

## Entorno de ejecución

Este es un proyecto de **Bun.js** — usa `bun`, no `npm` o `node`. El lockfile es `bun.lock`.

## Ejecución

No hay scripts definidos en `package.json`. Ejecuta directamente:

```bash
bun index.ts
```

## Verificación de tipos

No existen scripts de lint/format/test. Verifica los tipos con:

```bash
bunx tsc
```

`tsconfig.json` ya tiene `"noEmit": true`, así que solo verifica los tipos.

## Notas

- El README (español) describe una aplicación CLI de clima con la API OpenMeteo; `index.ts` actualmente es solo un placeholder.
- No hay CI, hooks pre-commit, ni codegen configurados.
