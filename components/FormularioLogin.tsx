"use client";

import { useState, type FormEvent } from "react";
import { enviarEnlaceMagico } from "@/lib/supabase/enviarEnlaceMagico";
import { Boton } from "@/components/Boton";
import { CampoTexto } from "@/components/CampoTexto";

type FormularioLoginProps = {
  next: string;
  errorInicial?: string;
};

export function FormularioLogin({ next, errorInicial }: FormularioLoginProps) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"inicial" | "enviando" | "enviado" | "error">(
    errorInicial ? "error" : "inicial"
  );

  async function enviarEnlace(e: FormEvent) {
    e.preventDefault();
    setEstado("enviando");

    const { error } = await enviarEnlaceMagico(email, next);

    setEstado(error ? "error" : "enviado");
  }

  if (estado === "enviado") {
    return (
      <div className="flex flex-col gap-sm text-center">
        <h1 className="text-display-xl text-ink-base">Revisa tu correo.</h1>
        <p className="text-body-md text-ink-secondary">
          Te enviamos un enlace de acceso a <strong>{email}</strong>. Ábrelo desde este mismo dispositivo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm text-center">
        <h1 className="text-display-xl text-ink-base">Accede con tu correo.</h1>
        <p className="text-body-md text-ink-secondary">Te enviamos un enlace de acceso, sin contraseña.</p>
      </div>

      <form onSubmit={enviarEnlace} className="flex flex-col gap-sm">
        <CampoTexto
          type="email"
          required
          placeholder="tu@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Correo electrónico"
        />
        <Boton type="submit" variante="primario" className="w-full" disabled={estado === "enviando"}>
          {estado === "enviando" ? "Enviando…" : "Enviar enlace"}
        </Boton>
        {estado === "error" ? (
          <p className="text-body-md text-warning">
            No se pudo enviar el enlace. Comprueba el correo e inténtalo de nuevo.
          </p>
        ) : null}
      </form>
    </div>
  );
}
