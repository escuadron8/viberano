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
//
// T-21: el endpoint recibe ahora el `conversacion_id` que abre la pantalla
// de chat y persiste el turno completo (pregunta, respuesta y `fuentes`) en
// `mensaje`, para poder auditar después SC-002 y SC-003.

import type { SupabaseClient } from "@supabase/supabase-js";
import { crearClienteServidor } from "@/lib/supabase/server";
import { normalizarHerramienta, recuperar } from "@/lib/buscar";
import { generarRespuesta, type RespuestaIA } from "@/lib/ia";

const RESPUESTA_ABSTENCION =
  "No dispongo de información fiable para responder a esto todavía.";

function abstencion(): RespuestaIA {
  return {
    suficiente: false,
    respuesta: RESPUESTA_ABSTENCION,
    fuentes: [],
    multiples_fuentes: false,
  };
}

// La persistencia es auditoría, no parte de la respuesta: si falla, el
// usuario recibe igualmente lo que preguntó y el error queda en el log del
// servidor. Perder una fila de `mensaje` es molesto; tragarse una respuesta
// ya generada delante del usuario lo es mucho más.
//
// Las políticas RLS de T-12 rechazan el insert si `conversacion_id` no es de
// una conversación del propio usuario, así que un id ajeno no escribe nada
// aunque llegue en el cuerpo de la petición.
async function persistirTurno(
  supabase: SupabaseClient,
  conversacionId: string | null,
  pregunta: string,
  respuesta: RespuestaIA
) {
  if (!conversacionId) return;

  const { error } = await supabase.from("mensaje").insert([
    { conversacion_id: conversacionId, rol: "usuario", contenido: pregunta },
    {
      conversacion_id: conversacionId,
      rol: "tutor",
      contenido: respuesta.respuesta,
      fuentes: respuesta.fuentes,
    },
  ]);

  if (error) {
    console.error(`/api/consulta: no se pudo persistir el turno: ${error.message}`);
  }
}

export async function POST(request: Request) {
  const cuerpo = await request.json().catch(() => null);
  const pregunta = cuerpo?.pregunta;
  const herramienta = cuerpo?.herramienta;
  const conversacionId = cuerpo?.conversacion_id ?? null;

  if (typeof pregunta !== "string" || !pregunta.trim() || typeof herramienta !== "string" || !herramienta.trim()) {
    return Response.json(
      { error: "El cuerpo debe incluir 'pregunta' y 'herramienta', ambas como texto no vacío." },
      { status: 400 }
    );
  }

  if (conversacionId !== null && (typeof conversacionId !== "string" || !conversacionId.trim())) {
    return Response.json(
      { error: "'conversacion_id', si viene, debe ser un texto no vacío." },
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

  const fragmentos = await recuperar(
    supabase,
    pregunta,
    normalizarHerramienta(herramienta),
    user.id
  );

  let respuesta: RespuestaIA;

  if (fragmentos.length === 0) {
    respuesta = abstencion();
  } else {
    let generada: RespuestaIA;
    try {
      generada = await generarRespuesta(pregunta, fragmentos);
    } catch (error) {
      // Un fallo del proveedor no es una abstención: abstenerse aquí le
      // diría al usuario que no hay documentación cuando sí la hay. Se
      // devuelve un error explícito para que la pantalla ofrezca reintentar.
      console.error(`/api/consulta: falló la generación: ${(error as Error).message}`);
      return Response.json(
        { error: "El tutor no está disponible ahora mismo. Inténtalo de nuevo en un momento." },
        { status: 502 }
      );
    }

    const idsEnviados = new Set(fragmentos.map((f) => f.id));
    const citasValidas = generada.fuentes.every((f) => idsEnviados.has(f.id));

    respuesta = citasValidas ? generada : abstencion();
  }

  await persistirTurno(supabase, conversacionId, pregunta, respuesta);

  return Response.json(respuesta);
}
