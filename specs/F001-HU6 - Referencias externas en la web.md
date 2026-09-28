# Especificación de historia: Buscar referencias externas cuando no hay conocimiento interno

**Feature base**: [F001 — Consultar conocimiento mediante IA](F001-Consultar%20dudas.md), Historia de Usuario 6

**Creada**: 2026-09-28

**Estado**: Borrador

**Input**

Como usuario, quiero que el Tutor busque referencias externas en la web cuando no exista conocimiento oficial, compartido ni personal sobre mi duda, para obtener una orientación útil en lugar de quedarme sin respuesta, sabiendo que esa información no ha sido validada por la organización.

---

# Problema

Hoy, cuando `recuperar()` no encuentra fragmentos por encima del umbral de relevancia (T-17/T-18), el Tutor se abstiene inmediatamente (FR-008 tal y como está implementado hasta T-23). Eso es correcto para el corazón del producto, pero dejar al usuario sin ninguna orientación en ese punto renuncia a un caso que la propia spec de F001 preveía desde el principio: antes de rendirse, el Tutor debería intentar una búsqueda externa y, si encuentra algo útil, ofrecerlo con claridad sobre su procedencia y su menor nivel de confianza.

Esta especificación cubre exclusivamente esa pieza: qué pasa entre "no hay conocimiento interno suficiente" y "el Tutor se abstiene definitivamente".

---

# Objetivo

Que una consulta sin cobertura en el conocimiento organizacional pase, antes de abstenerse, por una búsqueda de referencias externas en la web, y que si esa búsqueda aporta algo útil, la respuesta lo use dejando explícito que es una fuente externa no validada por la organización.

---

# Fuera de alcance

- Todo lo que ya cubre F001 y no cambia: recuperación interna (T-16/T-17), generación y verificación de citas (T-19/T-20), persistencia de turnos (T-21), contexto de conversación (T-22).
- Moderación o validación humana de las referencias externas.
- Convertir una referencia externa en conocimiento oficial o compartido (eso, si llega a existir, es F002).
- Caché o indexado propio de resultados de búsqueda web.
- Multilingüismo: se asume búsqueda y respuesta en español, igual que el resto del pipeline.

---

# Historia de Usuario 6 – Buscar referencias externas cuando no hay conocimiento interno (Prioridad: P2)

*(copiada literalmente de [F001](F001-Consultar%20dudas.md) para que esta spec sea autocontenida)*

**Como** usuario,

**quiero** que el Tutor busque referencias externas en la web cuando no exista conocimiento oficial, compartido ni personal sobre mi duda,

**para** obtener una orientación útil en lugar de quedarme sin respuesta, sabiendo que esa información no ha sido validada por la organización.

### Por qué esta prioridad

Reduce los casos de abstención, pero no es la propuesta de valor principal (que es el conocimiento organizacional ya validado), de ahí su prioridad P2.

### Test independiente

Realizar una consulta sin conocimiento oficial, compartido ni personal disponible y comprobar que el Tutor recurre a una búsqueda web antes de abstenerse, identificando la respuesta como procedente de una fuente externa.

### Escenarios de aceptación

1. **Dado** que no existe conocimiento oficial, compartido ni personal suficiente para responder, **Cuando** el usuario realiza la consulta, **Entonces** el Tutor busca referencias externas en la web y, si las encuentra, responde utilizándolas.

2. **Dado** que el Tutor utiliza una referencia externa en la web, **Cuando** responde, **Entonces** identifica explícitamente que la información procede de una fuente externa no validada por la organización.

3. **Dado** que tampoco existen referencias externas fiables en la web, **Cuando** el usuario realiza la consulta, **Entonces** el Tutor informa que no dispone de información fiable para responder (Historia de Usuario 5).

---

# Casos límite

*(subconjunto de los de F001 que aplican a esta historia)*

- Una referencia externa en la web contradice al conocimiento oficial de la organización.
- Una referencia externa en la web no puede verificarse como fiable o proviene de una fuente de baja calidad.
- La búsqueda web no devuelve ningún resultado, o devuelve error/timeout del proveedor.
- La consulta no tiene información disponible en ninguna fuente, ni siquiera en la web (cae en HU5).

---

# Requisitos

## Requisitos funcionales

*(FR-012 y FR-013 son los que F001 ya asigna a esta historia; se listan aquí sin renumerar)*

- **FR-012:** El sistema DEBE buscar referencias externas en la web únicamente cuando el conocimiento oficial, compartido y personal no sea suficiente para responder.
- **FR-013:** El sistema DEBE señalar explícitamente que una referencia externa en la web no ha sido validada por la organización y debe tratarse con menor nivel de confianza.

## Decisiones

| Pregunta | Resolución |
| --- | --- |
| Proveedor de búsqueda web | **La búsqueda con base (grounding) en Google Search que ya ofrece la API de Gemini** (`@google/genai`, mismo `MODELO` que `lib/ia.ts`), no un proveedor de búsqueda aparte. Decisión del equipo (2026-09-28): el presupuesto ya no es la restricción para esta pieza — asumen el coste de esta llamada — y usar el grounding del mismo proveedor evita añadir una segunda API, una segunda credencial y un segundo cliente HTTP al proyecto. |
| Criterio de fiabilidad de una referencia externa | **Ninguno.** Decisión del equipo (2026-09-28): no se aplica ningún filtro propio de calidad/fiabilidad sobre lo que devuelve el grounding — lo que Gemini encuentre y traiga en `groundingMetadata` es lo que se usa. La única defensa es la que ya exige FR-013: marcarlo siempre como fuente externa no validada. Consecuencia directa: el escenario 3 de HU6 ("tampoco existen referencias externas fiables") pasa a significar en la práctica *"el grounding no devolvió ningún resultado"*, no *"devolvió resultados pero de baja calidad"* — no hay un segundo filtro que los descarte. |
| Contradicción entre una referencia web y el conocimiento oficial | **El conocimiento oficial prevalece siempre; la web es el último recurso.** Decisión del equipo (2026-09-28): no hace falta una regla nueva — es la misma prioridad que ya aplica la regla 5 de `REGLAS_SISTEMA` en `lib/ia.ts` ("si dos fragmentos se contradicen, prioriza el oficial"), extendida explícitamente para cubrir también los fragmentos web. Como además la búsqueda web solo se dispara cuando el conocimiento interno no alcanza el umbral (T-28), la contradicción directa entre un fragmento oficial *usado en la misma respuesta* y uno web no debería darse en el caso normal; la regla queda como red de seguridad para cualquier variante donde ambos coexistan. |

## Puntos que necesitan decisión antes de poder planificar tareas

- **[NECESITA ACLARACIÓN: cómo encaja el grounding de Gemini con el contrato JSON actual.]** `generarRespuesta()` fuerza `responseMimeType: "application/json"` + `responseSchema` (T-19) para obtener `{suficiente, respuesta, fuentes[], multiples_fuentes}`. El grounding con Google Search se activa como una `tool` (`tools: [{ googleSearch: {} }]` en `@google/genai`) y devuelve sus citas en `groundingMetadata` (chunks + supports), con un formato distinto al de los fragmentos numerados `[id]` que usa el resto del pipeline. Hay que decidir, y probarlo contra la API real, si: (a) tools + `responseSchema` funcionan en la misma llamada, o (b) hacen falta dos llamadas — una con grounding para obtener las referencias, y otra estructurada que las reciba como fragmentos numerados igual que los del corpus interno, reutilizando así la verificación de citas de T-20 sin cambiarla. Pendiente del spike técnico T-26; no es una decisión de producto.

---

# Entidades clave

## Referencia externa (web)

*(copiada de F001, es la única entidad nueva que introduce esta historia)*

Resultado de una búsqueda externa realizada por el Tutor cuando ninguna fuente organizacional aporta una respuesta suficiente. No forma parte del conocimiento organizacional y se presenta siempre marcada como no validada.

---

# Criterios de éxito

*(los de F001 que esta historia puede mover)*

- **SC-001:** El 90% de las consultas reciben una respuesta útil según la valoración de los usuarios — esta historia es la que puede acercar ese número al 90% reduciendo abstenciones.
- **SC-002:** El 100% de las respuestas identifican correctamente el origen del conocimiento utilizado — el chip `web` (ya existe en `ChipOrigen`, sin camino que lo produzca) debe seguir cumpliéndolo.

---

# Suposiciones

- El conocimiento organizacional sigue siendo la fuente de verdad; la web es un recurso secundario que solo se consulta cuando el interno no basta (ya asumido en F001).
- Las referencias externas nunca se presentan con el mismo nivel de confianza que el conocimiento oficial.
- El pipeline actual (recuperar → umbral → generar → verificar citas) se extiende con un paso intermedio antes de la abstención de T-18, no se sustituye.
