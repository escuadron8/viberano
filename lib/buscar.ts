// T-16: interfaz de recuperación, aislada a propósito (ver specs/plan.md §8).
// Hoy llama a la función `buscar()` de Postgres (FTS en español). Si hace
// falta migrar a pgvector, esto es lo único del pipeline que cambia — los
// llamadores (T-18, T-20) siguen recibiendo la misma forma de resultado.
//
// T-17 añade recuperar(): el umbral de relevancia y el orden de fuentes
// viven aquí, junto a buscar(), porque están atados a la escala de `rank`
// del mecanismo de recuperación actual (FTS). Si se migra a pgvector, la
// escala de similitud cambia por completo y el umbral habría que
// recalibrarlo de todos modos — mejor que quede junto a lo que lo produce
// que repartido en otro archivo.

import type { SupabaseClient } from "@supabase/supabase-js";

export type TipoConocimiento = "oficial" | "compartido" | "personal";

export type ResultadoBusqueda = {
  id: string;
  tipo: TipoConocimiento;
  herramienta: string;
  titulo: string;
  contenido: string;
  rank: number;
  coincidencias: number;
};

export async function buscar(
  supabase: SupabaseClient,
  consulta: string,
  herramienta: string,
  usuarioId: string | null = null
): Promise<ResultadoBusqueda[]> {
  const { data, error } = await supabase.rpc("buscar", {
    consulta,
    p_herramienta: herramienta,
    p_usuario_id: usuarioId,
  });

  if (error) {
    throw new Error(`buscar(): ${error.message}`);
  }

  return data ?? [];
}

// T-17: por debajo de este rank de FTS, o con menos de MINIMO_COINCIDENCIAS
// palabras distintas de la pregunta presentes en el documento, se considera
// que no hay conocimiento suficiente para responder (FR-008). Calibrado a
// mano contra el corpus de prueba de Salesforce — ver scripts/probar-umbral.mts.
//
// Ninguna combinación de estos dos números separa perfectamente lo cubierto
// de lo que no: con un corpus tan pequeño y de vocabulario tan genérico
// ("organización", "configuración", "campo" aparecen en casi todos los
// documentos), una pregunta fuera de tema puede empatar exactamente en
// ambas señales con una pregunta legítima. Ver docs/historial.md para el
// caso concreto y por qué no se resolvió subiendo más el umbral.
export const UMBRAL_RELEVANCIA = 0.042;
export const MINIMO_COINCIDENCIAS = 3;

const PRIORIDAD_TIPO: Record<TipoConocimiento, number> = {
  oficial: 0,
  compartido: 1,
  personal: 2,
};

// FR-005: cuando hay conocimiento suficiente, se ordena oficial > compartido
// > personal antes de construir el prompt — si dos fuentes se contradicen,
// la oficial debe quedar primero independientemente de su rank exacto.
export async function recuperar(
  supabase: SupabaseClient,
  consulta: string,
  herramienta: string,
  usuarioId: string | null = null
): Promise<ResultadoBusqueda[]> {
  const candidatos = await buscar(supabase, consulta, herramienta, usuarioId);

  return candidatos
    .filter((r) => r.rank >= UMBRAL_RELEVANCIA && r.coincidencias >= MINIMO_COINCIDENCIAS)
    .sort((a, b) => PRIORIDAD_TIPO[a.tipo] - PRIORIDAD_TIPO[b.tipo] || b.rank - a.rank);
}

// T-22: una pregunta de seguimiento ("¿y cómo lo deshago?") casi nunca pasa
// el umbral por sí sola — trae uno o dos lexemas y MINIMO_COINCIDENCIAS
// exige 3 — y aunque los trajera, el sujeto está en el turno anterior. Por
// eso, si la pregunta actual no encuentra nada, se repite la búsqueda con
// las preguntas anteriores de la conversación delante.
//
// Solo como respaldo, nunca siempre: una pregunta que se sostiene sola se
// busca exactamente igual que antes de T-22 (la calibración de T-17 sigue
// valiendo) y un cambio de tema no arrastra documentos del tema viejo.
//
// Se descartó exigir que los fragmentos del respaldo coincidieran también
// con alguna palabra de la pregunta actual: el stemmer español no une las
// conjugaciones irregulares ("deshago" → deshag, "deshacer" → deshac), así
// que ese filtro tumbaba justo el caso para el que existe el respaldo. El
// precio es que una pregunta sin relación hecha a mitad de conversación
// recibe los fragmentos del tema anterior; la regla 2 del prompt y la
// verificación de citas de T-20 son las que la frenan en ese caso.
export async function recuperarConContexto(
  supabase: SupabaseClient,
  pregunta: string,
  herramienta: string,
  usuarioId: string | null = null,
  preguntasAnteriores: string[] = []
): Promise<ResultadoBusqueda[]> {
  const directos = await recuperar(supabase, pregunta, herramienta, usuarioId);
  if (directos.length > 0 || preguntasAnteriores.length === 0) {
    return directos;
  }

  const consultaConContexto = [...preguntasAnteriores, pregunta].join(" ");
  return recuperar(supabase, consultaConContexto, herramienta, usuarioId);
}

// T-21: la UI muestra las herramientas con su nombre propio ("Salesforce",
// "n8n") y el corpus las guarda en minúsculas ("salesforce"), que es lo que
// compara `buscar()` con un `=` exacto. La normalización vive aquí, junto a
// la consulta que depende de ella, y no en la pantalla: el cliente manda lo
// que quiera y el servidor decide cómo se llama una herramienta.
export function normalizarHerramienta(herramienta: string): string {
  return herramienta.trim().toLowerCase();
}
