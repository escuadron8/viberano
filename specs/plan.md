# Plan de construcción — MVP móvil de TUTOR

**Estado**: propuesta · **Base**: [F001](specs/F001-Consultar%20dudas.md), [F002](specs/F002%20-%20Base%20de%20conocimiento.md), [Design-tutor.md](diseño/Design-tutor.md), [inception.md](docs/inception.md)

> **Hito comprometido: martes 18 de agosto de 2026.**
> Alcance para esa fecha: **las 4 pantallas navegables + el motor de respuesta funcionando** sobre conocimiento oficial real, con citación de fuentes y abstención (Fases 0-3).
> Días hábiles disponibles desde hoy (viernes 7): **7** — hoy, 10-14 y el 17.

---

## 1. Decisiones de partida

Las prioridades de la inception son, por este orden: **tiempo → presupuesto → calidad → funcionalidad**. Todo lo que sigue está subordinado a eso.

| Decisión | Elección | Por qué |
|---|---|---|
| Tipo de app | **PWA mobile-first** (web instalable), no app nativa | La inception ya define "aplicación web abierta". Evita stores, firmas, revisiones y builds nativas. Se abre desde un QR en la demo. |
| Sin login social / SSO | Magic link por email | Está en la lista de NOs. Un magic link es 20 líneas de código. |
| Un solo repo, un solo despliegue | Next.js full-stack | Frontend y API en el mismo proyecto: sin CORS, sin dos despliegues, sin contratos que mantener. |
| Búsqueda de conocimiento | **Full-text search de Postgres en español**, no embeddings | Cero coste, cero proveedor extra, cero pipeline de indexado. Con un corpus de demo (decenas de documentos) funciona bien. Si la calidad no llega, se cambia a `pgvector` sin tocar el resto (ver §8). |
| Alcance del MVP | F001 completo + F002 parcial | F001 es la propuesta de valor. De F002 solo lo que F001 necesita para existir. |

### Stack

| Capa | Tecnología | Coste |
|---|---|---|
| App (UI + API) | Next.js 15 (App Router) + TypeScript | — |
| Estilos | Tailwind CSS v4 con los tokens de `Design-tutor.md` | — |
| Tipografía | Inter vía `next/font` (self-hosted, sin CDN) | — |
| Base de datos + Auth | Supabase (Postgres + Auth + Row Level Security) | Free tier |
| IA | API de Claude (`claude-opus-5`) con SDK `@anthropic-ai/sdk` | Consumo por token |
| Despliegue | Vercel (conectado a GitHub, deploy en cada push) | Free tier |

**Por qué Supabase y no un backend propio**: Row Level Security resuelve en la base de datos el requisito más delicado de todo el proyecto — **FR-010, "el conocimiento personal solo para su propietario"**. Sin RLS eso es una condición `WHERE user_id = ...` que hay que acordarse de escribir en cada consulta, y basta olvidarla una vez para tener una fuga de datos en la demo.

---

## 2. Cómo leer las estimaciones

**Este plan no está estimado en días-persona.** El código lo genera la IA: escribir las 4 pantallas es una sesión de trabajo, no una jornada de tecleo. Estimar en días-persona daría un número inflado y engañoso.

Lo que realmente ocupa el calendario es otra cosa:

| Tipo de trabajo | Quién | Se comprime con IA |
|---|---|---|
| Generar código, esquema SQL, componentes, prompts | IA | **Sí**, radicalmente |
| Decidir y revisar (aprobar el esquema, ver cada pantalla en el móvil y decir qué falla) | **Vosotros** | No — son ciclos de ida y vuelta |
| Setup con credenciales (Supabase, API key de Anthropic con facturación, Vercel + GitHub) | **Vosotros** | No — requiere vuestras cuentas |
| **Escribir y validar el corpus de conocimiento oficial** | **Vosotros** | Solo el formato, no el criterio |
| Probar en un móvil real | **Vosotros** | No |

### El cuello de botella real es el corpus

De todo lo anterior, el que decide si esto sale bien es el corpus. La IA puede dar formato a los documentos, pero alguien tiene que decidir **qué entra** y verificar **que es correcto**. Si el corpus está mal, el Tutor responderá con total confianza citando una fuente equivocada — y eso es exactamente el fallo que se ve en una demo y que tira abajo SC-003.

> **Empieza hoy, en paralelo al código.** No esperes al miércoles 12: para entonces ya debería haber material. Objetivo: **20-30 documentos cortos y reales de UNA sola herramienta** (Salesforce o Jira; dos herramientas bien cubiertas baten a cuatro a medias, y una bien cubierta bate a dos a medias para el día 18).

---

## 3. Arquitectura de una respuesta

Este es el corazón del producto. Todo lo demás es carcasa.

```
Pregunta del usuario
      │
      ▼
[1] Recuperar candidatos  ──►  Postgres FTS sobre los 3 tipos de conocimiento
      │                         filtrado por RLS (personal = solo el suyo)
      ▼
[2] ¿Hay resultados con relevancia mínima?
      │
      ├── NO  ──►  Responder "no dispongo de información fiable"  (FR-008)
      │            SIN llamar al modelo. Barato, instantáneo, imposible de alucinar.
      │
      └── SÍ  ──►  [3] Ordenar: oficial > compartido > personal   (FR-005)
                        │
                        ▼
                   [4] Llamada a Claude con salida estructurada:
                        - system: reglas de abstención y citación (cacheado)
                        - user:   pregunta + fragmentos numerados [1]..[n]
                        - output: JSON validado por esquema
                        │
                        ▼
                   [5] Verificación en servidor: toda fuente citada
                        debe existir entre los fragmentos enviados.
                        Si no, se descarta la respuesta.  (FR-007)
                        │
                        ▼
                   [6] Render: burbuja + chips de origen
```

**El paso [2] es la defensa principal contra la alucinación.** El riesgo nº3 de la inception se mitiga sobre todo *no llamando al modelo* cuando no hay nada que citar, no pidiéndole por favor que no invente.

**El paso [5] es la segunda defensa.** El modelo devuelve identificadores de fuente; el servidor comprueba que existen. Es una validación determinista, no una promesa del prompt. Esto es lo que sostiene **SC-002 (100% de respuestas identifican su origen)**.

### Contrato de la respuesta

```ts
// Esquema de salida estructurada (output_config.format)
{
  suficiente: boolean,        // false ⇒ el modelo se abstiene explícitamente
  respuesta: string,
  fuentes: [{
    id: string,                                  // debe existir en los fragmentos
    tipo: "oficial" | "compartido" | "personal"  // FR-004
  }],
  multiples_fuentes: boolean   // FR-006
}
```

Un solo objeto JSON cubre FR-003, FR-004, FR-006 y FR-008 y hace que la UI sea trivial: los chips de origen se pintan desde `fuentes`, y `suficiente: false` pinta la burbuja de "no lo sé".

### Detalles de la llamada al modelo

- **Modelo**: `claude-opus-5`.
- **Sin `temperature` / `top_p` / `top_k`** — Opus 5 los rechaza con 400.
- **Thinking activado** (es el comportamiento por defecto) con `output_config.effort: "low"`. Bajar el effort es la palanca de coste y latencia; **desactivar thinking no lo es** — en Opus 5 con thinking desactivado el modelo puede escribir llamadas a herramientas como texto plano o filtrar etiquetas `<thinking>` en la respuesta.
- **`max_tokens: 4096`** — sin streaming en el MVP. Las respuestas de tutoría son cortas y el JSON estructurado no se renderiza bien a medias. Streaming es una mejora posterior si la latencia molesta en la demo.
- **Prompt caching** en el bloque de system (`cache_control: {type: "ephemeral"}`). El system prompt es idéntico en todas las consultas; cachearlo cuesta ~0,1× en las lecturas. En Opus 5 el mínimo cacheable son 512 tokens, así que el prompt de reglas entra de sobra.
- **Historial**: se reenvían los últimos N turnos de la conversación para cumplir **FR-009** (mantener contexto). Los fragmentos recuperados van solo en el turno actual, no se acumulan.

---

## 4. Modelo de datos

Una sola tabla para todo el conocimiento. Los tres tipos (oficial / compartido / personal) no son tres entidades distintas: son la misma entidad con distinto `tipo` y distinta visibilidad. Separarlos en tres tablas triplicaría las consultas de recuperación sin ganar nada.

```sql
create type tipo_conocimiento as enum ('oficial', 'compartido', 'personal');
create type estado_conocimiento as enum ('activo', 'archivado', 'retirado');

create table conocimiento (
  id           uuid primary key default gen_random_uuid(),
  tipo         tipo_conocimiento not null,
  estado       estado_conocimiento not null default 'activo',
  herramienta  text not null,          -- 'salesforce' | 'jira' | 'figma' | 'tableau'
  titulo       text not null,
  contenido    text not null,
  autor_id     uuid references auth.users(id),   -- null en conocimiento oficial
  origen_id    uuid references conocimiento(id), -- trazabilidad al compartir  (FR-012)
  creado_en    timestamptz not null default now(),
  busqueda     tsvector generated always as
                 (to_tsvector('spanish', titulo || ' ' || contenido)) stored
);

create index on conocimiento using gin (busqueda);
create index on conocimiento (herramienta, tipo, estado);

create table conversacion (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id),
  herramienta text not null,
  creado_en timestamptz not null default now()
);

create table mensaje (
  id uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references conversacion(id) on delete cascade,
  rol text not null,              -- 'usuario' | 'tutor'
  contenido text not null,
  fuentes jsonb,                  -- las citas devueltas, para auditar SC-002/SC-003
  reportado boolean default false,-- alimenta SC-003
  creado_en timestamptz not null default now()
);
```

**Políticas RLS sobre `conocimiento`** (esto *es* FR-010 y FR-011):

| tipo | quién lee | quién escribe |
|---|---|---|
| `oficial` | todos los autenticados | solo rol admin |
| `compartido` | todos los autenticados | su autor |
| `personal` | **solo `autor_id = auth.uid()`** | su autor |

`origen_id` permite **FR-008 de F002**: retirar la contribución compartida (cambiar su `estado`) sin borrar la copia personal del autor.

---

## 5. Calendario hasta el 18 de agosto

Cada fase es desplegable por sí sola. Si algo se tuerce a mitad de semana, lo construido sigue siendo una demo coherente.

| Día | Fase | Qué se hace | Os bloquea a vosotros |
|---|---|---|---|
| **Vie 7** | 0 — Fundaciones | Next.js + TypeScript + Tailwind. Tokens de `Design-tutor.md` a variables CSS. Componentes base: `Boton`, `Tarjeta`, `BurbujaChat`, `CampoTexto`, `AnilloProgreso`. Repo → Vercel. | Cuenta de GitHub + Vercel. **Arrancar el corpus.** |
| **Lun 10** | 1 — Pantallas (1/2) | Onboarding y Selección de software, con datos falsos. | Revisarlas en un móvil real y dar feedback. |
| **Mar 11** | 1 — Pantallas (2/2) | Chat (shell) y Progreso. **Hito: las 4 pantallas terminadas.** | Revisión final del diseño. |
| **Mié 12** | 2 — Datos y sesión | Supabase: esquema de §4, políticas RLS, auth por magic link. Carga del corpus. Endpoint de búsqueda FTS. | Proyecto Supabase creado. **API key de Anthropic con facturación activa.** Corpus entregado. |
| **Jue 13** | 3a — Recuperación | Búsqueda FTS, umbral de relevancia, orden por prioridad de fuente. Camino de abstención (FR-008) funcionando end-to-end. | Validar que las búsquedas encuentran lo que deberían. |
| **Vie 14** | 3b — Generación | Llamada a Claude con salida estructurada, verificación de citas en servidor, render de chips de origen. **Hito: chat real funcionando.** | Probar preguntas reales. |
| *15-16* | *colchón* | *Fin de semana. Margen si algo se desvía.* | |
| **Lun 17** | Cierre | Pruebas end-to-end en móvil, ajuste del corpus según lo que falle, PWA (manifest + icono), guion de demo. | Ensayo de la demo. |
| **Mar 18** | **Entrega** | | |

### Definición de "hecho" para el 18

- [ ] URL pública que se abre e instala desde un móvil.
- [ ] Las 4 pantallas de `Design-tutor.md`, recorribles sin explicaciones.
- [ ] Una pregunta cubierta por la documentación recibe respuesta correcta **con chip de origen visible**.
- [ ] Una pregunta fuera del corpus recibe "no dispongo de información fiable" — **este es el caso que hay que enseñar en la demo**, es lo que diferencia a TUTOR de un chatbot cualquiera.
- [ ] Ninguna respuesta cita una fuente inexistente (verificación del paso [5] activa).

### Después del 18 (pendiente de fecha)

- **Fase 4 — Conocimiento del usuario**: notas personales (F002 HU3), compartirlas (F002 HU4), consultarlas (F002 HU5). El motor de la Fase 3 las recoge sin cambios: solo aparecen más filas en la recuperación, con su `tipo`. Cubre HU3 y HU4 (P2) de F001.
- **Fase 5 — Administración y progreso**: alta/actualización/retirada de conocimiento oficial (F002 HU1, HU2, HU8) mediante un formulario protegido por rol, no un CMS. Pantalla de progreso alimentada por métricas reales.

---

## 6. Trazabilidad de requisitos

| Requisito | Fase | Cómo se cumple |
|---|---|---|
| F001 FR-001, 002 | 3 | Pipeline de recuperación + generación |
| F001 FR-003, 004, 006 | 3 | Campo `fuentes` del JSON estructurado + chips en la UI |
| F001 FR-005 | 3 | Orden `oficial > compartido > personal` antes de construir el prompt |
| F001 FR-007 | 3 | Verificación en servidor de los IDs citados |
| F001 FR-008 | 3 | Umbral de relevancia (corta antes del modelo) + `suficiente: false` |
| F001 FR-009 | 3 | Reenvío de los últimos N turnos |
| F001 FR-010 | 2 | **RLS en Postgres**, no filtros en el código |
| F001 FR-011 | 3, 4 | `tipo` en el chip + orden de prioridad |
| F002 FR-001, 002, 011 | 5 | Formulario de admin + campo `estado` |
| F002 FR-003, 004, 005 | 4 | CRUD de notas + acción de compartir |
| F002 FR-006, 007, 012 | 2, 3 | Columnas `tipo` y `origen_id` |
| F002 FR-008 | 4 | Retirar el compartido cambia su `estado`; la copia personal sobrevive |
| F002 FR-009, 010 | — | **Fuera del MVP** (ver §7) |

**Para el 18 de agosto quedan cubiertos todos los requisitos P1 de F001** (HU1, HU2 y HU5) — que son, según la propia spec, la propuesta de valor del producto.

---

## 7. Preguntas abiertas de las specs, resueltas para el MVP

| Pregunta | Resolución |
|---|---|
| F001: *¿debe priorizarse siempre el conocimiento oficial?* | **Sí.** Ya lo dice FR-005 y es coherente con las suposiciones de ambas specs. Cuando oficial y compartido se contradicen, el Tutor responde con el oficial y lo indica. |
| F002: *¿debe existir moderación antes de publicar conocimiento compartido?* | **No en el MVP.** Se publica directamente, siempre etiquetado como "conocimiento de compañeros, no validado". La moderación es el flujo de F002 HU7/FR-009-010, que queda fuera: es un workflow de aprobación completo (estados, notificaciones, rol revisor) y no aporta nada a la demo. La etiqueta ya protege al usuario, que es lo que importa. |

---

## 8. Riesgos y plan B

| Riesgo | Señal de alarma | Plan B |
|---|---|---|
| **El corpus no llega a tiempo** | El miércoles 12 no hay documentos cargables | Es el riesgo nº1 del calendario. Reducir a **una** herramienta y 15 documentos; es preferible un corpus pequeño y correcto a uno amplio y dudoso |
| El FTS no encuentra lo relevante (sinónimos, "cómo hago X" vs. la redacción del doc) | El jueves 13, preguntas obviamente cubiertas devuelven "no lo sé" | Activar `pgvector` en Supabase + embeddings (Voyage tiene free tier). **Solo cambia la función `buscar()`**; el resto del pipeline es idéntico. Por eso está aislada desde el principio. |
| Latencia percibida alta en móvil | >6-7 s hasta la respuesta | Bajar `effort` a `low`, reducir el nº de fragmentos enviados, y añadir streaming si aun así molesta |
| Coste de API se dispara en pruebas | — | El umbral de la Fase 3 ya evita llamar al modelo en el peor caso. Prompt caching en el system. Límite de consultas por usuario/día si hiciera falta. |
| Fuga de conocimiento personal | — | RLS desde la Fase 2. En el MVP del 18 no hay conocimiento personal todavía, así que el riesgo real llega con la Fase 4: **probar explícitamente con dos usuarios antes de cerrarla** |

---

## 9. Fuera del alcance del MVP

Se descarta explícitamente, para que nadie lo dé por supuesto: moderación y promoción de conocimiento compartido a oficial (F002 HU7), comunidades y equipos configurables (basta "todos" como destino de compartir), personalización del aprendizaje, generación de ejercicios, integración con la herramienta enseñada, app nativa, y modo offline más allá de lo que da la PWA por defecto.

---

## 10. Primer paso

**Hoy, viernes 7**, en paralelo:

1. **Yo**: Fase 0 completa y desplegada — una URL viva con la paleta y la tipografía correctas.
2. **Vosotros**: crear las cuentas (GitHub/Vercel, Supabase, Anthropic con facturación) y **empezar el corpus**. Es lo único que no puedo adelantar por vosotros y lo que marca si el 18 hay demo o no.
