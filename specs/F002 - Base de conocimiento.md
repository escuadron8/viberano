# Especificación de Feature: Gestión del Conocimiento Organizacional

**Rama**: `002-gestion-conocimiento-organizacional`

**Creada**: 2026-07-17

**Estado**: Borrador

**Input**

Como organización queremos disponer de un sistema que permita capturar, organizar, compartir y mantener actualizado el conocimiento generado durante la adopción de nuevas herramientas de software, diferenciando claramente entre conocimiento oficial, conocimiento personal y conocimiento colaborativo.

---

# Problema

Durante la implantación de nuevas herramientas, el conocimiento se genera desde múltiples fuentes.

Por un lado existe documentación oficial creada por la organización. Por otro, los propios usuarios generan continuamente notas, aprendizajes, procedimientos, buenas prácticas y atajos fruto de su experiencia diaria.

Actualmente ese conocimiento queda disperso en documentos personales, chats, correos electrónicos o simplemente se pierde cuando una persona cambia de equipo.

La organización necesita un sistema que permita conservar, compartir y evolucionar ese conocimiento sin perder la trazabilidad sobre su origen ni comprometer la fiabilidad de las respuestas del Tutor.

El conocimiento oficial debe seguir siendo la fuente de verdad de la organización, mientras que el conocimiento personal y colaborativo debe mantenerse claramente diferenciado hasta que sea validado.

---

# Objetivo

Gestionar de forma centralizada el conocimiento oficial, personal y colaborativo generado durante la adopción de herramientas digitales, permitiendo que evolucione continuamente sin perder su origen, su nivel de confianza ni su gobernanza.

---

# Fuera de alcance

- Responder preguntas mediante IA (Feature 001).
- Personalizar el aprendizaje.
- Evaluar usuarios.
- Crear cursos.
- Integraciones con gestores documentales corporativos.
- Automatizar la validación del conocimiento mediante IA.
- Búsqueda y uso de referencias externas en la web cuando no exista conocimiento organizacional suficiente (Feature 001).

---

# Escenarios de usuario y pruebas

## Historia de Usuario 1 – Incorporar conocimiento oficial (P1)

Como administrador o formador quiero incorporar documentación oficial para que el Tutor disponga siempre de información fiable.

---

## Historia de Usuario 2 – Mantener actualizado el conocimiento oficial (P1)

Como administrador quiero actualizar o retirar documentación para mantener vigente la base de conocimiento oficial.

---

## Historia de Usuario 3 – Crear conocimiento personal (P1)

Como usuario quiero guardar mis notas, aprendizajes y procedimientos para reutilizarlos posteriormente.

---

## Historia de Usuario 4 – Compartir conocimiento con otros usuarios (P2)

Como usuario quiero compartir mis aprendizajes y atajos con mi equipo para acelerar el aprendizaje colectivo.

---

## Historia de Usuario 5 – Consultar conocimiento compartido (P2)

Como usuario quiero acceder al conocimiento compartido por otros compañeros para beneficiarme de su experiencia.

---

## Historia de Usuario 6 – Diferenciar el origen del conocimiento (P1)

Como usuario quiero conocer si una respuesta procede de documentación oficial, conocimiento compartido o conocimiento personal para valorar su fiabilidad.

---

## Historia de Usuario 7 – Proponer convertir conocimiento compartido en oficial (P3)

Como usuario quiero proponer que una aportación útil sea revisada para convertirse en conocimiento oficial.

---

## Historia de Usuario 8 – Gestionar el ciclo de vida del conocimiento (P2)

Como administrador quiero aprobar, retirar o archivar contribuciones para mantener una base de conocimiento útil y actualizada.

---

# Casos límite

- Un mismo procedimiento existe en la documentación oficial y también como conocimiento compartido.
- Dos usuarios comparten soluciones diferentes para el mismo problema.
- Un usuario elimina una nota que había compartido.
- Una contribución deja de ser válida tras una actualización del software.
- Existen documentos oficiales contradictorios.
- Un conocimiento compartido es promovido a conocimiento oficial.
- Un usuario intenta compartir información sensible o confidencial.
- **[NECESITA ACLARACIÓN: ¿debe existir moderación antes de publicar conocimiento compartido?]**

---

# Requisitos

## Requisitos funcionales

- **FR-001:** El sistema DEBE permitir incorporar documentación oficial.
- **FR-002:** El sistema DEBE permitir actualizar y retirar documentación oficial.
- **FR-003:** El sistema DEBE permitir crear y mantener conocimiento personal.
- **FR-004:** El sistema DEBE permitir compartir conocimiento personal con equipos o comunidades.
- **FR-005:** El sistema DEBE permitir consultar conocimiento compartido.
- **FR-006:** El sistema DEBE identificar el origen de toda fuente de conocimiento utilizada.
- **FR-007:** El sistema DEBE diferenciar claramente conocimiento oficial, colaborativo y personal.
- **FR-008:** El sistema DEBE permitir retirar una contribución compartida sin eliminar la copia personal.
- **FR-009:** El sistema DEBE permitir proponer contribuciones para su validación como conocimiento oficial.
- **FR-010:** El sistema DEBE impedir que una contribución colaborativa sea tratada como documentación oficial sin un proceso explícito de validación.
- **FR-011:** El sistema DEBE permitir gestionar el ciclo de vida del conocimiento (crear, actualizar, compartir, archivar y retirar).
- **FR-012:** El sistema DEBE conservar la trazabilidad del origen de cada elemento de conocimiento.

---

# Entidades clave

### Conocimiento oficial

Información validada por la organización que constituye la fuente de verdad del Tutor.

---

### Conocimiento personal

Información creada y mantenida por un usuario para su uso privado.

---

### Conocimiento compartido

Información publicada por un usuario para que pueda ser utilizada por un equipo o comunidad.

---

### Contribución

Elemento de conocimiento susceptible de revisión y validación.

---

### Comunidad

Grupo de usuarios con el que puede compartirse conocimiento.

---

# Criterios de éxito

- **SC-001:** El 100% de las respuestas generadas por el Tutor identifican claramente el origen del conocimiento utilizado.
- **SC-002:** Al menos el 60% de los usuarios crean conocimiento personal durante los tres primeros meses de uso.
- **SC-003:** Al menos el 40% de los usuarios comparte alguna contribución con su equipo.
- **SC-004:** El tiempo necesario para encontrar una solución previamente descubierta disminuye al menos un 50%.
- **SC-005:** Menos del 2% de las contribuciones compartidas son reportadas como información incorrecta o desactualizada.
- **SC-006:** La reutilización del conocimiento compartido aumenta progresivamente durante la adopción de una nueva herramienta.

---

# Suposiciones

- Existe documentación oficial proporcionada por la organización.
- Los usuarios generan conocimiento útil durante su trabajo diario.
- El conocimiento colaborativo aporta valor aunque todavía no haya sido validado oficialmente.
- La documentación oficial continúa siendo la principal fuente de verdad del Tutor.
- Toda respuesta debe indicar siempre el origen de la información utilizada.
- La validación de conocimiento compartido requiere intervención humana.
- Las referencias externas obtenidas en la web (Feature 001) no forman parte de esta base de conocimiento organizacional y no se gestionan, versionan ni validan como tal.