# Tareas — MVP móvil de TUTOR

**Base**: [plan.md](plan.md) · **Sin fecha comprometida**: el proyecto sigue fuera del concurso Viberano, a ritmo propio.

Cada tarea es una unidad que se construye y se prueba en una sesión. El orden es de dependencias: una tarea solo empieza cuando las de `Depende` están cerradas. Cada una tiene una **Prueba** concreta — si no se puede ejecutar, la tarea no está hecha.

**Leyenda de estado**: ✅ cerrada (entregable + prueba pasada) · 🟡 construida pero sin cerrar (falta su prueba o una validación del equipo) · ⬜ sin empezar.

**Leyenda de bloqueos**: 🔴 = necesita algo del equipo (cuenta, credencial, corpus, revisión) antes de poder cerrarse.

---

## Dónde nos quedamos

*Actualizado el 2026-09-27, al cerrar T-23.*

**Cerradas**: T-01 → T-11, T-13, T-14, T-16 → T-23. Toda la Fase 0, la Fase 1, la Fase 2 (salvo T-15), la Fase 3a y la Fase 3b están hechas: **el chat real funciona de punta a punta**, probado en un móvil con sesión, y mantiene el hilo entre turnos (T-22). Del cierre ya está la PWA instalable (T-23), probada en Android y en el PC.

**Construidas pero sin cerrar** (🟡):
- **T-12** — las políticas RLS están escritas y aplicadas (`supabase/migrations/0002_rls.sql`), pero la prueba de aislamiento con dos usuarios (FR-010) no consta ejecutada en ningún sitio. Es la prueba que la propia tarea llama "la más importante de la fase", y vuelve a ser la única deuda de prueba del repo.

**El repo ya tiene suite de tests**: `npm test` (Vitest, ver [docs/historial.md](../docs/historial.md), entrada del 2026-09-22). De aquí en adelante, una tarea cuya prueba se pueda automatizar debería traer su test.

**Siguiente en el camino crítico**: **T-25** (recorrido end-to-end en un móvil limpio y guion de la demo), que ya tiene cerradas sus dos dependencias. T-24 (reportar respuesta) es deseable pero prescindible. **T-15 sigue siendo el riesgo nº1**: hasta que no haya corpus real, el chat responde sobre los 15 documentos de relleno y no se puede recalibrar el umbral de T-17.

**HU6 (referencias externas en la web) ya tiene spec y tareas, sin bloqueos de decisión pendientes** ([specs/F001-HU6 - Referencias externas en la web.md](F001-HU6%20-%20Referencias%20externas%20en%20la%20web.md), Fase 6 más abajo: T-26 a T-31). Decidido (2026-09-28): la búsqueda web se hace con el grounding de Google Search de la propia API de Gemini, sin filtro propio de fiabilidad (se usa lo que el grounding traiga, siempre marcado como no validado), y el conocimiento oficial prevalece siempre sobre la web. **Siguiente paso de HU6: T-26**, el spike técnico para ver cómo encaja el grounding con el contrato JSON estructurado que ya usa `lib/ia.ts` — es el único punto que sigue siendo técnico y no de producto.

---

## Resumen

| # | Tarea | Estado | Fase | Depende | Bloqueo |
|---|---|---|---|---|---|
| T-01 | Scaffolding Next.js + TypeScript + Tailwind | ✅ | 0 | — |  |
| T-02 | Tokens del sistema de diseño | ✅ | 0 | T-01 |  |
| T-03 | Componentes base + página de catálogo | ✅ | 0 | T-02 |  |
| T-04 | Despliegue continuo en Vercel | ✅ | 0 | T-01 | 🔴 GitHub + Vercel |
| T-05 | Shell móvil y rutas de las 4 pantallas | ✅ | 1 | T-03 | ✅ desplegado |
| T-06 | Pantalla 1 — Onboarding | ✅ | 1 | T-05 | ✅ revisado |
| T-07 | Pantalla 2 — Selección de software | ✅ | 1 | T-05 | ✅ revisado |
| T-08 | Pantalla 3 — Chat (shell con datos falsos) | ✅ | 1 | T-05 | ✅ revisado |
| T-09 | Pantalla 4 — Progreso | ✅ | 1 | T-05 | ✅ revisado |
| T-10 | Proyecto Supabase y clientes | ✅ | 2 | T-01 | ✅ proyecto creado |
| T-11 | Esquema de base de datos | ✅ | 2 | T-10 |  |
| T-12 | Políticas RLS + prueba de aislamiento | 🟡 | 2 | T-11 | 🟡 falta la prueba con dos usuarios |
| T-13 | Autenticación por magic link | ✅ | 2 | T-10 | ✅ resuelto |
| T-14 | Formato del corpus y script de carga | ✅ | 2 | T-11 |  |
| T-15 | Carga del corpus oficial real | ⬜ | 2 | T-14 | 🔴 **corpus escrito** |
| T-16 | Función `buscar()` — FTS aislada | ✅ | 3a | T-15 |  |
| T-17 | Umbral de relevancia y orden de fuentes | ✅ | 3a | T-16 | ✅ 10/10 y 4/5 — recalibrar con T-15 |
| T-18 | Camino de abstención end-to-end | ✅ | 3a | T-17 |  |
| T-19 | Cliente de Gemini y contrato de respuesta | ✅ | 3b | T-01 | ✅ key en `.env.local` |
| T-20 | Endpoint `/api/consulta` con verificación de citas | ✅ | 3b | T-18, T-19 | ✅ test de cita inventada en verde |
| T-21 | Chat real conectado + chips de origen | ✅ | 3b | T-08, T-20 | ✅ probado en móvil |
| T-22 | Contexto de conversación (FR-009) | ✅ | 3b | T-21 | ✅ probado con Gemini real |
| T-23 | PWA instalable | ✅ | Cierre | T-04 | ✅ instalada en Android y PC |
| T-24 | Botón de reportar respuesta | ⬜ | Cierre | T-21 |  |
| T-25 | Pruebas end-to-end en móvil y guion de demo | ⬜ | Cierre | T-21, T-23 | 🔴 ensayo |
| T-26 | Spike: grounding de Google Search en Gemini + contrato JSON | ⬜ | 6 (HU6) | T-19 |  |
| T-27 | Marcar sin filtro de fiabilidad + aviso "no validado" | ⬜ | 6 (HU6) | T-26 |  |
| T-28 | Búsqueda web antes de la abstención en `/api/consulta` | ⬜ | 6 (HU6) | T-18, T-26, T-27 |  |
| T-29 | Verificación de citas para fuentes web | ⬜ | 6 (HU6) | T-28 |  |
| T-30 | Chip "Web" + aviso "no validado" en el chat | ⬜ | 6 (HU6) | T-29 |  |
| T-31 | Extender la regla "prioriza oficial" a los fragmentos web | ⬜ | 6 (HU6) | T-28 |  |

**Corte mínimo del MVP**: T-01 → T-22, más T-23 y T-25. T-24 es deseable pero prescindible. **T-26 a T-31 son HU6 (P2), fuera del corte mínimo** — ver la sección **Fase 6** más abajo.

**Queda del corte mínimo**: T-15 y T-25, más cerrar la prueba pendiente de T-12.

---

## Fase 0 — Fundaciones

### T-01 · Scaffolding Next.js + TypeScript + Tailwind ✅
Proyecto Next.js 15 (App Router) con TypeScript estricto, Tailwind CSS v4 e Inter vía `next/font` (self-hosted, sin CDN). Configuración de `viewport` mobile-first. `.env.example` con las variables que vendrán después.

- **Entregable**: repo que arranca con `npm run dev`.
- **Prueba**: `npm run build` pasa sin errores y `/` renderiza con Inter aplicada (comprobar en devtools que la fuente no viene de un dominio externo).

### T-02 · Tokens del sistema de diseño ✅
Traducir el frontmatter de [Design-tutor.md](diseño/Design-tutor.md) a variables CSS y al `@theme` de Tailwind v4: colores, tipografías (`display-xl`, `heading-md`, `body-md`, `button-md`), `rounded`, `spacing`.

- **Entregable**: `app/globals.css` con todos los tokens; ningún color hardcodeado a partir de aquí.
- **Prueba**: página temporal que pinta cada token con su nombre; los hex coinciden uno a uno con el documento de diseño.

### T-03 · Componentes base + página de catálogo ✅
`Boton`, `Tarjeta`, `CampoTexto`, `BurbujaChat` (variantes ia/usuario con su sombra), `ChipOrigen` (oficial/compartido/personal) y `AnilloProgreso`. Todos consumen solo tokens de T-02.

- **Entregable**: componentes en `components/` + ruta `/catalogo` que los muestra todos.
- **Prueba**: abrir `/catalogo` a 375px de ancho — cada componente coincide con su spec de `components:` en el documento de diseño. Contraste de texto sobre fondo verificado en las burbujas.

### T-04 · Despliegue continuo en Vercel ✅
Conectar el repo a Vercel. Deploy automático en cada push a `main`.

- **Entregable**: URL pública viva.
- **Prueba**: abrir la URL desde un móvil real y ver `/catalogo` con la tipografía y la paleta correctas. Un push a `main` la actualiza solo.
- **Necesita**: cuenta de GitHub y de Vercel.

---

## Fase 1 — Pantallas

> Todas con datos falsos. Nada toca la base de datos todavía.

### T-05 · Shell móvil y rutas ✅
Layout mobile-first común (ancho máximo, safe areas, cabecera) y las 4 rutas vacías: `/` (onboarding), `/software`, `/chat`, `/progreso`. Navegación entre ellas.

- **Entregable**: las 4 rutas existen y se navega de una a otra.
- **Prueba**: recorrer onboarding → software → chat → progreso en el móvil sin quedarse atascado ni ver scroll horizontal.

### T-06 · Pantalla 1 — Onboarding ✅
Brújula estelar, headline *"Tutor: Tu guía personal en cada nueva herramienta."*, subtítulo, CTA verde menta que lleva a `/software`.

- **Prueba**: revisión en móvil real; el CTA es alcanzable con el pulgar y navega.

### T-07 · Pantalla 2 — Selección de software ✅
Tarjetas de Salesforce, Jira, Figma y Tableau. Al elegir una se guarda la herramienta seleccionada (estado en cliente por ahora) y se navega a `/chat`.

- **Prueba**: elegir Jira y ver que el chat muestra "Jira" en la cabecera.

### T-08 · Pantalla 3 — Chat (shell) ✅
Lista de burbujas, campo de entrada tipo pill, estado de "escribiendo". Respuestas simuladas desde un array local, incluyendo una con chips de origen y una de abstención.

- **Prueba**: escribir un mensaje y ver aparecer la burbuja del usuario y la respuesta simulada con sus chips. El teclado del móvil no tapa el campo de entrada.

### T-09 · Pantalla 4 — Progreso ✅
Anillo de progreso en verde menta y tarjetas de micro-lecciones recomendadas, con datos falsos.

- **Prueba**: revisión visual en móvil. **Cierre de la Fase 1: las 4 pantallas terminadas.**

---

## Fase 2 — Datos y sesión

### T-10 · Proyecto Supabase y clientes ✅
Proyecto creado, clientes de navegador y de servidor configurados, variables de entorno en local y en Vercel.

- **Prueba**: una ruta de servidor consulta `select now()` y devuelve la hora, tanto en local como en la URL de Vercel.
- **Necesita**: proyecto Supabase creado.

### T-11 · Esquema de base de datos ✅
Migración con los enums, las tablas `conocimiento`, `conversacion` y `mensaje`, la columna generada `busqueda` (`to_tsvector('spanish', ...)`) y los índices GIN y compuesto de [plan.md §4](plan.md).

- **Entregable**: `supabase/migrations/0001_esquema.sql` versionado en el repo.
- **Prueba**: aplicar la migración desde cero en una base limpia; insertar una fila de `conocimiento` y comprobar que `busqueda` se rellena sola.

### T-12 · Políticas RLS + prueba de aislamiento 🟡
Las políticas de la tabla de [plan.md §4](plan.md): `oficial` legible por todos y escribible solo por admin; `compartido` legible por todos, escribible por su autor; `personal` legible y escribible **solo** por `autor_id = auth.uid()`.

- **Prueba** (la más importante de la fase): con dos usuarios distintos, el usuario B **no** ve la fila personal del usuario A — comprobado consultando con el token de B, no leyendo el código. Esto es FR-010.
- **Estado**: las políticas están escritas y aplicadas en `supabase/migrations/0002_rls.sql`, pero la prueba está **aplazada a propósito**: hace falta Vanesa y Alex a la vez, con dos cuentas reales, y cuando tocó hacerla el acceso por enlace mágico estaba roto (el prefetch de los escáneres de correo, ver T-13). Eso ya está resuelto, así que no queda nada bloqueándola. Tampoco es urgente — todavía no hay conocimiento `personal` en la app, que llega en la Fase 4 — pero la tarea no se cierra hasta correrla.

### T-13 · Autenticación por magic link ✅
Alta y acceso por email, sesión persistida, rutas protegidas, cierre de sesión.

- **Prueba**: pedir el enlace desde el móvil, abrirlo desde el correo del móvil y aterrizar autenticado en `/software`. Recargar y seguir dentro.
- **Resuelto**: los escáneres de seguridad de los clientes de correo (prefetch automático del enlace) consumían el token de un solo uso antes de que el usuario hiciera clic. Solución: la plantilla de Magic Link en Supabase enlaza directo a `/auth/confirm` con `token_hash` (sin pasar por el endpoint `/verify` de Supabase, que era donde se consumía), y `ConfirmarAcceso` (`components/ConfirmarAcceso.tsx`) ya no gasta el token al montarse — solo al pulsar el botón "Confirmar e iniciar sesión". Detalle completo en [docs/historial.md](../docs/historial.md).

### T-14 · Formato del corpus y script de carga ✅
Definir el formato de los documentos (Markdown con frontmatter: `herramienta`, `titulo`) y un script que los lea de una carpeta e inserte en `conocimiento` con `tipo = 'oficial'`. Idempotente: reejecutarlo no duplica.

- **Entregable**: `corpus/` con 2-3 documentos de ejemplo + `scripts/cargar-corpus.ts`, más una nota de una página con el formato para quien escriba el corpus.
- **Prueba**: ejecutar el script dos veces seguidas y ver el mismo número de filas.

### T-15 · Carga del corpus oficial real ⬜ 🔴
Cargar los 20-30 documentos reales de **una sola herramienta** (Salesforce o Jira).

- **Prueba**: contar filas en `conocimiento` y revisar cinco al azar contra el documento original.
- **Necesita**: **el corpus escrito y validado por el equipo.** Es el riesgo nº1 del plan — si el día de esta tarea no hay material, se aplica el plan B: una herramienta, 15 documentos.
- **Estado**: sin empezar y sigue siendo el riesgo nº1. Lo que hay en `corpus/` es **relleno generado por Claude** (15 documentos genéricos de Salesforce, commit `221149c`, más uno de Jira), suficiente para probar el pipeline de T-16 a T-20 pero no para la demo ni para calibrar bien el umbral.

---

## Fase 3a — Recuperación

> Sin llamar al modelo todavía. Toda esta fase es Postgres.

### T-16 · Función `buscar()` — FTS aislada ✅
Una única función `buscar(consulta, herramienta, usuarioId)` que lanza el full-text search en español sobre `conocimiento` y devuelve fragmentos con su `rank`, respetando RLS. **Aislada a propósito**: es lo único que cambia si hay que migrar a `pgvector` (plan B de [plan.md §8](plan.md)).

- **Entregable**: `lib/buscar.ts` con una interfaz de salida estable.
- **Prueba**: script que lanza 10 preguntas conocidas del corpus e imprime los 5 mejores resultados de cada una. Para al menos 8 de las 10, el documento correcto aparece en el top 3.
- **Estado**: cerrada contra el corpus de relleno, no contra el real — se adelantó a T-15 a propósito para no bloquear la Fase 3a. `scripts/probar-buscar.mts` (`npm run probar-buscar`).

### T-17 · Umbral de relevancia y orden de fuentes ✅
Fijar el umbral mínimo de `rank` por debajo del cual se considera que no hay conocimiento suficiente, y ordenar los resultados `oficial > compartido > personal` (FR-005).

- **Prueba**: la batería de T-16 más 5 preguntas deliberadamente fuera del corpus; las 5 caen por debajo del umbral y ninguna de las cubiertas lo hace.
- **Necesita**: alguien del equipo valida que las búsquedas encuentran lo que deberían. Si aquí falla, se activa `pgvector` antes de seguir.
- **Estado**: cerrada. 10/10 preguntas cubiertas pasan el umbral y 4/5 fuera de corpus quedan por debajo; el único fallo es un empate numérico real con el corpus de relleno y no justifica `pgvector` (análisis completo en [docs/historial.md](../docs/historial.md), entrada del 2026-09-17). **Pendiente**: recalibrar `UMBRAL_RELEVANCIA` y `MINIMO_COINCIDENCIAS` en `lib/buscar.ts` en cuanto se cargue el corpus real de T-15. Segundo caso para esa recalibración, medido al preparar las preguntas de T-21: **"¿Cómo restablezco mi contraseña?" se abstiene aunque existe el documento** — la pregunta solo aporta 2 lexemas significativos y `MINIMO_COINCIDENCIAS` exige 3 (la variante "¿Cómo cambio la contraseña si la he olvidado?" sí pasa, con rank 0.0739). Bajarlo a 2 es el candidato obvio, comprobando que no reabre los falsos positivos que motivaron subirlo.

### T-18 · Camino de abstención end-to-end ✅
Endpoint que recibe una pregunta y, cuando no hay resultados por encima del umbral, devuelve directamente "no dispongo de información fiable" **sin llamar al modelo** (FR-008). Es la defensa principal contra la alucinación.

- **Prueba**: llamar al endpoint con una pregunta fuera del corpus y verificar en los logs que no hubo ninguna petición a la API de Gemini.

---

## Fase 3b — Generación

### T-19 · Cliente de Gemini y contrato de respuesta ✅
`@google/genai` con `gemini-3.6-flash` (free tier, sin tarjeta — decisión del 2026-09-22, ver [docs/historial.md](../docs/historial.md)). `lib/ia.ts` con `systemInstruction` con las reglas de abstención y citación, y salida estructurada nativa (`responseMimeType: "application/json"` + `responseSchema`) con el esquema `{suficiente, respuesta, fuentes[], multiples_fuentes}` de [plan.md §3](plan.md). Sin streaming.

- **Entregable**: `lib/ia.ts` + `scripts/probar-ia.mts`.
- **Prueba**: `npm run probar-ia` — envía una pregunta con fragmentos falsos y recibe un JSON que valida contra el esquema; una segunda pregunta deliberadamente no cubierta por esos fragmentos se abstiene.
- **Necesita**: pegar una `GEMINI_API_KEY` en `.env.local` — gratis, sin tarjeta, en https://aistudio.google.com/apikey.
- **Estado**: cerrada. La key ya está en `.env.local` y `npm run probar-ia` pasa contra `gemini-3.6-flash` (el `2.5-flash` original quedó descontinuado, ver [docs/historial.md](../docs/historial.md), entrada del 2026-09-22): cita la fuente oficial cuando hay fragmentos relevantes y se abstiene con `suficiente: false` cuando no los hay.

### T-20 · Endpoint `/api/consulta` con verificación de citas ✅
Une T-18 y T-19: recuperar → umbral → ordenar → prompt con fragmentos numerados → respuesta estructurada → **verificar en servidor que todo `id` citado existe entre los fragmentos enviados**; si no, descartar la respuesta y caer a la abstención de T-18 (FR-007).

- **Prueba**: test que inyecta una respuesta del modelo con un id de fuente inventado y comprueba que el endpoint la rechaza en vez de devolverla. Este test es lo que sostiene SC-002.
- **Nota de alcance**: la persistencia en `mensaje` (pregunta, respuesta, `fuentes`) queda para T-21 — ver **Estado** más abajo — hoy `/api/consulta` no recibe `conversacion_id` porque todavía no existe la pantalla que crea y gestiona la conversación. Escribir esa persistencia ahora sería inventar un ciclo de vida de `conversacion` sin que la UI lo haya definido.
- **Entregable**: `app/api/consulta/route.ts` + `tests/api-consulta.test.ts` (`npm test`), la primera suite de tests del repo.
- **Estado**: cerrada. El endpoint recupera, aplica el umbral, llama a `generarRespuesta()` y descarta la respuesta **entera** si algún `id` citado no estaba entre los fragmentos enviados. El test inyecta esa respuesta con un id inventado y comprueba que el endpoint se abstiene en vez de devolverla; cubre además la cita parcialmente inventada, el caso de control con citas válidas, la abstención sin llamar al modelo (T-18) y los 400/401. Se comprobó que el test detecta el fallo de verdad: desactivando la verificación en `route.ts` fallan exactamente los 2 tests de citas. Montaje y decisión de herramienta en [docs/historial.md](../docs/historial.md).

### T-21 · Chat real conectado + chips de origen ✅
Sustituir los datos falsos de T-08 por llamadas a `/api/consulta`. Chips pintados desde `fuentes` con su `tipo`, aviso de "varias fuentes" cuando `multiples_fuentes`, burbuja de abstención cuando `suficiente: false`. Estados de carga y de error. Crear/reutilizar la fila de `conversacion` al entrar al chat de una herramienta y pasar su `id` a `/api/consulta`, que persiste ahí cada `mensaje` (pregunta, respuesta, `fuentes`) — movido aquí desde T-20 porque hasta que existe esta pantalla no hay `conversacion_id` que persistir.

- **Prueba** en móvil real: (a) una pregunta cubierta responde bien y con chip de origen visible; (b) una pregunta fuera del corpus da el mensaje de abstención. **Cierre de la Fase 3: chat real funcionando.**
- **Necesita**: el equipo prueba con preguntas reales.
- **Estado**: cerrada. Probada en un móvil real contra el despliegue de Vercel (2026-09-23): una pregunta cubierta por el corpus responde con su chip de origen visible y una pregunta fuera del corpus da la abstención. Lo que hay:
  - `app/(shell)/chat/page.tsx` ya no tiene ni un dato falso: los dos guiones (el genérico y la secuencia de n8n del vídeo) se han borrado y cada pregunta va a `/api/consulta`. Un chip por **tipo** distinto de fuente (dos documentos oficiales no pintan dos chips), ordenados oficial > compartido > personal como FR-005; "Varias fuentes" cuando `multiples_fuentes`; puntos de "escribiendo" mientras se espera; burbuja con borde de aviso cuando la petición falla; 401 → vuelta a `/login`.
  - **Herramientas sin corpus cargado (hoy Claude y n8n) responden siempre con la abstención de FR-008.** Es correcto, pero conviene saberlo antes de enseñarlo: la demo de verdad es con Salesforce.
  - Conversación nueva en cada entrada al chat, creada con la primera pregunta (`POST /api/conversacion`) y no al abrir la pantalla, para no dejar filas vacías. `/api/consulta` recibe su `id` y persiste los dos mensajes del turno con sus `fuentes`. Si el guardado falla, la respuesta se devuelve igualmente: la persistencia es auditoría, no parte de la respuesta.
  - La herramienta elegida se guarda en `sessionStorage` (`components/HerramientaProvider.tsx`): vivía solo en estado de React y recargar `/chat` dejaba la pantalla sin herramienta que consultar.
  - Un fallo del proveedor de IA devuelve **502**, no una abstención: decir "no dispongo de información fiable" cuando el corpus sí tenía fragmentos sería mentir sobre el corpus.
  - Tests nuevos en `tests/api-consulta.test.ts` y `tests/api-conversacion.test.ts` (19 en total): persistencia del turno, abstención también persistida, normalización del nombre de la herramienta, respuesta devuelta pese a un fallo de guardado, 502 del proveedor y el alta de conversación con el usuario de la sesión. Verificado que detectan el fallo: desactivando normalización y persistencia en `route.ts` fallan exactamente esos 4 tests.
  - Detalle de las decisiones en [docs/historial.md](../docs/historial.md).

### T-22 · Contexto de conversación (FR-009) ✅
Reenviar los últimos N turnos al modelo. Los fragmentos recuperados van solo en el turno actual, no se acumulan.

- **Prueba**: preguntar algo, y después "¿y cómo lo deshago?" sin repetir el sujeto — la respuesta mantiene el hilo.
- **Hecho**. Prueba pasada el 2026-09-24 con Gemini real: tras "¿Cómo fusiono dos cuentas duplicadas?", "¿Y cómo lo deshago?" responde que la fusión no se puede deshacer (cita válida), y "¿Cuál es la capital de Mongolia?" a mitad de conversación se abstiene aunque recibe el fragmento de fusión.
  - `/api/consulta` lee de `mensaje` los últimos **3 turnos** de la conversación (de la base de datos, nunca del cuerpo de la petición) y se los pasa a `generarRespuesta()`. Si la lectura falla, contesta sin contexto.
  - **Búsqueda de respaldo** (`recuperarConContexto()` en `lib/buscar.ts`): la tarea no lo decía, pero sin esto la prueba no podía pasar — "¿y cómo lo deshago?" se abstenía antes de llegar al modelo (un solo lexema contra `MINIMO_COINCIDENCIAS = 3`). Si la pregunta sola no encuentra nada, se repite la búsqueda con las preguntas anteriores del usuario delante. Una pregunta que se sostiene sola se busca igual que antes.
  - Regla 7 en el prompt: el historial sirve para entender la pregunta, no es fuente.
  - Comprobado contra el FTS real: tres seguimientos que solos no encontraban nada traen ahora primero el documento correcto; un cambio de tema no arrastra el tema anterior.
  - 28 tests (antes 19), incluido `tests/buscar.test.ts` (nuevo).
  - Detalle en [docs/historial.md](../docs/historial.md).

---

## Cierre

### T-23 · PWA instalable ✅
`manifest.json`, iconos, `theme-color`, service worker mínimo.

- **Prueba**: desde Chrome en Android, "Añadir a pantalla de inicio"; la app abre a pantalla completa con su icono.
- **Estado**: cerrada. El equipo la ha instalado en Android y también en el PC (anotado el 2026-09-27). Lo que hay (commit `1147ce2`):
  - `app/manifest.ts`: el manifest lo genera Next.js desde aquí, no hay `manifest.json` estático. `display: "standalone"`, `theme_color` `#60A5FA` (el mismo que el `themeColor` del `viewport` en `app/layout.tsx`) y fondo blanco.
  - Iconos de 192 y 512 px, los dos tamaños que Chrome exige para instalar, servidos como rutas (`app/icon-192.png/route.tsx`, `app/icon-512.png/route.tsx`). Comparten el recorte del logo con `app/icon.tsx` y `app/apple-icon.tsx` a través de `lib/icono.tsx`, en vez de repetirlo en cada archivo.
  - `public/sw.js`, registrado desde `components/RegistrarServiceWorker.tsx`: **no cachea nada**. Solo cumple el requisito de instalabilidad, así que la app instalada sigue necesitando red. El modo offline queda fuera del alcance del MVP.

### T-24 · Botón de reportar respuesta ⬜
Marca `mensaje.reportado = true`. Alimenta la métrica de SC-003.

- **Prueba**: reportar una respuesta y ver la fila actualizada en la base de datos.

### T-25 · Pruebas end-to-end en móvil y guion de demo ⬜ 🔴
Recorrido completo desde un móvil limpio: instalar → registrarse → elegir herramienta → pregunta cubierta → pregunta no cubierta. Ajustar el corpus según lo que falle. Escribir el guion de la demo.

- **Prueba**: la lista de "definición de hecho" de [plan.md §5](plan.md), marcada entera.

---

## Fase 6 — Referencias externas en la web (HU6)

**Base**: [specs/F001-HU6 - Referencias externas en la web.md](F001-HU6%20-%20Referencias%20externas%20en%20la%20web.md). Historia P2 de F001, fuera del corte mínimo del MVP. Las decisiones de equipo que bloqueaban T-27 y T-31 ya están tomadas (2026-09-28); solo queda por resolver el spike técnico de T-26.

### T-26 · Spike: grounding de Google Search en Gemini + contrato JSON ⬜
Probar contra la API real de Gemini si el grounding con Google Search (`tools: [{ googleSearch: {} }]`) puede combinarse con `responseSchema` en la misma llamada de `lib/ia.ts`, o si hacen falta dos llamadas (una con grounding para obtener las referencias, otra estructurada que las reciba como fragmentos numerados `[id]`, igual que los del corpus interno).

- **Entregable**: `scripts/probar-busqueda-web.mts` (mismo estilo que `probar-ia.mts`) que lanza una pregunta sin cobertura interna y muestra el `groundingMetadata` devuelto.
- **Prueba**: una pregunta deliberadamente fuera del corpus, con Gemini real, devuelve una respuesta apoyada en resultados de Google Search con sus fuentes.
- **Resuelve**: el punto "[NECESITA ACLARACIÓN: cómo encaja el grounding de Gemini con el contrato JSON actual]" del spec de HU6 — el resultado de este spike se documenta ahí.

### T-27 · Marcar sin filtro de fiabilidad + aviso "no validado" ⬜
Decisión del equipo (2026-09-28): no se aplica ningún criterio propio de fiabilidad sobre los resultados del grounding — lo que Gemini traiga en `groundingMetadata` es lo que se usa, siempre marcado como fuente externa no validada (FR-013). La abstención de HU5 (escenario 3) solo se da cuando el grounding no devuelve ningún resultado, no por "baja calidad" de lo que sí devuelve.

- **Entregable**: la instrucción correspondiente en `REGLAS_SISTEMA` (`lib/ia.ts`) y el texto del aviso que acompaña al chip web (T-30).
- **Prueba**: una consulta sin cobertura interna, con un único resultado web (cualquiera que sea), responde usándolo y con el aviso de "no validado" visible.

### T-28 · Búsqueda web antes de la abstención en `/api/consulta` ⬜
Extender el pipeline: cuando `recuperar()` no supera el umbral de relevancia (el punto donde hoy T-18 se abstiene directamente), llamar a la variante con grounding antes de rendirse.

- **Entregable**: cambios en `app/api/consulta/route.ts` y `lib/ia.ts` (nueva función o extensión de `generarRespuesta()`).
- **Prueba**: (a) sin fragmentos internos pero con resultado web fiable, la respuesta usa la referencia externa; (b) sin fragmentos internos y sin resultado web fiable, se abstiene igual que hoy (HU5, escenario 3).
- **Depende**: T-18 (camino de abstención existente), T-26 y T-27.

### T-29 · Verificación de citas para fuentes web ⬜
Extender (o replicar, según lo que resuelva T-26) la verificación de T-20 para que también cubra las citas de fuentes `web`: ningún `id` citado puede quedarse sin verificar contra lo que devolvió el grounding.

- **Entregable**: verificación en `route.ts` + test.
- **Prueba**: test análogo al de T-20 pero con una cita web inventada — la respuesta se descarta y cae a la abstención.
- **Depende**: T-28.

### T-30 · Chip "Web" + aviso "no validado" en el chat ⬜
Pintar el chip `web` (ya existe en `ChipOrigen`, sin camino que lo produzca hasta ahora) cuando `fuentes` incluya una referencia externa, con el aviso de que no ha sido validada por la organización (FR-013).

- **Prueba** en móvil real: una pregunta sin cobertura interna pero con resultado web fiable pinta el chip "Web" y su aviso.
- **Depende**: T-29.

### T-31 · Extender la regla "prioriza oficial" a los fragmentos web ⬜
Decisión del equipo (2026-09-28): el conocimiento oficial prevalece siempre sobre la web; la web es el último recurso. No hace falta una regla nueva — es la regla 5 de `REGLAS_SISTEMA` en `lib/ia.ts` ("si dos fragmentos se contradicen, prioriza el oficial"), redactada hoy pensando solo en oficial/compartido/personal. Esta tarea es extender su texto para que cubra explícitamente los fragmentos web, como red de seguridad para cualquier turno donde coexistan.

- **Entregable**: regla 5 de `REGLAS_SISTEMA` actualizada.
- **Prueba**: caso de test con un fragmento oficial y uno web contradictorios en el mismo turno — la respuesta prioriza el oficial y lo dice.
- **Depende**: T-28.

---

## Después del MVP (sin fecha)

**Fase 4 — Conocimiento del usuario**: CRUD de notas personales (F002 HU3) · compartir una nota, con `origen_id` para trazabilidad (F002 HU4) · consultarlas desde el chat, que ya las recoge sin cambios · retirar lo compartido sin borrar la copia personal (F002 FR-008) · **prueba explícita con dos usuarios antes de cerrar la fase** (riesgo de fuga, [plan.md §8](plan.md)).

**Fase 5 — Administración y progreso**: formulario protegido por rol para alta, actualización y retirada de conocimiento oficial (F002 HU1, HU2, HU8) · pantalla de progreso con métricas reales.
