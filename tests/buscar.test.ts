// T-22: la búsqueda de respaldo con las preguntas anteriores de la
// conversación. Se prueba contra un doble de `supabase.rpc("buscar")` que
// solo responde a las consultas que conoce, para poder afirmar con qué
// texto se buscó y cuántas veces. El umbral de T-17 se aplica de verdad
// (no se dobla `recuperar()`), así que los resultados llevan un rank y unas
// coincidencias que lo superan.

import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { recuperarConContexto, type ResultadoBusqueda } from "@/lib/buscar";

const DOC_FUSION: ResultadoBusqueda = {
  id: "44444444-4444-4444-8444-444444444444",
  tipo: "oficial",
  herramienta: "salesforce",
  titulo: "Cómo fusionar cuentas duplicadas",
  contenido: "La fusión no se puede deshacer, así que conviene revisar con cuidado qué valores se están conservando.",
  rank: 0.09,
  coincidencias: 3,
};

function supabaseQueResponde(resultados: Record<string, ResultadoBusqueda[]>) {
  const rpc = vi.fn(async (_funcion: string, args: { consulta: string }) => ({
    data: resultados[args.consulta] ?? [],
    error: null,
  }));
  return { supabase: { rpc } as unknown as SupabaseClient, rpc };
}

function consultasHechas(rpc: ReturnType<typeof vi.fn>) {
  return rpc.mock.calls.map(([, args]) => (args as { consulta: string }).consulta);
}

describe("recuperarConContexto() — respaldo con los turnos anteriores (T-22)", () => {
  it("no toca el historial cuando la pregunta encuentra fragmentos por sí sola", async () => {
    const { supabase, rpc } = supabaseQueResponde({ "¿Cómo fusiono cuentas duplicadas?": [DOC_FUSION] });

    const fragmentos = await recuperarConContexto(
      supabase,
      "¿Cómo fusiono cuentas duplicadas?",
      "salesforce",
      "usuario-a",
      ["¿Cómo creo un informe?"]
    );

    // Una pregunta que se sostiene sola se busca igual que antes de T-22: ni
    // una segunda consulta ni el tema anterior mezclado.
    expect(fragmentos).toEqual([DOC_FUSION]);
    expect(consultasHechas(rpc)).toEqual(["¿Cómo fusiono cuentas duplicadas?"]);
  });

  it("repite la búsqueda con las preguntas anteriores delante cuando la actual no encuentra nada", async () => {
    const { supabase, rpc } = supabaseQueResponde({
      "¿Cómo fusiono cuentas duplicadas? ¿Y cómo lo deshago?": [DOC_FUSION],
    });

    const fragmentos = await recuperarConContexto(supabase, "¿Y cómo lo deshago?", "salesforce", "usuario-a", [
      "¿Cómo fusiono cuentas duplicadas?",
    ]);

    // El caso de la prueba de T-22: la pregunta de seguimiento sola no trae
    // el sujeto, pero junto a la anterior encuentra el documento que dice
    // que la fusión no se puede deshacer.
    expect(fragmentos).toEqual([DOC_FUSION]);
    expect(consultasHechas(rpc)).toEqual([
      "¿Y cómo lo deshago?",
      "¿Cómo fusiono cuentas duplicadas? ¿Y cómo lo deshago?",
    ]);
  });

  it("aplica el umbral de T-17 también al respaldo", async () => {
    const pordebajo = { ...DOC_FUSION, rank: 0.01, coincidencias: 1 };
    const { supabase } = supabaseQueResponde({
      "¿Cómo fusiono cuentas duplicadas? ¿Cuál es la capital de Mongolia?": [pordebajo],
    });

    const fragmentos = await recuperarConContexto(
      supabase,
      "¿Cuál es la capital de Mongolia?",
      "salesforce",
      "usuario-a",
      ["¿Cómo fusiono cuentas duplicadas?"]
    );

    expect(fragmentos).toEqual([]);
  });

  it("sin historial se abstiene tras una sola búsqueda", async () => {
    const { supabase, rpc } = supabaseQueResponde({});

    const fragmentos = await recuperarConContexto(supabase, "¿Y cómo lo deshago?", "salesforce", "usuario-a");

    expect(fragmentos).toEqual([]);
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
