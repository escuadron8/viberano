"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { crearClienteNavegador } from "@/lib/supabase/client";

type ConfirmarAccesoProps = {
  next: string;
  tokenHash?: string;
  type?: string;
};

// T-13: la plantilla de Magic Link de Supabase por defecto (sin SMTP propio,
// no editable) redirige aquí con los tokens de sesión en el fragmento de la
// URL (#access_token=...&refresh_token=...), no como query param — por eso
// esto se procesa en cliente y no en un route handler de servidor, que nunca
// llega a ver el fragmento. Si en el futuro se configura SMTP propio y se
// cambia la plantilla al formato token_hash, este mismo componente ya sabe
// procesar también ese caso.
export function ConfirmarAcceso({ next, tokenHash, type }: ConfirmarAccesoProps) {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function procesar() {
      const supabase = crearClienteNavegador();

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error) {
          router.replace(next);
          return;
        }
      } else if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as EmailOtpType,
        });
        if (!error) {
          router.replace(next);
          return;
        }
      }

      if (!cancelado) setError(true);
    }

    procesar();
    return () => {
      cancelado = true;
    };
  }, [next, tokenHash, type, router]);

  if (error) {
    return (
      <div className="flex flex-col gap-sm text-center">
        <h1 className="text-display-xl text-ink-base">Enlace no válido.</h1>
        <p className="text-body-md text-ink-secondary">
          Puede que haya caducado o ya se haya usado. Pide un enlace nuevo.
        </p>
        <Link href="/login" className="text-body-md font-semibold text-primary underline underline-offset-2">
          Volver a intentarlo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sm text-center">
      <h1 className="text-display-xl text-ink-base">Verificando acceso…</h1>
    </div>
  );
}
