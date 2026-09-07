"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { enviarEnlaceMagico } from "@/lib/supabase/enviarEnlaceMagico";
import { Boton } from "@/components/Boton";

type ConfirmarAccesoProps = {
  next: string;
  tokenHash?: string;
  type?: string;
  email?: string;
};

// T-13: la plantilla de Magic Link de Supabase por defecto (sin SMTP propio,
// no editable) redirige aquí con los tokens de sesión en el fragmento de la
// URL (#access_token=...&refresh_token=...), no como query param — por eso
// esto se procesa en cliente y no en un route handler de servidor, que nunca
// llega a ver el fragmento. Si en el futuro se configura SMTP propio y se
// cambia la plantilla al formato token_hash, este mismo componente ya sabe
// procesar también ese caso.
export function ConfirmarAcceso({ next, tokenHash, type, email }: ConfirmarAccesoProps) {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [reenvio, setReenvio] = useState<"inicial" | "enviando" | "enviado" | "error">("inicial");

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

  async function reenviar() {
    if (!email) return;
    setReenvio("enviando");
    const { error } = await enviarEnlaceMagico(email, next);
    setReenvio(error ? "error" : "enviado");
  }

  if (error) {
    if (reenvio === "enviado") {
      return (
        <div className="flex flex-col gap-sm text-center">
          <h1 className="text-display-xl text-ink-base">Revisa tu correo otra vez.</h1>
          <p className="text-body-md text-ink-secondary">
            Te enviamos un enlace nuevo a <strong>{email}</strong>. Ábrelo en cuanto llegue, desde este mismo dispositivo.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-sm text-center">
        <h1 className="text-display-xl text-ink-base">Este enlace ya no vale.</h1>
        <p className="text-body-md text-ink-secondary">
          A veces el propio correo lo abre antes que tú, al comprobar que es seguro. Pide uno nuevo y ábrelo enseguida.
        </p>

        {email ? (
          <div className="flex flex-col gap-xs">
            <Boton variante="primario" className="w-full" onClick={reenviar} disabled={reenvio === "enviando"}>
              {reenvio === "enviando" ? "Enviando…" : `Reenviar enlace a ${email}`}
            </Boton>
            {reenvio === "error" ? (
              <p className="text-body-md text-warning">No se pudo reenviar. Inténtalo de nuevo.</p>
            ) : null}
          </div>
        ) : (
          <Link href="/login" className="text-body-md font-semibold text-primary underline underline-offset-2">
            Volver a intentarlo
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sm text-center">
      <h1 className="text-display-xl text-ink-base">Verificando acceso…</h1>
    </div>
  );
}
