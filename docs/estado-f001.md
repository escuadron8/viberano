# F001 Consultar dudas: estado y siguiente paso

> Copia del Claude Doc [F001 Consultar dudas: estado y siguiente paso](https://claude.ai/code/artifact/40740471-02ca-4f61-aebd-21bcbc8e324a), exportada el 2026-09-27. El original puede ser más reciente: si cambia, se vuelve a exportar aquí.

## Resumen

Las tres historias P1 de F001 (HU1, HU2, HU5) funcionan de punta a punta para el conocimiento oficial; las tres P2 (HU3, HU4, HU6) están sin hacer. De las dos primeras P2 no falta motor sino datos: el chat ya recoge notas personales y compartidas, pero nadie puede crearlas hasta que exista F002.

La decisión para la próxima sesión es si cerramos lo que queda de F001 (corpus real, prueba de aislamiento, demo y búsqueda web) o pasamos a F002 para que existan notas personales y compartidas. Estado a fecha de `main` en el commit `5462d85` (T-23 cerrada).

## Cobertura por historia de usuario

Dos historias están cubiertas, una parcial y tres pendientes. "Cubierto" significa probado en móvil sobre el corpus de relleno (15 documentos de Salesforce generados por Claude), no sobre el corpus real.

| Historia | Prioridad | Estado | Qué hay | Qué falta |
| --- | --- | --- | --- | --- |
| HU1 – Resolver dudas mediante IA | P1 | Cubierto | Chat real conectado a `/api/consulta` con Gemini (T-20, T-21); abstención cuando no hay conocimiento (T-18) | Repetir la prueba con el corpus real (T-15) |
| HU2 – Conocer el origen | P1 | Parcial | Chip "Oficial" en cada respuesta; los chips Compartido, Personal y Web existen en `ChipOrigen` | Solo el escenario 1 (oficial) es demostrable: no hay datos compartidos ni personales, y ningún camino produce el chip web |
| HU3 – Conocimiento personal | P2 | Pendiente | `buscar()` ya filtra `personal` por `autor_id` y hay RLS aplicada | No se pueden crear notas (F002 HU3); la prueba de aislamiento con dos usuarios (T-12) no se ha hecho |
| HU4 – Conocimiento compartido | P2 | Pendiente | El motor ordena y etiqueta `compartido` | No se puede compartir nada (F002 HU4, HU5) |
| HU5 – Evitar respuestas inventadas | P1 | Cubierto | Tres defensas: umbral de relevancia, reglas del prompt con JSON forzado y verificación de citas en servidor, con test automatizado | Sin búsqueda web, la abstención llega antes de lo que pide la spec (no se consulta la web primero) |
| HU6 – Referencias externas en la web | P2 | Pendiente | Nada, salvo el chip visual | Todo: búsqueda, fiabilidad de la fuente, etiqueta "no validado" |

## Requisitos funcionales y casos límite

De los 13 requisitos, 7 están cumplidos, 4 parciales y 2 sin empezar; los dos sin empezar son la búsqueda web.

| Requisito | Estado | Evidencia o hueco |
| --- | --- | --- |
| FR-001 Consultas en lenguaje natural | Cumplido | `/chat` + `/api/consulta` |
| FR-002 Prioridad al conocimiento organizacional | Cumplido | Solo se responde con fragmentos de `conocimiento` |
| FR-003 Identificar el origen | Parcial | Se muestra el tipo de fuente, no el documento concreto (un chip por tipo, sin título) |
| FR-004 Diferenciar los cuatro orígenes | Parcial | Oficial sí; compartido y personal sin datos; web inexistente |
| FR-005 Priorizar lo oficial | Cumplido | Orden `oficial > compartido > personal` en `recuperar()` y regla en el prompt |
| FR-006 Indicar varias fuentes | Cumplido | `multiples_fuentes` → "Varias fuentes" |
| FR-007 No inventar | Cumplido | Verificación de citas en servidor, con test |
| FR-008 Informar si no hay conocimiento | Cumplido | Abstención sin llamar al modelo; falta el paso previo por la web |
| FR-009 Contexto de conversación | Cumplido | Últimos 3 turnos + búsqueda de respaldo (T-22); el contexto se pierde al salir de `/chat` |
| FR-010 Personal solo para su dueño | Parcial | RLS escrita y aplicada; prueba con dos usuarios pendiente (T-12) |
| FR-011 Compartido con su nivel de confianza | Parcial | Motor preparado, sin datos que lo ejerciten |
| FR-012 Buscar en la web como último recurso | Sin empezar | — |
| FR-013 Marcar la web como no validada | Sin empezar | Solo existe el chip visual |

**Casos límite**

- **Resueltos:** sin información en ninguna fuente (abstención), varias preguntas en una conversación (T-22), respuesta que combina fuentes (`multiples_fuentes`) y la aclaración abierta sobre priorizar lo oficial (sí, decidido en `plan.md` §7).
- **Preparados pero sin probar:** contradicción oficial frente a compartido o personal, y varias contribuciones con soluciones distintas. La regla del prompt existe, pero no hay datos compartidos ni personales. También el conocimiento retirado: `buscar()` filtra `estado = 'activo'`, pero no hay forma de retirar nada.
- **Sin cubrir:** los dos casos de la web (contradice lo oficial, fuente de baja calidad).

**Criterios de éxito:** ninguno se mide todavía. SC-003 necesita el botón de reportar (T-24); la columna `mensaje.reportado` ya existe.

## Qué de F001 depende de F002

De lo que falta en F001, solo la búsqueda web (HU6, FR-012, FR-013) se puede hacer sin tocar F002. El resto necesita que exista contenido que hoy nadie puede crear.

| Pendiente de F001 | Lo desbloquea en F002 | Fase del plan |
| --- | --- | --- |
| HU3, FR-010: usar notas personales | HU3 Crear conocimiento personal | 4 |
| HU4, FR-011: usar conocimiento compartido | HU4 Compartir, HU5 Consultar compartido | 4 |
| HU2 escenarios 2 y 3: chips Compartido y Personal | HU3, HU4 | 4 |
| Caso límite: conocimiento retirado | HU2 Mantener actualizado, HU8 Ciclo de vida | 5 |
| Corpus real (T-15) | HU1 Incorporar oficial (hoy se hace con `scripts/cargar-corpus.mts`, sin interfaz) | 2 / 5 |

Según `plan.md`, el motor de consulta recoge las notas personales y compartidas "sin cambios": aparecen como filas nuevas con su `tipo`. Por eso la Fase 4 de F002 cerraría dos historias de F001 casi sin tocar el chat.

## Opciones para la próxima sesión

Propuesta de Claudia: hacer primero la prueba de T-12 y pasar después a la Fase 4 de F002, con el corpus real avanzando en paralelo como trabajo de contenido. Es una propuesta para discutir, no una decisión.

| Opción | Qué incluye | A favor | En contra |
| --- | --- | --- | --- |
| A. Seguir con F001 | T-15 corpus real y recalibrar el umbral, T-24 reportar, T-25 demo end-to-end, HU6 búsqueda web | Cierra el corte mínimo del MVP; demo sólida sobre contenido real | T-15 es escribir documentación, no código; HU6 es P2 y añade un proveedor de búsqueda por decidir |
| B. Pasar a F002 (Fase 4) | Notas personales, compartir, retirar lo compartido sin borrar la copia personal | Cierra HU3 y HU4 de F001 sin tocar el motor; F002 HU3 es P1 | Obliga a cerrar antes la prueba de aislamiento (T-12): el riesgo de fuga de notas personales pasa a ser real |
| C. Mixta (propuesta) | T-12 primero (una sesión con las dos cuentas), después Fase 4; T-15 en paralelo y HU6 al final | Avanza en código sin esperar al corpus; T-12 hace falta en cualquier caso | La demo final (T-25) se retrasa hasta tener corpus real |

En las tres opciones T-12 es el primer paso barato: no está bloqueada, solo necesita a Vanesa y Alex a la vez con dos cuentas reales.

## Preguntas para discutir

- [ ] ¿Sigue siendo la demo (T-25) el objetivo inmediato, ahora que no hay fecha de concurso?
- [ ] ¿Quién escribe el corpus real de T-15, de qué herramienta y cuándo?
- [ ] ¿Cuándo hacemos la prueba de T-12 con las dos cuentas?
- [ ] Para HU6: ¿qué servicio de búsqueda web usamos, cabe en el plan gratuito y cómo decidimos si una fuente externa es fiable?
- [ ] ¿Basta un chip por tipo de fuente, o FR-003 pide mostrar el título del documento citado?
- [ ] ¿Debe la conversación sobrevivir a salir de `/chat`? Hoy cada entrada abre una nueva.
- [ ] En F002, ¿mantenemos "publicar sin moderación, con etiqueta de no validado" (`plan.md` §7) o lo revisamos?
