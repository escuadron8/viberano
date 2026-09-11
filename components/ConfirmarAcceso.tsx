"use client";

import { useState } from "react";
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

// SPIKE (spike/magic-link-confirmation): variante experimental de T-13 que
// no consume el token al montar el componente (eso es justo lo que dispara
// el prefetch de los escáneres de seguridad del correo). Aquí solo se leen
// los parámetros de la URL; la llamada a Supabase que gasta el token de un
// solo uso queda detrás del clic explícito del usuario en "Confirmar e
// iniciar sesión". Sigue soportando tanto el fragmento #access_token/
// #refresh_token (plantilla por defecto de Supabase) como token_hash/type
// (formato con SMTP propio) — ver la nota original de T-13 en el commit
// 69b4e25 para el porqué de cada caso.
export function ConfirmarAcceso({ next, tokenHash, type, email }: ConfirmarAccesoProps) {
  const router = useRouter();
  const [estado, setEstado] = useState<"inicial" | "confirmando" | "error">("inicial");
  const [reenvio, setReenvio] = useState<"inicial" | "enviando" | "enviado" | "error">("inicial");

  async function confirmar() {
    setEstado("confirmando");
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

    setEstado("error");
  }

  async function reenviar() {
    if (!email) return;
    setReenvio("enviando");
    const { error } = await enviarEnlaceMagico(email, next);
    setReenvio(error ? "error" : "enviado");
  }

  if (estado === "error") {
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
      <h1 className="text-display-xl text-ink-base">Confirma tu acceso.</h1>
      <p className="text-body-md text-ink-secondary">
        Pulsa el botón para iniciar sesión con el enlace que recibiste por correo.
      </p>
      <Boton
        variante="primario"
        className="w-full"
        onClick={confirmar}
        disabled={estado === "confirmando"}
      >
        {estado === "confirmando" ? "Confirmando…" : "Confirmar e iniciar sesión"}
      </Boton>
    </div>
  );
}
