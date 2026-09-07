import { NextResponse, type NextRequest } from "next/server";
import { actualizarSesion } from "@/lib/supabase/proxy";

// T-13: rutas protegidas — solo accesibles con sesión. Ver specs/tasks.md.
const RUTAS_PROTEGIDAS = ["/software", "/chat", "/progreso"];

export async function proxy(request: NextRequest) {
  const { response, user } = await actualizarSesion(request);
  const { pathname } = request.nextUrl;

  const esProtegida = RUTAS_PROTEGIDAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  );

  if (esProtegida && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/software";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
