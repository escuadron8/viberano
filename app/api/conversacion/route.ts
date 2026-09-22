// T-21: alta de la conversación a la que se cuelgan los mensajes del chat.
//
// La pantalla llama aquí una sola vez, justo antes de enviar la primera
// pregunta — no al montarse. Entrar al chat y salir sin preguntar nada no
// deja una fila vacía en la base de datos, que es lo que pasaría si la
// conversación se creara al abrir la pantalla.
//
// Cada entrada al chat abre una conversación nueva (decisión de T-21): no
// se reutiliza la última del usuario para esa herramienta. La persistencia
// existe para auditar SC-002/SC-003, no para rehidratar la pantalla; el
// reenvío de los últimos turnos al modelo es T-22 y vive dentro de una
// misma conversación.
//
// Se usa el cliente ligado a la sesión, así que la política RLS de T-12
// ("conversacion: solo su dueño") comprueba en la base de datos que
// `usuario_id` es quien dice ser, además del `user.id` que se pone aquí.

import { crearClienteServidor } from "@/lib/supabase/server";
import { normalizarHerramienta } from "@/lib/buscar";

export async function POST(request: Request) {
  const cuerpo = await request.json().catch(() => null);
  const herramienta = cuerpo?.herramienta;

  if (typeof herramienta !== "string" || !herramienta.trim()) {
    return Response.json(
      { error: "El cuerpo debe incluir 'herramienta' como texto no vacío." },
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

  const { data, error } = await supabase
    .from("conversacion")
    .insert({ usuario_id: user.id, herramienta: normalizarHerramienta(herramienta) })
    .select("id")
    .single();

  if (error) {
    return Response.json(
      { error: `No se pudo abrir la conversación: ${error.message}` },
      { status: 500 }
    );
  }

  return Response.json({ id: data.id }, { status: 201 });
}
