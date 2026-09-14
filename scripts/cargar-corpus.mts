// T-14: lee corpus/**/*.md e inserta en `conocimiento` con tipo = 'oficial'.
// Idempotente: si (herramienta, titulo) ya existe, actualiza el contenido en
// vez de duplicar la fila. Ver corpus/FORMATO.md para el formato esperado.
//
// Uso: npm run cargar-corpus

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const HERRAMIENTAS_VALIDAS = ["salesforce", "jira", "figma", "tableau"];
const CARPETA_CORPUS = join(import.meta.dirname, "..", "corpus");

try {
  process.loadEnvFile(join(import.meta.dirname, "..", ".env.local"));
} catch {
  // Sin .env.local (por ejemplo en CI): se asume que las variables ya están
  // en el entorno.
}

type Documento = {
  ruta: string;
  herramienta: string;
  titulo: string;
  contenido: string;
};

function parsearFrontmatter(ruta: string, texto: string): Documento {
  const coincidencia = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!coincidencia) {
    throw new Error(`${ruta}: falta el frontmatter (--- ... ---)`);
  }

  const [, bloqueFrontmatter, contenido] = coincidencia;
  const campos: Record<string, string> = {};
  for (const linea of bloqueFrontmatter.split(/\r?\n/)) {
    if (!linea.trim()) continue;
    const separador = linea.indexOf(":");
    if (separador === -1) {
      throw new Error(`${ruta}: línea de frontmatter inválida: "${linea}"`);
    }
    const clave = linea.slice(0, separador).trim();
    const valor = linea.slice(separador + 1).trim();
    campos[clave] = valor;
  }

  const herramienta = campos.herramienta;
  const titulo = campos.titulo;

  if (!herramienta || !titulo) {
    throw new Error(`${ruta}: faltan "herramienta" o "titulo" en el frontmatter`);
  }
  if (!HERRAMIENTAS_VALIDAS.includes(herramienta)) {
    throw new Error(
      `${ruta}: herramienta "${herramienta}" no reconocida (esperaba una de ${HERRAMIENTAS_VALIDAS.join(", ")})`
    );
  }

  return { ruta, herramienta, titulo, contenido: contenido.trim() };
}

async function listarMarkdown(carpeta: string): Promise<string[]> {
  const entradas = await readdir(carpeta, { withFileTypes: true });
  const rutas: string[] = [];

  for (const entrada of entradas) {
    const ruta = join(carpeta, entrada.name);
    if (entrada.isDirectory()) {
      rutas.push(...(await listarMarkdown(ruta)));
    } else if (entrada.isFile() && entrada.name.endsWith(".md") && entrada.name !== "FORMATO.md") {
      rutas.push(ruta);
    }
  }

  return rutas;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveServicio = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !claveServicio) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (revisa .env.local)"
    );
  }

  const supabase = createClient(url, claveServicio);

  const rutas = await listarMarkdown(CARPETA_CORPUS);
  if (rutas.length === 0) {
    console.log("No se encontró ningún .md en corpus/.");
    return;
  }

  let insertados = 0;
  let actualizados = 0;
  let sinCambios = 0;

  for (const ruta of rutas) {
    const texto = await readFile(ruta, "utf-8");
    const doc = parsearFrontmatter(relative(CARPETA_CORPUS, ruta), texto);

    const { data: existente, error: errorSelect } = await supabase
      .from("conocimiento")
      .select("id, contenido")
      .eq("tipo", "oficial")
      .eq("herramienta", doc.herramienta)
      .eq("titulo", doc.titulo)
      .maybeSingle();

    if (errorSelect) {
      throw new Error(`${doc.ruta}: error al consultar la fila existente: ${errorSelect.message}`);
    }

    if (!existente) {
      const { error: errorInsert } = await supabase.from("conocimiento").insert({
        tipo: "oficial",
        herramienta: doc.herramienta,
        titulo: doc.titulo,
        contenido: doc.contenido,
      });
      if (errorInsert) {
        throw new Error(`${doc.ruta}: error al insertar: ${errorInsert.message}`);
      }
      insertados++;
      console.log(`+ insertado   ${doc.ruta}`);
    } else if (existente.contenido !== doc.contenido) {
      const { error: errorUpdate } = await supabase
        .from("conocimiento")
        .update({ contenido: doc.contenido })
        .eq("id", existente.id);
      if (errorUpdate) {
        throw new Error(`${doc.ruta}: error al actualizar: ${errorUpdate.message}`);
      }
      actualizados++;
      console.log(`~ actualizado ${doc.ruta}`);
    } else {
      sinCambios++;
      console.log(`= sin cambios ${doc.ruta}`);
    }
  }

  console.log(
    `\n${rutas.length} documentos procesados — ${insertados} insertados, ${actualizados} actualizados, ${sinCambios} sin cambios.`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
