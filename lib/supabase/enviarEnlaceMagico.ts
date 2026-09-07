import { crearClienteNavegador } from "@/lib/supabase/client";

// T-13: usado tanto por el formulario de login como por el botón de
// "reenviar" cuando un enlace llega consumido (típico de los escáneres de
// seguridad de los clientes de correo, que abren el enlace antes que el
// usuario). El email va también en el redirect para poder ofrecer ese
// reenvío sin pedirlo de nuevo si el primer enlace falla.
export async function enviarEnlaceMagico(email: string, next: string) {
  const supabase = crearClienteNavegador();
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}&email=${encodeURIComponent(email)}`,
    },
  });
}
