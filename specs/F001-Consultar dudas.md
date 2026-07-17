# Especificación de Feature: Consultar conocimiento mediante IA

**Rama**: `001-consultar-conocimiento-ia`

**Creada**: 2026-07-17

**Estado**: Borrador

**Input**

Como usuario que está aprendiendo una nueva herramienta de software, quiero poder realizar preguntas en lenguaje natural y obtener respuestas fiables utilizando el conocimiento disponible en la organización, sabiendo siempre de dónde procede cada respuesta y evitando que la IA invente información cuando no exista conocimiento suficiente.

---

# Problema

Durante la adopción de nuevas herramientas digitales, los usuarios necesitan resolver dudas rápidamente para continuar con su trabajo.

La información necesaria puede encontrarse en distintas fuentes: documentación oficial de la organización, conocimiento compartido por otros compañeros o conocimiento personal generado por el propio usuario durante su aprendizaje.

Actualmente este conocimiento se encuentra disperso y resulta difícil localizar la respuesta adecuada en el momento oportuno.

El usuario necesita un asistente capaz de consultar el conocimiento organizacional, identificar el origen de cada respuesta y comunicar claramente el nivel de confianza de la información proporcionada.

Cuando ninguna fuente de conocimiento aporte una respuesta suficientemente fiable, el Tutor debe reconocer esta situación, indicarlo explícitamente y nunca generar información inventada.

---

# Objetivo

Permitir que un usuario consulte mediante lenguaje natural el conocimiento disponible en la organización y obtenga respuestas transparentes, fiables y contextualizadas, indicando siempre el origen de la información utilizada y respetando el nivel de confianza asociado a cada fuente de conocimiento.

---

# Fuera de alcance

Esta feature NO incluye:

- Gestión del conocimiento organizacional (Feature 002).
- Creación o edición de documentos.
- Validación de conocimiento compartido.
- Personalización del aprendizaje.
- Seguimiento del progreso.
- Generación de ejercicios.
- Soporte humano.
- Integración con la herramienta objeto de formación.

---

# Escenarios de usuario y pruebas

## Historia de Usuario 1 – Resolver dudas mediante IA (Prioridad: P1)

**Como** usuario que está aprendiendo una nueva herramienta,

**quiero** realizar preguntas en lenguaje natural,

**para** obtener respuestas que me permitan continuar trabajando sin tener que buscar manualmente la información.

### Por qué esta prioridad

Es la propuesta de valor principal del producto. Sin esta capacidad el Tutor deja de cumplir su propósito.

### Test independiente

Realizar consultas sobre distintos temas y comprobar que el Tutor responde utilizando únicamente conocimiento disponible.

### Escenarios de aceptación

1. **Dado** que existe conocimiento suficiente para responder una consulta, **Cuando** el usuario realiza una pregunta, **Entonces** el Tutor proporciona una respuesta basada en dicho conocimiento.

2. **Dado** que no existe conocimiento suficiente para responder, **Cuando** el usuario realiza la consulta, **Entonces** el Tutor informa claramente que no dispone de información fiable y no inventa una respuesta.

---

## Historia de Usuario 2 – Conocer el origen del conocimiento (Prioridad: P1)

**Como** usuario,

**quiero** conocer el origen de la información utilizada por el Tutor,

**para** valorar el grado de confianza que debo otorgar a la respuesta.

### Por qué esta prioridad

La transparencia aumenta la confianza del usuario y evita confundir conocimiento oficial con conocimiento colaborativo o personal.

### Test independiente

Realizar consultas cuya respuesta proceda de distintas fuentes de conocimiento y verificar que el origen se muestra correctamente.

### Escenarios de aceptación

1. **Dado** que una respuesta utiliza documentación oficial, **Cuando** el Tutor responde, **Entonces** identifica claramente que la fuente es conocimiento oficial.

2. **Dado** que una respuesta utiliza conocimiento compartido por otros usuarios, **Cuando** el Tutor responde, **Entonces** indica que la información procede de conocimiento colaborativo.

3. **Dado** que la respuesta utiliza conocimiento personal del usuario, **Cuando** el Tutor responde, **Entonces** identifica que procede de sus notas o aprendizajes personales.

---

## Historia de Usuario 3 – Utilizar conocimiento personal (Prioridad: P2)

**Como** usuario,

**quiero** que el Tutor pueda utilizar también mis notas personales,

**para** aprovechar el conocimiento que he ido construyendo durante mi proceso de aprendizaje.

### Por qué esta prioridad

El conocimiento personal aporta valor al propio usuario sin afectar al resto de la organización.

### Test independiente

Crear conocimiento personal y comprobar que el Tutor puede utilizarlo únicamente para ese usuario.

### Escenarios de aceptación

1. **Dado** que el usuario dispone de notas personales relacionadas con la consulta, **Cuando** realiza una pregunta, **Entonces** el Tutor puede utilizarlas como parte de la respuesta indicando claramente su origen.

---

## Historia de Usuario 4 – Aprovechar conocimiento compartido (Prioridad: P2)

**Como** usuario,

**quiero** consultar también el conocimiento compartido por otros compañeros,

**para** beneficiarme de su experiencia y aprender formas más eficientes de realizar una tarea.

### Por qué esta prioridad

El aprendizaje colaborativo acelera la adopción de nuevas herramientas y evita duplicar esfuerzos.

### Test independiente

Realizar consultas relacionadas con contribuciones compartidas y verificar que el Tutor las incorpora correctamente.

### Escenarios de aceptación

1. **Dado** que existen contribuciones compartidas relacionadas con la consulta, **Cuando** el Tutor responde, **Entonces** las incorpora identificándolas como conocimiento colaborativo.

---

## Historia de Usuario 5 – Evitar respuestas inventadas (Prioridad: P1)

**Como** usuario,

**quiero** que el Tutor nunca invente respuestas,

**para** poder confiar en la información recibida.

### Por qué esta prioridad

La confianza constituye el principal valor del producto.

### Test independiente

Realizar preguntas para las que no exista conocimiento disponible.

### Escenarios de aceptación

1. **Dado** que ninguna fuente de conocimiento contiene información suficiente, **Cuando** el usuario realiza una consulta, **Entonces** el Tutor responde indicando que no dispone de información fiable para responder.

---

# Casos límite

- La información oficial y la colaborativa ofrecen respuestas diferentes.
- Existen varias contribuciones compartidas con soluciones distintas.
- El conocimiento personal contradice la documentación oficial.
- Una respuesta requiere combinar varias fuentes de conocimiento.
- La consulta no tiene información disponible en ninguna fuente.
- El usuario realiza varias preguntas diferentes en una misma conversación.
- El conocimiento utilizado ha sido retirado recientemente.
- [NECESITA ACLARACIÓN: ¿debe priorizarse siempre el conocimiento oficial cuando exista?]

---

# Requisitos

## Requisitos funcionales

- **FR-001:** El sistema DEBE permitir realizar consultas en lenguaje natural.
- **FR-002:** El sistema DEBE responder utilizando únicamente conocimiento disponible dentro del conocimiento organizacional.
- **FR-003:** El sistema DEBE identificar el origen de toda la información utilizada en una respuesta.
- **FR-004:** El sistema DEBE diferenciar claramente conocimiento oficial, conocimiento compartido y conocimiento personal.
- **FR-005:** El sistema DEBE priorizar el conocimiento oficial cuando existan varias fuentes para responder la misma consulta.
- **FR-006:** El sistema DEBE indicar cuando una respuesta utiliza varias fuentes de conocimiento.
- **FR-007:** El sistema DEBE impedir generar respuestas basadas en conocimiento inexistente o no respaldado.
- **FR-008:** El sistema DEBE informar explícitamente cuando no exista conocimiento suficiente para responder.
- **FR-009:** El sistema DEBE mantener el contexto de una conversación para responder preguntas relacionadas.
- **FR-010:** El sistema DEBE utilizar el conocimiento personal únicamente para su propietario.
- **FR-011:** El sistema DEBE utilizar conocimiento compartido respetando su nivel de confianza y diferenciándolo del conocimiento oficial.

---

# Entidades clave

## Consulta

Pregunta realizada por un usuario mediante lenguaje natural.

---

## Respuesta

Información generada por el Tutor para responder una consulta.

---

## Fuente de conocimiento

Origen de la información utilizada para construir una respuesta.

Puede corresponder a:

- Conocimiento oficial.
- Conocimiento compartido.
- Conocimiento personal.

---

## Conversación

Conjunto de consultas y respuestas relacionadas mantenidas por un usuario.

---

# Criterios de éxito

- **SC-001:** El 90% de las consultas reciben una respuesta útil según la valoración de los usuarios.
- **SC-002:** El 100% de las respuestas identifican correctamente el origen del conocimiento utilizado.
- **SC-003:** Menos del 1% de las respuestas son reportadas como información inventada o no respaldada.
- **SC-004:** El tiempo medio para resolver una duda se reduce al menos un 50% respecto al uso de documentación tradicional.
- **SC-005:** El 90% de los usuarios declara confiar en las respuestas proporcionadas por el Tutor.

---

# Suposiciones

- La organización dispone de un sistema de Gestión del Conocimiento Organizacional (Feature 002).
- El conocimiento oficial constituye la principal fuente de verdad.
- El conocimiento colaborativo puede utilizarse, pero debe diferenciarse claramente del oficial.
- El conocimiento personal únicamente puede ser consultado por su propietario.
- La ausencia de una respuesta fiable debe comunicarse explícitamente al usuario.
- Es preferible no responder antes que proporcionar información incorrecta.
```
