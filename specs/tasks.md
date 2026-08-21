# Tareas — MVP móvil de TUTOR

**Base**: [plan.md](plan.md) · **Hito**: martes 18 de agosto de 2026

Cada tarea es una unidad que se construye y se prueba en una sesión. El orden es de dependencias: una tarea solo empieza cuando las de `Depende` están cerradas. Cada una tiene una **Prueba** concreta — si no se puede ejecutar, la tarea no está hecha.

**Leyenda de bloqueos**: 🔴 = necesita algo del equipo (cuenta, credencial, corpus, revisión) antes de poder cerrarse.

---

## Resumen

| # | Tarea | Fase | Depende | Bloqueo |
|---|---|---|---|---|
| T-01 | Scaffolding Next.js + TypeScript + Tailwind | 0 | — | |
| T-02 | Tokens del sistema de diseño | 0 | T-01 | |
| T-03 | Componentes base + página de catálogo | 0 | T-02 | |
| T-04 | Despliegue continuo en Vercel | 0 | T-01 | 🔴 GitHub + Vercel |
| T-05 | Shell móvil y rutas de las 4 pantallas | 1 | T-03 | ✅ desplegado |
| T-06 | Pantalla 1 — Onboarding | 1 | T-05 | 🔴 revisión en móvil |
| T-07 | Pantalla 2 — Selección de software | 1 | T-05 | 🔴 revisión en móvil |
| T-08 | Pantalla 3 — Chat (shell con datos falsos) | 1 | T-05 | 🔴 revisión en móvil |
| T-09 | Pantalla 4 — Progreso | 1 | T-05 | 🔴 revisión en móvil |
| T-10 | Proyecto Supabase y clientes | 2 | T-01 | 🔴 proyecto Supabase |
| T-11 | Esquema de base de datos | 2 | T-10 | |
| T-12 | Políticas RLS + prueba de aislamiento | 2 | T-11 | |
| T-13 | Autenticación por magic link | 2 | T-10 | |
| T-14 | Formato del corpus y script de carga | 2 | T-11 | |
| T-15 | Carga del corpus oficial real | 2 | T-14 | 🔴 **corpus escrito** |
| T-16 | Función `buscar()` — FTS aislada | 3a | T-15 | |
| T-17 | Umbral de relevancia y orden de fuentes | 3a | T-16 | 🔴 validar resultados |
| T-18 | Camino de abstención end-to-end | 3a | T-17 | |
| T-19 | Cliente de Claude y contrato de respuesta | 3b | T-01 | 🔴 API key con facturación |
| T-20 | Endpoint `/api/consulta` con verificación de citas | 3b | T-18, T-19 | |
| T-21 | Chat real conectado + chips de origen | 3b | T-08, T-20 | 🔴 preguntas reales |
| T-22 | Contexto de conversación (FR-009) | 3b | T-21 | |
| T-23 | PWA instalable | Cierre | T-04 | |
| T-24 | Botón de reportar respuesta | Cierre | T-21 | |
| T-25 | Pruebas end-to-end en móvil y guion de demo | Cierre | T-21, T-23 | 🔴 ensayo |

**Corte mínimo para el 18**: T-01 → T-22, más T-23 y T-25. T-24 es deseable pero prescindible.

---

## Fase 0 — Fundaciones

### T-01 · Scaffolding Next.js + TypeScript + Tailwind
Proyecto Next.js 15 (App Router) con TypeScript estricto, Tailwind CSS v4 e Inter vía `next/font` (self-hosted, sin CDN). Configuración de `viewport` mobile-first. `.env.example` con las variables que vendrán después.

- **Entregable**: repo que arranca con `npm run dev`.
- **Prueba**: `npm run build` pasa sin errores y `/` renderiza con Inter aplicada (comprobar en devtools que la fuente no viene de un dominio externo).

### T-02 · Tokens del sistema de diseño
Traducir el frontmatter de [Design-tutor.md](diseño/Design-tutor.md) a variables CSS y al `@theme` de Tailwind v4: colores, tipografías (`display-xl`, `heading-md`, `body-md`, `button-md`), `rounded`, `spacing`.

- **Entregable**: `app/globals.css` con todos los tokens; ningún color hardcodeado a partir de aquí.
- **Prueba**: página temporal que pinta cada token con su nombre; los hex coinciden uno a uno con el documento de diseño.

### T-03 · Componentes base + página de catálogo
`Boton`, `Tarjeta`, `CampoTexto`, `BurbujaChat` (variantes ia/usuario con su sombra), `ChipOrigen` (oficial/compartido/personal) y `AnilloProgreso`. Todos consumen solo tokens de T-02.

- **Entregable**: componentes en `components/` + ruta `/catalogo` que los muestra todos.
- **Prueba**: abrir `/catalogo` a 375px de ancho — cada componente coincide con su spec de `components:` en el documento de diseño. Contraste de texto sobre fondo verificado en las burbujas.

### T-04 · Despliegue continuo en Vercel 🔴
Conectar el repo a Vercel. Deploy automático en cada push a `main`.

- **Entregable**: URL pública viva.
- **Prueba**: abrir la URL desde un móvil real y ver `/catalogo` con la tipografía y la paleta correctas. Un push a `main` la actualiza solo.
- **Necesita**: cuenta de GitHub y de Vercel.

---

## Fase 1 — Pantallas

> Todas con datos falsos. Nada toca la base de datos todavía.

### T-05 · Shell móvil y rutas
Layout mobile-first común (ancho máximo, safe areas, cabecera) y las 4 rutas vacías: `/` (onboarding), `/software`, `/chat`, `/progreso`. Navegación entre ellas.

- **Entregable**: las 4 rutas existen y se navega de una a otra.
- **Prueba**: recorrer onboarding → software → chat → progreso en el móvil sin quedarse atascado ni ver scroll horizontal.

### T-06 · Pantalla 1 — Onboarding 🔴
Brújula estelar, headline *"Tutor: Tu guía personal en cada nueva herramienta."*, subtítulo, CTA verde menta que lleva a `/software`.

- **Prueba**: revisión en móvil real; el CTA es alcanzable con el pulgar y navega.

### T-07 · Pantalla 2 — Selección de software 🔴
Tarjetas de Salesforce, Jira, Figma y Tableau. Al elegir una se guarda la herramienta seleccionada (estado en cliente por ahora) y se navega a `/chat`.

- **Prueba**: elegir Jira y ver que el chat muestra "Jira" en la cabecera.

### T-08 · Pantalla 3 — Chat (shell) 🔴
Lista de burbujas, campo de entrada tipo pill, estado de "escribiendo". Respuestas simuladas desde un array local, incluyendo una con chips de origen y una de abstención.

- **Prueba**: escribir un mensaje y ver aparecer la burbuja del usuario y la respuesta simulada con sus chips. El teclado del móvil no tapa el campo de entrada.

### T-09 · Pantalla 4 — Progreso 🔴
Anillo de progreso en verde menta y tarjetas de micro-lecciones recomendadas, con datos falsos.

- **Prueba**: revisión visual en móvil. **Cierre de la Fase 1: las 4 pantallas terminadas.**

---

## Fase 2 — Datos y sesión

### T-10 · Proyecto Supabase y clientes 🔴
Proyecto creado, clientes de navegador y de servidor configurados, variables de entorno en local y en Vercel.

- **Prueba**: una ruta de servidor consulta `select now()` y devuelve la hora, tanto en local como en la URL de Vercel.
- **Necesita**: proyecto Supabase creado.

### T-11 · Esquema de base de datos
Migración con los enums, las tablas `conocimiento`, `conversacion` y `mensaje`, la columna generada `busqueda` (`to_tsvector('spanish', ...)`) y los índices GIN y compuesto de [plan.md §4](plan.md).

- **Entregable**: `supabase/migrations/0001_esquema.sql` versionado en el repo.
- **Prueba**: aplicar la migración desde cero en una base limpia; insertar una fila de `conocimiento` y comprobar que `busqueda` se rellena sola.

### T-12 · Políticas RLS + prueba de aislamiento
Las políticas de la tabla de [plan.md §4](plan.md): `oficial` legible por todos y escribible solo por admin; `compartido` legible por todos, escribible por su autor; `personal` legible y escribible **solo** por `autor_id = auth.uid()`.

- **Prueba** (la más importante de la fase): con dos usuarios distintos, el usuario B **no** ve la fila personal del usuario A — comprobado consultando con el token de B, no leyendo el código. Esto es FR-010.

### T-13 · Autenticación por magic link
Alta y acceso por email, sesión persistida, rutas protegidas, cierre de sesión.

- **Prueba**: pedir el enlace desde el móvil, abrirlo desde el correo del móvil y aterrizar autenticado en `/software`. Recargar y seguir dentro.

### T-14 · Formato del corpus y script de carga
Definir el formato de los documentos (Markdown con frontmatter: `herramienta`, `titulo`) y un script que los lea de una carpeta e inserte en `conocimiento` con `tipo = 'oficial'`. Idempotente: reejecutarlo no duplica.

- **Entregable**: `corpus/` con 2-3 documentos de ejemplo + `scripts/cargar-corpus.ts`, más una nota de una página con el formato para quien escriba el corpus.
- **Prueba**: ejecutar el script dos veces seguidas y ver el mismo número de filas.

### T-15 · Carga del corpus oficial real 🔴
Cargar los 20-30 documentos reales de **una sola herramienta** (Salesforce o Jira).

- **Prueba**: contar filas en `conocimiento` y revisar cinco al azar contra el documento original.
- **Necesita**: **el corpus escrito y validado por el equipo.** Es el riesgo nº1 del plan — si el día de esta tarea no hay material, se aplica el plan B: una herramienta, 15 documentos.

---

## Fase 3a — Recuperación

> Sin llamar al modelo todavía. Toda esta fase es Postgres.

### T-16 · Función `buscar()` — FTS aislada
Una única función `buscar(consulta, herramienta, usuarioId)` que lanza el full-text search en español sobre `conocimiento` y devuelve fragmentos con su `rank`, respetando RLS. **Aislada a propósito**: es lo único que cambia si hay que migrar a `pgvector` (plan B de [plan.md §8](plan.md)).

- **Entregable**: `lib/buscar.ts` con una interfaz de salida estable.
- **Prueba**: script que lanza 10 preguntas conocidas del corpus e imprime los 5 mejores resultados de cada una. Para al menos 8 de las 10, el documento correcto aparece en el top 3.

### T-17 · Umbral de relevancia y orden de fuentes 🔴
Fijar el umbral mínimo de `rank` por debajo del cual se considera que no hay conocimiento suficiente, y ordenar los resultados `oficial > compartido > personal` (FR-005).

- **Prueba**: la batería de T-16 más 5 preguntas deliberadamente fuera del corpus; las 5 caen por debajo del umbral y ninguna de las cubiertas lo hace.
- **Necesita**: alguien del equipo valida que las búsquedas encuentran lo que deberían. Si aquí falla, se activa `pgvector` antes de seguir.

### T-18 · Camino de abstención end-to-end
Endpoint que recibe una pregunta y, cuando no hay resultados por encima del umbral, devuelve directamente "no dispongo de información fiable" **sin llamar al modelo** (FR-008). Es la defensa principal contra la alucinación.

- **Prueba**: llamar al endpoint con una pregunta fuera del corpus y verificar en los logs que no hubo ninguna petición a la API de Claude.

---

## Fase 3b — Generación

### T-19 · Cliente de Claude y contrato de respuesta 🔴
`@anthropic-ai/sdk` con `claude-opus-5`. System prompt con las reglas de abstención y citación, marcado con `cache_control: {type: "ephemeral"}`. Salida estructurada con el esquema `{suficiente, respuesta, fuentes[], multiples_fuentes}` de [plan.md §3](plan.md). Sin `temperature`/`top_p`/`top_k` (Opus 5 los rechaza), `output_config.effort: "low"`, `max_tokens: 4096`, sin streaming.

- **Prueba**: script que envía una pregunta con fragmentos falsos y recibe un JSON que valida contra el esquema. Segunda ejecución: los logs muestran lectura de caché en el system.
- **Necesita**: API key de Anthropic con facturación activa.

### T-20 · Endpoint `/api/consulta` con verificación de citas
Une T-18 y T-19: recuperar → umbral → ordenar → prompt con fragmentos numerados → respuesta estructurada → **verificar en servidor que todo `id` citado existe entre los fragmentos enviados**; si no, descartar la respuesta (FR-007). Persistir pregunta y respuesta en `mensaje`, con las citas en `fuentes`.

- **Prueba**: test que inyecta una respuesta del modelo con un id de fuente inventado y comprueba que el endpoint la rechaza en vez de devolverla. Este test es lo que sostiene SC-002.

### T-21 · Chat real conectado + chips de origen 🔴
Sustituir los datos falsos de T-08 por llamadas a `/api/consulta`. Chips pintados desde `fuentes` con su `tipo`, aviso de "varias fuentes" cuando `multiples_fuentes`, burbuja de abstención cuando `suficiente: false`. Estados de carga y de error.

- **Prueba** en móvil real: (a) una pregunta cubierta responde bien y con chip de origen visible; (b) una pregunta fuera del corpus da el mensaje de abstención. **Cierre de la Fase 3: chat real funcionando.**
- **Necesita**: el equipo prueba con preguntas reales.

### T-22 · Contexto de conversación (FR-009)
Reenviar los últimos N turnos al modelo. Los fragmentos recuperados van solo en el turno actual, no se acumulan.

- **Prueba**: preguntar algo, y después "¿y cómo lo deshago?" sin repetir el sujeto — la respuesta mantiene el hilo.

---

## Cierre

### T-23 · PWA instalable
`manifest.json`, iconos, `theme-color`, service worker mínimo.

- **Prueba**: desde Chrome en Android, "Añadir a pantalla de inicio"; la app abre a pantalla completa con su icono.

### T-24 · Botón de reportar respuesta
Marca `mensaje.reportado = true`. Alimenta la métrica de SC-003.

- **Prueba**: reportar una respuesta y ver la fila actualizada en la base de datos.

### T-25 · Pruebas end-to-end en móvil y guion de demo 🔴
Recorrido completo desde un móvil limpio: instalar → registrarse → elegir herramienta → pregunta cubierta → pregunta no cubierta. Ajustar el corpus según lo que falle. Escribir el guion de la demo.

- **Prueba**: la lista de "definición de hecho" de [plan.md §5](plan.md), marcada entera.

---

## Después del 18 (sin fecha)

**Fase 4 — Conocimiento del usuario**: CRUD de notas personales (F002 HU3) · compartir una nota, con `origen_id` para trazabilidad (F002 HU4) · consultarlas desde el chat, que ya las recoge sin cambios · retirar lo compartido sin borrar la copia personal (F002 FR-008) · **prueba explícita con dos usuarios antes de cerrar la fase** (riesgo de fuga, [plan.md §8](plan.md)).

**Fase 5 — Administración y progreso**: formulario protegido por rol para alta, actualización y retirada de conocimiento oficial (F002 HU1, HU2, HU8) · pantalla de progreso con métricas reales.
