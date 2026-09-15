// T-16: interfaz de recuperación, aislada a propósito (ver specs/plan.md §8).
// Hoy llama a la función `buscar()` de Postgres (FTS en español). Si hace
// falta migrar a pgvector, esto es lo único del pipeline que cambia — los
// llamadores (T-18, T-20) siguen recibiendo la misma forma de resultado.

import type { SupabaseClient } from "@supabase/supabase-js";

export type TipoConocimiento = "oficial" | "compartido" | "personal";

export type ResultadoBusqueda = {
  id: string;
  tipo: TipoConocimiento;
  herramienta: string;
  titulo: string;
  contenido: string;
  rank: number;
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
