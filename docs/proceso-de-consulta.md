# Tutor — Especificación del proceso de consulta

> Copia del Claude Doc [Tutor — Especificación del proceso de consulta](https://claude.ai/artifact/JgB6Zo6q2HRPBCkAk2HpoD), exportada el 2026-09-27. El original puede ser más reciente: si cambia, se vuelve a exportar aquí.

## Resumen y alcance

Una pregunta en Tutor recorre cinco etapas: validación, lectura del historial, búsqueda en el corpus, generación con Gemini y verificación de citas. Si la búsqueda no supera el umbral de relevancia, o si el modelo cita algo que no recibió, Tutor se abstiene en lugar de inventar.

Esta especificación describe el comportamiento implementado en `main` (hasta T-23), no el de la especificación funcional completa (`specs/F001-Consultar dudas.md`).

**Cubre:** desde que el usuario pulsa Enviar en `/chat` hasta que la burbuja de respuesta y sus chips de origen aparecen en pantalla, incluida la persistencia del turno.

**No cubre:**

- La búsqueda de referencias externas en la web (FR-012, FR-013): no está implementada. El chip `web` existe en `ChipOrigen`, pero ningún camino lo produce.
- El inicio de sesión y la selección de herramienta, salvo como precondiciones.
- La carga del corpus (`scripts/cargar-corpus.mts`) y la gestión de conocimiento (F002).

## Componentes

Cinco piezas intervienen en una consulta; solo dos hablan con servicios externos (Supabase y Gemini).

| Componente | Dónde | Responsabilidad |
| --- | --- | --- |
| Pantalla de chat | `app/(shell)/chat/page.tsx` | Recoge la pregunta, abre la conversación, llama a la API y pinta respuesta y chips |
| Alta de conversación | `app/api/conversacion/route.ts` | Crea la fila en `conversacion` con la primera pregunta |
| Endpoint de consulta | `app/api/consulta/route.ts` | Orquesta el pipeline: valida, lee historial, busca, genera, verifica y persiste |
| Recuperación | `lib/buscar.ts` + función SQL `buscar()` (`supabase/migrations/0003_buscar.sql`) | Búsqueda de texto completo en español sobre `conocimiento`, umbral y orden por tipo |
| Cliente de IA | `lib/ia.ts` | Construye el prompt, llama a `gemini-3.6-flash` con salida JSON y valida el contrato |

Los datos viven en Supabase (Postgres): `conocimiento` (el corpus), `conversacion` y `mensaje`. Las políticas RLS de T-12 se aplican en todas las lecturas y escrituras, porque todo se hace con el cliente ligado a la sesión del usuario.

## Flujo paso a paso

*El diagrama del proceso (8 pasos, 2 puertas de abstención) solo se ve en el [Claude Doc original](https://claude.ai/artifact/JgB6Zo6q2HRPBCkAk2HpoD).*

Una consulta pasa por dos puertas antes de mostrarse: la búsqueda debe devolver fragmentos y el modelo solo puede citar fragmentos recibidos. Si cualquiera falla, la respuesta es la abstención, que también se guarda.

1. **Enviar.** El usuario escribe en `/chat` y pulsa Enviar. La pantalla añade su burbuja, vacía el campo y muestra el indicador «el tutor está escribiendo». No se puede enviar otra pregunta hasta recibir respuesta.
2. **Abrir conversación.** Solo con la primera pregunta de la visita, el chat llama a `POST /api/conversacion` y guarda el `id` devuelto. Si falla, sigue sin conversación: se puede preguntar, pero no habrá historial ni persistencia.
3. **Validar.** `POST /api/consulta` comprueba que `pregunta` y `herramienta` sean texto no vacío y que haya sesión de Supabase.
4. **Leer historial.** Si hay `conversacion_id`, lee de `mensaje` los últimos 3 turnos (6 mensajes). El historial nunca viene del cliente.
5. **Buscar.** `recuperarConContexto()` busca con la pregunta actual. Si no hay resultados y existen preguntas anteriores, repite la búsqueda con esas preguntas delante.
6. **Generar.** Si hay fragmentos, `generarRespuesta()` envía a Gemini el historial y los fragmentos numerados, y valida el JSON devuelto.
7. **Verificar y guardar.** El servidor comprueba que cada `id` citado estaba entre los fragmentos enviados; si no, descarta la respuesta y se abstiene. Después inserta pregunta y respuesta en `mensaje`.
8. **Pintar.** El chat muestra la respuesta y un chip por cada tipo de fuente distinto, ordenados Oficial, Compartido, Personal.

## Contrato de `POST /api/consulta`

El endpoint recibe un JSON con la pregunta y devuelve siempre la misma forma de respuesta, tanto si responde como si se abstiene; solo los errores cambian de forma.

**Petición**

| Campo | Tipo | Obligatorio | Regla |
| --- | --- | --- | --- |
| `pregunta` | texto | sí | No vacío tras `trim()` |
| `herramienta` | texto | sí | Nombre visible ("Salesforce"); el servidor lo pasa a minúsculas |
| `conversacion_id` | texto o `null` | no | Si viene, texto no vacío. Un id ajeno no lee ni escribe nada (RLS) |

Requiere la cookie de sesión de Supabase.

**Respuesta 200**

```json
{
  "suficiente": true,
  "respuesta": "Ve a la pestaña Leads, abre el registro y pulsa Convertir...",
  "fuentes": [{ "id": "<uuid>", "tipo": "oficial" }],
  "multiples_fuentes": false
}
```

- `suficiente`: `false` en la abstención.
- `fuentes`: ids de fragmentos de `conocimiento` con su tipo (`oficial`, `compartido` o `personal`); vacío en la abstención.
- `multiples_fuentes`: `true` si la respuesta se apoya en más de un fragmento; el chat muestra "Varias fuentes".

**Errores**

| Código | Cuándo | Qué hace el chat |
| --- | --- | --- |
| 400 | Falta `pregunta` o `herramienta`, o `conversacion_id` no es texto | Muestra el mensaje `error` en una burbuja con borde de aviso |
| 401 | No hay sesión | Redirige a `/login?next=/chat` |
| 502 | Gemini falla o devuelve un JSON que no cumple el contrato | Muestra "El tutor no está disponible ahora mismo..." |
| Red | La petición no llega | Muestra "No he podido conectar con el tutor..." |

Los errores se devuelven como `{ "error": "<mensaje>" }`. Un 502 no se persiste.

## Recuperación y contexto de conversación

Un fragmento solo llega al modelo si supera tres filtros: el de la base de datos, el umbral de `recuperar()` y, para preguntas de seguimiento, el respaldo con turnos anteriores.

**1. Función SQL `buscar()`** (búsqueda de texto completo, diccionario `spanish`)

- Convierte la pregunta en lexemas y los une con OR (`|`), no con AND, para que una palabra incidental ("dos", "para") no anule la búsqueda.
- Filtra por `herramienta` exacta, `estado = 'activo'` y, para el tipo `personal`, `autor_id` igual al usuario (FR-010, además de RLS).
- Exige al menos 2 lexemas coincidentes (o todos, si la pregunta solo tiene uno).
- Devuelve como máximo 5 filas ordenadas por `ts_rank`, con `rank` y `coincidencias`.

**2. `recuperar()`** (`lib/buscar.ts`)

- Descarta lo que tenga `rank < 0.042` (`UMBRAL_RELEVANCIA`) o menos de 3 coincidencias (`MINIMO_COINCIDENCIAS`).
- Ordena por tipo (oficial, compartido, personal) y, dentro del tipo, por `rank` descendente (FR-005).

**3. `recuperarConContexto()`: respaldo para seguimientos** (FR-009)

- Primero busca solo con la pregunta actual. Si encuentra algo, usa eso y no mira el historial.
- Si no encuentra nada y hay preguntas anteriores, repite la búsqueda con esas preguntas concatenadas delante de la actual. Ejemplo: "¿Y cómo lo deshago?" solo aporta un lexema, pero junto a la pregunta anterior sí supera el umbral.
- Solo se usan las preguntas del usuario, nunca las respuestas del tutor.

**Historial que recibe el modelo**

- Los últimos 3 turnos (`TURNOS_DE_CONTEXTO`), leídos de `mensaje` en el servidor y ordenados pregunta antes que respuesta.
- Solo texto: los fragmentos de turnos anteriores no se reenvían, así el prompt no crece con la conversación.
- Si la lectura falla, se responde sin contexto en lugar de devolver error.
- Cada entrada a `/chat` abre una conversación nueva: el contexto no sobrevive a salir de la pantalla.

## Generación de la respuesta

`generarRespuesta()` llama a `gemini-3.6-flash` con salida JSON forzada por esquema, y el servidor vuelve a validar forma y citas antes de aceptar nada.

**Mensajes enviados**

1. Instrucción de sistema (`REGLAS_SISTEMA`) con 7 reglas: usar solo los fragmentos del turno, abstenerse si no alcanzan, citar solo ids recibidos, marcar `multiples_fuentes`, priorizar lo oficial ante contradicciones, responder en español en pocas frases, y tratar el historial solo como contexto, nunca como fuente.
2. Los turnos del historial, como `user` (pregunta) y `model` (respuesta).
3. El turno actual: cada fragmento como `[id] (tipo) título` + contenido, separados por `---`, y al final `Pregunta: ...`.

**Tres defensas contra la alucinación**

| Capa | Dónde | Qué hace si falla |
| --- | --- | --- |
| Umbral de relevancia | `recuperar()` | Abstención sin llamar al modelo (FR-008) |
| Reglas del prompt + esquema JSON | `lib/ia.ts` | El modelo devuelve `suficiente: false`; un JSON mal formado da 502 |
| Verificación de citas | `route.ts` | Si algún `id` citado no estaba entre los fragmentos enviados, se descarta la respuesta y se devuelve la abstención (FR-007) |

**Chips de origen en el chat**

- Un chip por tipo distinto, no por cita: dos fuentes oficiales muestran un solo chip "Oficial".
- Orden fijo: Oficial, Compartido, Personal.
- Si `multiples_fuentes` es `true`, se añade el texto "Varias fuentes".
- La abstención no lleva chips porque `fuentes` está vacío.

## Errores y casos límite

La regla general: ante la duda, abstenerse; ante un fallo de infraestructura, dar error y no fingir que no hay documentación.

| Situación | Comportamiento |
| --- | --- |
| Herramienta sin corpus (hoy Claude y n8n) | Siempre abstención. Es lo esperado, no un fallo |
| Pregunta con pocas palabras significativas | Puede abstenerse aunque exista el documento. Caso conocido: "¿Cómo restablezco mi contraseña?" aporta 2 lexemas y el mínimo es 3 |
| Pregunta fuera de tema que empata con una legítima | Puede pasar el umbral (caso "recomendaciones de Einstein"); la frenan la regla 2 del prompt y la verificación de citas |
| Pregunta sin relación a mitad de conversación | El respaldo puede traer fragmentos del tema anterior; mismas defensas que el caso anterior |
| Gemini falla o devuelve JSON inválido | 502 y mensaje de reintento; no se persiste |
| Falla la lectura del historial | Se responde sin contexto |
| Falla la persistencia del turno | Se devuelve la respuesta igualmente; el error queda en el log del servidor |
| Falla el alta de conversación | Se puede preguntar, sin historial ni persistencia |
| Sesión caducada con el chat abierto | 401 y redirección a `/login?next=/chat` |

Pendiente: recalibrar `UMBRAL_RELEVANCIA` y `MINIMO_COINCIDENCIAS` cuando se cargue el corpus real (ver `docs/historial.md`).

## Referencias de código

| Archivo | Qué contiene |
| --- | --- |
| `app/(shell)/chat/page.tsx` | `enviar()`, `asegurarConversacion()`, `tiposDeFuente()` |
| `app/api/conversacion/route.ts` | Alta de la fila en `conversacion` |
| `app/api/consulta/route.ts` | `POST`, `leerHistorial()`, `persistirTurno()`, verificación de citas, `TURNOS_DE_CONTEXTO` |
| `lib/buscar.ts` | `buscar()`, `recuperar()`, `recuperarConContexto()`, `normalizarHerramienta()`, umbrales |
| `lib/ia.ts` | `generarRespuesta()`, `REGLAS_SISTEMA`, `ESQUEMA_RESPUESTA`, `validarContrato()` |
| `supabase/migrations/0003_buscar.sql` | Función SQL `buscar()` |
| `components/ChipOrigen.tsx` | Etiquetas y estilos de los chips |
| `specs/F001-Consultar dudas.md` | Requisitos FR-001 a FR-013 |
| `docs/historial.md` | Decisiones de calibración y falsos negativos conocidos |
