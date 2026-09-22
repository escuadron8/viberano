# Tutor

**Tu guía personal en cada nueva herramienta.**

Tutor es un tutor conversacional que ayuda a las personas a aprender un software nuevo en el momento en que lo necesitan, en lugar de buscar entre documentación, tutoriales de YouTube o preguntar a un compañero. Proyecto nacido en el concurso **Viberano 2026**, hoy en desarrollo al margen de él y sin fecha de entrega comprometida.

🔗 **App desplegada**: [tutor-rose-six.vercel.app](https://tutor-rose-six.vercel.app/)

## El problema

Cuando una empresa migra o adopta una herramienta nueva (Salesforce, Jira, n8n...), cada empleado se enfrenta a la misma pregunta en un momento distinto: *"¿cómo hago esto que nunca he hecho?"*. La respuesta suele estar dispersa entre manuales estáticos, vídeos genéricos que no encajan con el caso concreto, o la disponibilidad de un compañero. El resultado es tiempo perdido, frustración y dependencia de terceros justo en el momento en que se necesita avanzar.

## La solución

Tutor es un chat que responde preguntas puntuales sobre la herramienta que la persona está aprendiendo, y hace dos cosas que un chatbot genérico no hace:

- **Cita siempre el origen de la respuesta** — conocimiento oficial, compartido por otros compañeros, personal, o una referencia externa cuando no hay nada mejor — para que el usuario sepa cuánto confiar en lo que lee.
- **Se abstiene cuando no tiene una fuente fiable**, en lugar de inventar una respuesta. Ese "no lo sé" explícito es, para el equipo, el rasgo que más diferencia a Tutor de un chatbot cualquiera.

## Para quién

- **Usuarios finales**: empleados que sufren una migración de herramienta y necesitan resolver dudas puntuales a su propio ritmo, sin depender de un curso completo.
- **Formadores**: quienes aportan el conocimiento oficial y validan lo que el Tutor puede responder.

Lo que Tutor **no** es: un LMS de creación de cursos, un sustituto del soporte técnico humano, ni una integración directa con el software que enseña — el contexto completo de alcance está en [docs/inception.md](docs/inception.md).

## Estado del proyecto

El repositorio empezó siendo un MVP de interfaz con respuestas guionizadas, y desde entonces se ha construido también el motor real por detrás. El desglose tarea a tarea, con el estado de cada una, está en [specs/tasks.md](specs/tasks.md); la arquitectura, en [specs/plan.md](specs/plan.md).

**Lo que ya funciona**:

- Las 4 pantallas del sistema de diseño (onboarding, selección de herramienta, chat y progreso) desplegadas y revisadas en móvil, más `/catalogo` con los componentes aislados (ver [diseño/Design-tutor.md](diseño/Design-tutor.md)).
- Acceso por enlace mágico con Supabase Auth, resistente al prefetch de los escáneres de correo.
- Postgres con el esquema de conocimiento, políticas RLS por tipo de fuente y búsqueda full-text en español con umbral de relevancia y orden `oficial > compartido > personal`.
- `/api/consulta`: si no hay nada por encima del umbral se abstiene **sin llamar al modelo**; si lo hay, llama a Gemini con salida estructurada y **verifica en servidor que cada fuente citada existe de verdad** entre los fragmentos enviados, descartando la respuesta entera si no cuadra.
- **El chat conectado de punta a punta**, probado en un móvil: una pregunta cubierta por el corpus responde con su chip de origen y una pregunta fuera de él recibe la abstención. Cada turno (pregunta, respuesta y fuentes citadas) se guarda para poder auditarlo después.

**Lo que falta**:

- **El corpus oficial real**: lo que hay en `corpus/` son 15 documentos de relleno para probar el pipeline. Es el bloqueo principal, y de él depende recalibrar el umbral de relevancia.
- **El corpus oficial real** (arriba) es también lo que falta para que el chat luzca: hoy responde sobre los 15 documentos de relleno.
- Contexto de conversación entre turnos, PWA instalable y el recorrido end-to-end en un móvil limpio.

## Cómo se prueba

La verificación es en buena parte manual, sobre la propia app, más una suite de tests automatizados (Vitest) que por ahora cubre `/api/consulta` y `/api/conversacion`, y unos scripts de comprobación del motor:

```bash
npm install
npm run dev       # http://localhost:3000, recorre las 4 pantallas
npm test          # suite de tests (Vitest); npm run test:watch para el modo watch
npm run lint      # ESLint (config de Next.js)
npm run build     # build de producción
```

`npm test` no necesita ni red ni base de datos: los tests de [tests/](tests/) sustituyen Supabase, la recuperación y Gemini por dobles. El que sostiene SC-002 inyecta una respuesta del modelo con un id de fuente inventado y comprueba que el endpoint la descarta entera en vez de devolverla.

Los scripts del motor necesitan las variables de [.env.example](.env.example) en un `.env.local` (Supabase y una `GEMINI_API_KEY` del free tier):

```bash
npm run cargar-corpus    # carga corpus/ en la tabla `conocimiento` (idempotente)
npm run probar-buscar    # 10 preguntas conocidas contra la búsqueda full-text
npm run probar-umbral    # las anteriores + 5 fuera de corpus: comprueba la abstención
npm run probar-ia        # contrato de respuesta de Gemini: cita cuando puede, se abstiene cuando no
```

- Recorre el flujo completo en un viewport móvil (la app es mobile-first): onboarding → selección de software → chat → progreso.
- El chat responde de verdad: cada pregunta va a `/api/consulta` y lo que se pinta es lo que devuelve el pipeline (respuesta, chips de origen, o la abstención cuando el corpus no da para responder). Requiere sesión iniciada y el corpus cargado. **Pruébalo con Salesforce**, que es la única herramienta con corpus hoy: n8n y Claude se abstendrán siempre, que es lo correcto pero no luce.
- `/catalogo` es una página de catálogo de componentes (botón, tarjeta, burbuja de chat, chip de origen, anillo de progreso) para verificar visualmente el sistema de diseño de forma aislada.
- En [demos/](demos/) y [pitch/](pitch/) hay grabaciones de las distintas versiones de la app en funcionamiento, usadas como referencia y para el vídeo de presentación del concurso.

## Con qué IA se ha construido

Todo el código de este repositorio se ha escrito mediante **vibe coding**: el equipo partía prácticamente sin experiencia previa de desarrollo y construyó la aplicación a base de prompts con **Claude Code**, iterando pantalla a pantalla sobre las specs de [specs/](specs/) y el diseño de [diseño/Design-tutor.md](diseño/Design-tutor.md). El archivo [AGENTS.md](AGENTS.md) documenta las convenciones que sigue el agente al trabajar en este repo (generado automáticamente por Next.js en cada `next dev`).

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS v4, tokens propios del sistema de diseño de Tutor |
| Datos y sesión | Supabase (Postgres + Auth por enlace mágico + RLS), búsqueda full-text en español |
| Motor de respuesta | API de Gemini (`gemini-3.6-flash`, free tier) con salida estructurada y verificación de citas en servidor |
| Despliegue | Vercel |

## Estructura del repo

```
app/            rutas de Next.js (onboarding, selección, chat, progreso, catálogo) y /api
components/     componentes del sistema de diseño (Boton, Tarjeta, BurbujaChat, ChipOrigen...)
lib/            motor de respuesta: buscar.ts (recuperación) e ia.ts (cliente de Gemini)
supabase/       migraciones: esquema, políticas RLS y función buscar()
corpus/         documentos de conocimiento oficial + FORMATO.md para quien lo escriba
scripts/        carga del corpus y scripts de comprobación del motor
diseño/         especificación visual del producto
docs/           inception ágil del proyecto (propósito, alcance, riesgos)
specs/          especificación funcional, plan de construcción y desglose de tareas
demos/, pitch/  vídeos de demo y material del pitch del concurso
```
