// T-21: el chat real. Hasta aquí esta pantalla reproducía guiones falsos
// (uno genérico con los cuatro casos de fuente y la secuencia guionizada de
// n8n que se grabó para el pitch); ahora cada pregunta va a /api/consulta y
// lo que se pinta es lo que devuelve el pipeline de la Fase 3: la respuesta,
// sus chips de origen y la abstención cuando el corpus no da para responder.
//
// Consecuencia a tener presente en la demo: una herramienta sin corpus
// cargado (hoy Claude y n8n) responderá siempre con la abstención de FR-008.
// Es el comportamiento correcto, no un fallo.

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BurbujaChat } from "@/components/BurbujaChat";
import { CabeceraMovil } from "@/components/CabeceraMovil";
import { CampoTexto } from "@/components/CampoTexto";
import { ChipOrigen } from "@/components/ChipOrigen";
import { useHerramienta } from "@/components/HerramientaProvider";
import type { TipoConocimiento } from "@/lib/buscar";

// El contrato de respuesta de /api/consulta (specs/plan.md §3).
type RespuestaConsulta = {
  suficiente: boolean;
  respuesta: string;
  fuentes: { id: string; tipo: TipoConocimiento }[];
  multiples_fuentes: boolean;
};

type Mensaje = {
  id: string;
  autor: "ia" | "usuario";
  texto: string;
  tiposFuente?: TipoConocimiento[];
  variasFuentes?: boolean;
  error?: boolean;
};

const ERROR_GENERICO =
  "No he podido conectar con el tutor. Comprueba tu conexión y vuelve a intentarlo.";

// FR-005: el mismo orden de prioridad que usa el servidor con los
// fragmentos, aplicado aquí a los chips para que "Oficial" salga primero.
const PRIORIDAD_TIPO: Record<TipoConocimiento, number> = {
  oficial: 0,
  compartido: 1,
  personal: 2,
};

// Varias citas pueden ser del mismo tipo (dos documentos oficiales, por
// ejemplo): el chip dice de dónde sale la respuesta, así que se pinta uno
// por tipo distinto, no uno por cita.
function tiposDeFuente(fuentes: RespuestaConsulta["fuentes"]): TipoConocimiento[] {
  return [...new Set(fuentes.map((f) => f.tipo))].sort(
    (a, b) => PRIORIDAD_TIPO[a] - PRIORIDAD_TIPO[b]
  );
}

export default function ChatPage() {
  const router = useRouter();
  const { herramienta, cargando } = useHerramienta();

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [entrada, setEntrada] = useState("");
  const [esperando, setEsperando] = useState(false);
  // La conversación se abre con la primera pregunta y se reutiliza durante
  // toda la visita a la pantalla. Es una ref y no estado porque el envío
  // necesita su valor en ese momento, no en el siguiente render.
  const conversacionRef = useRef<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  // Sin herramienta elegida no hay nada que consultar (pasa al entrar a
  // /chat directamente, sin pasar por la pantalla de selección).
  useEffect(() => {
    if (!cargando && !herramienta) {
      router.replace("/software");
    }
  }, [cargando, herramienta, router]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes, esperando]);

  // La fila de `conversacion` se crea aquí, con la primera pregunta, para no
  // dejar conversaciones vacías de quien solo abre la pantalla. Si falla, se
  // sigue sin ella: la persistencia es auditoría y no debe impedir preguntar.
  async function asegurarConversacion(nombreHerramienta: string): Promise<string | null> {
    if (conversacionRef.current) return conversacionRef.current;

    try {
      const respuesta = await fetch("/api/conversacion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ herramienta: nombreHerramienta }),
      });
      if (!respuesta.ok) return null;

      const { id } = await respuesta.json();
      conversacionRef.current = typeof id === "string" ? id : null;
      return conversacionRef.current;
    } catch {
      return null;
    }
  }

  function anadir(mensaje: Mensaje) {
    setMensajes((prev) => [...prev, mensaje]);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const pregunta = entrada.trim();
    if (!pregunta || esperando || !herramienta) return;

    anadir({ id: `u-${Date.now()}`, autor: "usuario", texto: pregunta });
    setEntrada("");
    setEsperando(true);

    try {
      const conversacionId = await asegurarConversacion(herramienta);

      const respuesta = await fetch("/api/consulta", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pregunta, herramienta, conversacion_id: conversacionId }),
      });

      if (respuesta.status === 401) {
        // La sesión caducó mientras el chat estaba abierto.
        router.replace("/login?next=/chat");
        return;
      }

      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => null);
        anadir({
          id: `err-${Date.now()}`,
          autor: "ia",
          texto: typeof cuerpo?.error === "string" ? cuerpo.error : ERROR_GENERICO,
          error: true,
        });
        return;
      }

      const datos: RespuestaConsulta = await respuesta.json();

      anadir({
        id: `ia-${Date.now()}`,
        autor: "ia",
        texto: datos.respuesta,
        tiposFuente: tiposDeFuente(datos.fuentes ?? []),
        variasFuentes: datos.multiples_fuentes,
      });
    } catch {
      anadir({ id: `err-${Date.now()}`, autor: "ia", texto: ERROR_GENERICO, error: true });
    } finally {
      setEsperando(false);
    }
  }

  if (cargando || !herramienta) return null;

  return (
    <div className="flex h-dvh flex-col">
      <CabeceraMovil
        titulo={`Tutor · ${herramienta}`}
        hrefAtras="/software"
        className="bg-chat-ai-bg"
        accion={
          <Link
            href="/progreso"
            aria-label="Ver progreso"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-base transition-colors hover:bg-canvas/50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </Link>
        }
      />

      <div className="flex flex-1 flex-col gap-sm overflow-y-auto px-lg py-md" aria-live="polite">
        <BurbujaChat variante="ia">
          {`Hola, veo que estás aprendiendo ${herramienta}. ¿En qué puedo ayudarte hoy?`}
        </BurbujaChat>

        {mensajes.map((m) => (
          <div
            key={m.id}
            className="flex flex-col gap-xs"
            style={{ alignSelf: m.autor === "ia" ? "flex-start" : "flex-end" }}
          >
            <BurbujaChat variante={m.autor} className={m.error ? "border border-warning" : ""}>
              {m.texto}
            </BurbujaChat>
            {m.tiposFuente && m.tiposFuente.length > 0 ? (
              <div className="flex flex-wrap items-center gap-xs">
                {m.tiposFuente.map((tipo) => (
                  <ChipOrigen key={tipo} tipo={tipo} />
                ))}
                {m.variasFuentes ? (
                  <span className="text-body-md text-ink-secondary">Varias fuentes</span>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}

        {esperando ? (
          <BurbujaChat variante="ia">
            <span className="flex items-center gap-xs">
              <span className="sr-only">El tutor está escribiendo</span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-secondary [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-secondary [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-secondary" />
            </span>
          </BurbujaChat>
        ) : null}
        <div ref={finRef} />
      </div>

      <form
        onSubmit={enviar}
        className="flex shrink-0 items-center gap-sm px-lg pb-[calc(env(safe-area-inset-bottom)+16px)] pt-sm"
      >
        <CampoTexto
          className="flex-1"
          placeholder={esperando ? "El tutor está pensando..." : "Escribe tu pregunta..."}
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          disabled={esperando}
          aria-label="Escribe tu pregunta"
        />
        <button
          type="submit"
          disabled={!entrada.trim() || esperando}
          aria-label="Enviar"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-primary text-canvas transition-opacity disabled:opacity-40"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
    </div>
  );
}
