"use client";

import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function BotonCerrarSesion() {
  const router = useRouter();

  async function cerrarSesion() {
    const supabase = crearClienteNavegador();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={cerrarSesion}
      aria-label="Cerrar sesión"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-base transition-colors hover:bg-canvas-soft"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    </button>
  );
}
