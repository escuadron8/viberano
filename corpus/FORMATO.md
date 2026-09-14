# Formato del corpus de conocimiento oficial

Cada documento es un archivo `.md` dentro de `corpus/`, organizado en una subcarpeta
por herramienta (`corpus/salesforce/`, `corpus/jira/`, etc. — el nombre de la carpeta
es solo organización, lo que cuenta es el campo `herramienta` del frontmatter).

## Estructura de un documento

```markdown
---
herramienta: salesforce
titulo: Cómo crear un informe de oportunidades
---

El contenido en Markdown va aquí. Este es el texto que el Tutor va a citar
como fuente cuando responda una pregunta cubierta por este documento.

Escribe en español, en frases claras y autocontenidas — el buscador (FTS en
español) funciona mejor sobre texto natural que sobre listas telegráficas.
```

## Reglas

- **`herramienta`**: uno de `salesforce`, `jira`, `figma`, `tableau` (en minúsculas,
  sin acentos). Debe coincidir con el nombre que usan las 4 pantallas.
- **`titulo`**: identifica el documento dentro de esa herramienta. Reescribir un
  documento con el mismo `herramienta` + `titulo` **actualiza** la fila existente
  en vez de duplicarla — así que dos documentos distintos no pueden compartir título.
- **Un documento, un tema.** Mejor 20 documentos cortos y precisos que 5 extensos:
  el buscador funciona sobre fragmentos, y un documento que mezcla varios temas
  diluye la relevancia de cada uno.
- **Contenido real y verificado.** El Tutor va a citar esto como fuente oficial con
  total confianza — si el documento está mal, la respuesta estará mal y la citará
  como si fuera correcta.

## Cargar el corpus

```
npm run cargar-corpus
```

Lee todo `corpus/**/*.md` (menos este archivo) y hace upsert en la tabla
`conocimiento` con `tipo = 'oficial'`. Ejecutarlo varias veces seguidas no duplica
filas: si `herramienta` + `titulo` ya existen, actualiza el contenido; si no,
inserta una fila nueva.
