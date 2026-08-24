# Tutor

**Tu guía personal en cada nueva herramienta.**

Tutor es un tutor conversacional que ayuda a las personas a aprender un software nuevo en el momento en que lo necesitan, en lugar de buscar entre documentación, tutoriales de YouTube o preguntar a un compañero. Proyecto construido para el concurso **Viberano 2026**.

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

Este repositorio contiene el **MVP de interfaz** del concurso: las pantallas de onboarding, selección de herramienta, chat y progreso, construidas con el sistema de diseño completo (ver [diseño/Design-tutor.md](diseño/Design-tutor.md)). El chat de demo funciona con respuestas guionizadas para poder mostrar en vivo el comportamiento clave del producto (citación de fuentes y abstención) sin depender de infraestructura externa durante la presentación.

La arquitectura completa (Postgres + búsqueda full-text, RLS para separar conocimiento personal, y la llamada real a la API de Claude con verificación de citas en servidor) está diseñada en [specs/plan.md](specs/plan.md) y desglosada tarea a tarea en [specs/tasks.md](specs/tasks.md), pero no forma parte de este MVP de interfaz.

## Cómo se prueba

No hay backend ni suite de tests automatizados en este MVP; la verificación es manual, sobre la propia app:

```bash
npm install
npm run dev      # http://localhost:3000, recorre las 4 pantallas
npm run lint      # ESLint (config de Next.js)
npm run build     # build de producción
```

- Recorre el flujo completo en un viewport móvil (la app es mobile-first): onboarding → selección de software → chat → progreso.
- Prueba especialmente el chat con **n8n**, que tiene una secuencia de demo con turnos guionizados, y con cualquier otra herramienta, que usa un guion genérico con los cuatro casos de fuente (oficial, varias fuentes, referencia web, abstención).
- `/catalogo` es una página de catálogo de componentes (botón, tarjeta, burbuja de chat, chip de origen, anillo de progreso) para verificar visualmente el sistema de diseño de forma aislada.
- En [demos/](demos/) y [pitch/](pitch/) hay grabaciones de las distintas versiones de la app en funcionamiento, usadas como referencia y para el vídeo de presentación del concurso.

## Con qué IA se ha construido

Todo el código de este repositorio se ha escrito mediante **vibe coding**: el equipo partía prácticamente sin experiencia previa de desarrollo y construyó la aplicación a base de prompts con **Claude Code**, iterando pantalla a pantalla sobre las specs de [specs/](specs/) y el diseño de [diseño/Design-tutor.md](diseño/Design-tutor.md). El archivo [AGENTS.md](AGENTS.md) documenta las convenciones que sigue el agente al trabajar en este repo (generado automáticamente por Next.js en cada `next dev`).

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS v4, tokens propios del sistema de diseño de Tutor |
| Despliegue | Vercel |
| Planificado, fuera de este MVP | Supabase (Postgres + Auth + RLS) y API de Claude para el motor de respuesta real — ver [specs/plan.md](specs/plan.md) |

## Estructura del repo

```
app/            rutas de Next.js (onboarding, selección, chat, progreso, catálogo)
components/     componentes del sistema de diseño (Boton, Tarjeta, BurbujaChat, ChipOrigen...)
diseño/         especificación visual del producto
docs/           inception ágil del proyecto (propósito, alcance, riesgos)
specs/          especificación funcional, plan de construcción y desglose de tareas
demos/, pitch/  vídeos de demo y material del pitch del concurso
```
