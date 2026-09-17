# Revisión Weather CLI

- [ ] **Colores:** no hay ninguno; falta definir cyan (menú), amarillo (temp), verde/rojo (ok/error).
    -Para los colores usar ANSI directos(sin dependencias nuevas).
    -EL menu debe ir en cian. Borde + titulos en cian. Titulo en cian negrita y borde cian; opciones en color default para mayor legibilidad.
    -Genera el archivo src/colors.ts para la implementacion.
- [ ] **AGENTS.md:** dice que `index.ts` es stub, pero la app ya funciona — hay que actualizarlo.
- [ ] **Ciudades:** geocoding solo trae 1 resultado; nombres ambiguos pueden fallar.
- [ ] **Tests:** no existen; conviene al menos probar storage y las APIs con mocks.
- [ ] **Binario:** compila bien; revisar que `./weather` guarde datos en `~/.config/weather-cli/`.
- [ ] **Escalabilidad:** ¿qué tan fácil será expandir con nuevas funcionalidades?
- [ ] **Carga:** ¿hay estado de carga en las tareas asíncronas?
- [ ] **7 day forecast:** agregar la posibilidad de obtener el pronostico del clima para los proximos 7 dias.
    -El alcance del pronostico debe ser para todas las ciudades. Lista default + ciudades guardadas, mostrando 7 dias para cada una (consistente con opcion 2)
    -Los campos para mostrar por cada dia del pronostico son Temps + condicion. Min/Max por dia + descripcion del cielo(Soleado,Lluvia,etc)