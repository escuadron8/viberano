import { crearClienteServidor } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.rpc("hora_servidor");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ hora: data });
}
