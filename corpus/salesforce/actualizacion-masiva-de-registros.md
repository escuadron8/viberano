---
herramienta: salesforce
titulo: Cómo actualizar varios registros a la vez
---

Desde una vista de lista, marca las casillas de los registros que quieres
cambiar (o la casilla de la cabecera para seleccionar todos los visibles) y
haz doble clic sobre una celda editable de esa columna: Salesforce pregunta
si quieres aplicar el cambio "solo a este registro" o "a todos los
seleccionados".

La edición en línea funciona campo por campo y respeta las reglas de
validación de la organización — si un registro no cumple una regla
obligatoria, esa fila concreta se marca con un error y el resto se guarda
igualmente.

Para cambios más grandes (miles de filas, o varios campos a la vez), el
camino habitual es exportar a CSV, editarlo y volver a importarlo con la
herramienta de carga de datos, en vez de hacerlo fila a fila desde la vista.
