// T-18: camino de abstención end-to-end (FR-008). Cuando recuperar() no
// encuentra nada por encima del umbral de T-17, se responde directamente
// sin llamar al modelo — es la defensa principal contra la alucinación.
//
// T-20: cuando sí hay conocimiento suficiente, se llama a generarRespuesta()
// (T-19) y luego se vuelve a comprobar en servidor que cada id citado existe
// de verdad entre los fragmentos que se enviaron (FR-007) — la segunda
// defensa contra la alucinación, determinista, no una promesa del prompt.
// Si la IA cita algo que no le dimos, se descarta la respuesta entera y se
// cae al mismo mensaje de abstención de T-18: es preferible decir "no lo sé"
// a arriesgar una cita inventada.

import { crearClienteServidor } from "@/lib/supabase/server";
import { recuperar } from "@/lib/buscar";
import { generarRespuesta } from "@/lib/ia";

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

  const respuesta = await generarRespuesta(pregunta, fragmentos);

  const idsEnviados = new Set(fragmentos.map((f) => f.id));
  const citasValidas = respuesta.fuentes.every((f) => idsEnviados.has(f.id));

  if (!citasValidas) {
    return Response.json({
      suficiente: false,
      respuesta: RESPUESTA_ABSTENCION,
      fuentes: [],
      multiples_fuentes: false,
    });
  }

  return Response.json(respuesta);
}
