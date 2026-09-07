import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// T-13: usado por proxy.ts en la raíz para refrescar la cookie de sesión
// en cada request (patrón recomendado de @supabase/ssr) y saber si hay
// usuario autenticado, sin tocar la base de datos.
export async function actualizarSesion(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesParaSetear) {
          for (const { name, value } of cookiesParaSetear) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesParaSetear) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
