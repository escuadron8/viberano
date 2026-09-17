// T-18: camino de abstención end-to-end (FR-008). Cuando recuperar() no
// encuentra nada por encima del umbral de T-17, se responde directamente
// sin llamar al modelo — es la defensa principal contra la alucinación.
//
// T-20 conecta aquí el resto del pipeline (T-19: cliente de Claude +
// verificación de citas) para el camino en el que sí hay conocimiento
// suficiente; de momento esa rama devuelve 501.

import { crearClienteServidor } from "@/lib/supabase/server";
import { recuperar } from "@/lib/buscar";

const RESPUESTA_ABSTENCION =
  "No dispongo de información fiable para responder a esto todavía.";

export async function POST(request: Request) {
  const cuerpo = await request.json().catch(() => null);
  const pregunta = cuerpo?.pregunta;
  const herramienta = cuerpo?.herramienta;

  if (typeof pregunta !== "string" || !pregunta.trim() || typeof herramienta !== "string" || !herramienta.trim()) {
    return Response.json(
      { error: "El cuerpo debe incluir 'pregunta' y 'herramienta', ambas como texto no vacío." },
      { status: 400 }
    );
  }

  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "No autenticado." }, { status: 401 });
  }

  const fragmentos = await recuperar(supabase, pregunta, herramienta, user.id);

  if (fragmentos.length === 0) {
    return Response.json({
      suficiente: false,
      respuesta: RESPUESTA_ABSTENCION,
      fuentes: [],
      multiples_fuentes: false,
    });
  }

  return Response.json(
    { error: "Hay conocimiento suficiente, pero la generación con Claude todavía no está conectada (T-19/T-20)." },
    { status: 501 }
  );
}
