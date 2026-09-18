# Revisión Weather CLI

- [x] **Colores:** no hay ninguno; falta definir cyan (menú), amarillo (temp), verde/rojo (ok/error).
    -Para los colores usar ANSI directos(sin dependencias nuevas).
    -EL menu debe ir en cian. Borde + titulos en cian. Titulo en cian negrita y borde cian; opciones en color default para mayor legibilidad.
    -Genera el archivo src/colors.ts para la implementacion.
- [ ] **AGENTS.md:** dice que `index.ts` es stub, pero la app ya funciona — hay que actualizarlo.
- [ ] **Ciudades:** geocoding solo trae 1 resultado; nombres ambiguos pueden fallar.
- [ ] **Tests:** implementar todo el testing automatico usando el mismo bun.js.
    -No debemos construir la aplicacion si el testing falla.
    -Crea todo el testing dentro de la carpeta /tests
    -La carpeta de "test" debera tener la misma estructura que la carpeta "src"
- [ ] **Binario:** compila bien; revisar que `./weather` guarde datos en `~/.config/weather-cli/`.
- [ ] **Escalabilidad:** ¿qué tan fácil será expandir con nuevas funcionalidades?
- [ ] **Carga:** ¿hay estado de carga en las tareas asíncronas?
- [x] **7 day forecast:** agregar la posibilidad de obtener el pronostico del clima para los proximos 7 dias.
    -El alcance del pronostico debe ser para todas las ciudades. Lista default + ciudades guardadas, mostrando 7 dias para cada una (consistente con opcion 2)
    -Los campos para mostrar por cada dia del pronostico son Temps + condicion. Min/Max por dia + descripcion del cielo(Soleado,Lluvia,etc)
    -Esta implementacion sera la opcion 6 del menu el proyecto.
- [x] **Numeracion de ciudades:** Agrega a la opcion 2 del menu al final del texto "Clima de todas las ciudades" entre parentesis el numero de ciudades que hay registradas.