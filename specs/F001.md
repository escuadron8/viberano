# Especificación de Feature: Consultar dudas mediante IA

**Rama**: `001-consultar-dudas-ia`  
**Creada**: 2026-07-16  
**Estado**: Borrador  

**Input**:
> Como usuario que debe aprender una nueva herramienta de software, quiero poder preguntar cualquier duda en lenguaje natural y obtener una respuesta fiable basada únicamente en la documentación oficial de mi empresa. Si la información no existe o no puede verificarse, el Tutor debe indicarlo claramente y nunca inventar una respuesta.

---

# Problema

Durante la adopción de una nueva herramienta de software, los usuarios necesitan resolver dudas rápidamente para continuar con su trabajo. Sin embargo, la información suele estar dispersa entre manuales, vídeos, documentos o portales internos, lo que genera frustración, pérdida de tiempo y una fuerte dependencia del soporte o de compañeros más experimentados.

El usuario necesita un asistente con el que pueda conversar de forma natural y obtener respuestas **únicamente basadas en información oficial y fiable de la empresa**.

Cuando la documentación no contenga la respuesta o no exista evidencia suficiente, el sistema debe reconocer esta situación, comunicarlo de forma transparente y **no generar información inventada ni no verificada (no alucinar).**

---

# Objetivo

Permitir que un usuario resuelva sus dudas sobre una nueva herramienta mediante conversaciones en lenguaje natural, obteniendo respuestas fiables basadas exclusivamente en la documentación oficial proporcionada por la organización.

La funcionalidad debe priorizar la **confianza** sobre la **completitud**: es preferible reconocer que no existe información suficiente antes que proporcionar una respuesta incorrecta.

---

# Fuera de alcance

Esta feature **NO** incluye:

- Gestión de la documentación.
- Creación de cursos o contenidos formativos.
- Integración con la herramienta objeto de aprendizaje.
- Seguimiento del progreso del usuario.
- Personalización del aprendizaje.
- Generación de ejercicios.
- Soporte humano.
- Gestión de autenticación (SSO).

---

# Escenarios de usuario y pruebas *(obligatorio)*

## Historia de Usuario 1 - Resolver dudas mediante IA (Prioridad: P1)

**Como** trabajador que está aprendiendo una nueva herramienta de software,

**quiero** realizar preguntas en lenguaje natural,

**para** obtener respuestas fiables que me permitan continuar trabajando sin tener que consultar manuales o esperar ayuda de otras personas.

### Por qué esta prioridad

Es la propuesta de valor principal del producto. Sin esta funcionalidad el producto no resuelve el problema para el que ha sido creado.

### Test independiente

Proporcionar documentación oficial de una herramienta y verificar que todas las respuestas proceden únicamente de dicha documentación.

### Escenarios de aceptación

#### Escenario 1 - Respuesta encontrada

**Dado** que la documentación oficial contiene la información solicitada

**Cuando** el usuario realiza una pregunta

**Entonces** el sistema responde utilizando únicamente la información encontrada en esa documentación.

---

#### Escenario 2 - Información inexistente

**Dado** que la documentación oficial no contiene la respuesta

**Cuando** el usuario realiza una pregunta

**Entonces** el sistema informa claramente de que no dispone de información suficiente para responder.

---

#### Escenario 3 - Información parcial

**Dado** que la documentación responde solo parcialmente a la consulta

**Cuando** el usuario solicita información

**Entonces** el sistema responde únicamente con la parte respaldada por la documentación e indica qué información no puede confirmar.

---

#### Escenario 4 - Pregunta ambigua

**Dado** que la pregunta admite varias interpretaciones

**Cuando** el usuario la envía

**Entonces** el sistema solicita una aclaración antes de responder.

---

## Historia de Usuario 2 - Confiar en las respuestas (Prioridad: P1)

**Como** usuario,

**quiero** saber que las respuestas proceden únicamente de información oficial,

**para** poder confiar en ellas y utilizarlas en mi trabajo diario.

### Por qué esta prioridad

La confianza es uno de los factores críticos de éxito del producto y uno de los riesgos identificados durante la Inception.

### Test independiente

Realizar preguntas cuya respuesta exista y otras cuya respuesta no exista en la documentación.

### Escenarios de aceptación

#### Escenario 1 - Respuesta respaldada

**Dado** que existe información oficial

**Cuando** el sistema responde

**Entonces** la respuesta es consistente con dicha información.

---

#### Escenario 2 - Evitar alucinaciones

**Dado** que no existe información suficiente

**Cuando** el usuario realiza una consulta

**Entonces** el sistema indica que no puede responder con fiabilidad y no genera información inventada.

---

# Casos límite

- La documentación no contiene ninguna referencia relacionada con la consulta.
- Existen documentos oficiales con información contradictoria.
- El usuario introduce una pregunta vacía.
- El usuario formula una consulta excesivamente larga.
- El usuario insiste repetidamente sobre una información inexistente.
- La documentación disponible está desactualizada. **[NECESITA ACLARACIÓN: ¿cómo debe actuar el sistema?]**
- La consulta contiene varias preguntas diferentes.
- La documentación solo cubre parte de la respuesta.

---

# Requisitos *(obligatorio)*

## Requisitos funcionales

- **FR-001:** El sistema DEBE permitir al usuario realizar preguntas en lenguaje natural.
- **FR-002:** El sistema DEBE responder exclusivamente utilizando información procedente de la documentación oficial proporcionada por la organización.
- **FR-003:** El sistema NO DEBE generar respuestas basadas en conocimiento que no esté respaldado por dicha documentación.
- **FR-004:** El sistema DEBE informar explícitamente cuando no exista información suficiente para responder una consulta.
- **FR-005:** El sistema DEBE solicitar aclaraciones cuando la pregunta resulte ambigua.
- **FR-006:** El sistema DEBE responder utilizando un lenguaje claro y comprensible para el usuario.
- **FR-007:** El sistema DEBE presentar procedimientos en formato paso a paso cuando la respuesta describa una secuencia de acciones.
- **FR-008:** El sistema DEBE mantener el contexto de la conversación mientras las preguntas pertenezcan al mismo tema. **[NECESITA ACLARACIÓN: ¿cuál es el criterio para finalizar el contexto?]**
- **FR-009:** El sistema DEBE indicar cuando una respuesta sea parcial porque la documentación disponible no cubra completamente la consulta.
- **FR-010:** El sistema DEBE priorizar la fiabilidad de la información frente a ofrecer una respuesta completa.

---

# Entidades clave

## Conversación

Representa la interacción mantenida entre un usuario y el Tutor para resolver una o varias dudas.

**Atributos principales**

- Usuario
- Fecha de inicio
- Estado
- Consultas realizadas
- Respuestas generadas

---

## Consulta

Representa una pregunta realizada por el usuario en lenguaje natural.

**Atributos principales**

- Texto
- Fecha
- Conversación asociada

---

## Respuesta

Representa la información proporcionada por el Tutor.

**Atributos principales**

- Contenido
- Estado (completa, parcial o sin respuesta)
- Nivel de confianza
- Consulta asociada

---

## Fuente documental

Representa la documentación oficial utilizada para construir una respuesta.

**Atributos principales**

- Documento
- Sección utilizada
- Fecha de actualización

---

# Criterios de éxito *(obligatorio)*

## Resultados medibles

- **SC-001:** Al menos el 85% de los usuarios considera útiles las respuestas recibidas.
- **SC-002:** El 90% de las consultas respondidas son consideradas fiables por los usuarios.
- **SC-003:** Menos del 2% de las respuestas son reportadas como incorrectas o inventadas.
- **SC-004:** El tiempo medio necesario para resolver una duda se reduce al menos un 50% respecto al uso exclusivo de documentación tradicional.
- **SC-005:** El 100% de las consultas sin respaldo documental reciben una respuesta transparente indicando que no existe información suficiente.

---

# Suposiciones

- La organización dispone de documentación oficial sobre la herramienta.
- La documentación constituye la fuente de verdad del sistema.
- La confianza del usuario tiene mayor prioridad que responder todas las preguntas.
- Es preferible responder **"No encuentro información suficiente para responder esta consulta con fiabilidad"** antes que proporcionar una respuesta incorrecta.
- La gestión de la documentación pertenece a otra feature.
- La personalización del aprendizaje y el seguimiento del progreso se abordarán en futuras funcionalidades.

---

# Preguntas abiertas

1. ¿Debe mostrarse al usuario la fuente documental utilizada para construir la respuesta?
2. ¿Qué debe ocurrir cuando existen varias fuentes oficiales con información contradictoria?
3. ¿Debe permitirse responder parcialmente o únicamente cuando exista una respuesta completa?
4. ¿Debe existir un mecanismo para que el usuario reporte una respuesta como incorrecta?
5. ¿Qué nivel de confianza debe considerarse suficiente para responder automáticamente?
```
