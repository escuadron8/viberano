"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Boton } from "@/components/Boton";
import { BurbujaChat } from "@/components/BurbujaChat";
import { Cabecera } from "@/components/Cabecera";
import { CampoTexto } from "@/components/CampoTexto";
import { ChipOrigen } from "@/components/ChipOrigen";
import { HERRAMIENTA_STORAGE_KEY } from "@/lib/estado-cliente";

type TipoFuente = "oficial" | "compartido" | "personal";

type Mensaje = {
  id: string;
  autor: "ia" | "usuario";
  texto: string;
  fuentes?: TipoFuente[];
  abstencion?: boolean;
};

const RESPUESTAS_SIMULADAS: Array<Omit<Mensaje, "id" | "autor">> = [
  {
    texto: "Para crear un informe, ve a la pestaña 'Informes' y selecciona 'Nuevo informe'.",
    fuentes: ["oficial"],
  },
  {
    texto: "Puedes compartir un tablero desde el menú superior derecho, opción 'Compartir'.",
    fuentes: ["oficial", "compartido"],
  },
  {
    texto: "No dispongo de información fiable sobre esto todavía.",
    abstencion: true,
  },
];

let contadorMensajes = 0;
function idMensaje() {
  contadorMensajes += 1;
  return `m-${contadorMensajes}`;
}

function suscribirseSinCambios() {
  return () => {};
}

function leerHerramientaGuardada() {
  return localStorage.getItem(HERRAMIENTA_STORAGE_KEY) ?? "Chat";
}

function herramientaEnServidor() {
  return "Chat";
}

export default function ChatPage() {
  const herramienta = useSyncExternalStore(
    suscribirseSinCambios,
    leerHerramientaGuardada,
    herramientaEnServidor,
  );
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [entrada, setEntrada] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const siguienteRespuesta = useRef(0);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, escribiendo]);

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const texto = entrada.trim();
    if (!texto) return;

    setMensajes((previos) => [...previos, { id: idMensaje(), autor: "usuario", texto }]);
    setEntrada("");
    setEscribiendo(true);

    const respuesta = RESPUESTAS_SIMULADAS[siguienteRespuesta.current % RESPUESTAS_SIMULADAS.length];
    siguienteRespuesta.current += 1;

    setTimeout(() => {
      setMensajes((previos) => [...previos, { id: idMensaje(), autor: "ia", ...respuesta }]);
      setEscribiendo(false);
    }, 700);
  }

  return (
    <>
      <Cabecera
        titulo={herramienta}
        accion={
          <Link href="/progreso" className="shrink-0 text-body-md text-primary">
            Progreso
          </Link>
        }
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-sm overflow-y-auto p-lg">
          {mensajes.map((mensaje) => (
            <div key={mensaje.id} className="flex flex-col gap-xs">
              <BurbujaChat variante={mensaje.autor} className={mensaje.abstencion ? "italic text-ink-secondary" : ""}>
                {mensaje.texto}
              </BurbujaChat>
              {mensaje.fuentes && (
                <div className={`flex flex-wrap gap-xs ${mensaje.autor === "usuario" ? "self-end" : "self-start"}`}>
                  {mensaje.fuentes.map((fuente) => (
                    <ChipOrigen key={fuente} tipo={fuente} />
                  ))}
                </div>
              )}
            </div>
          ))}
          {escribiendo && (
            <BurbujaChat variante="ia" className="text-ink-secondary">
              Escribiendo…
            </BurbujaChat>
          )}
          <div ref={finRef} />
        </div>

        <form onSubmit={enviar} className="flex items-center gap-sm border-t border-hairline p-md">
          <CampoTexto
            value={entrada}
            onChange={(evento) => setEntrada(evento.target.value)}
            placeholder="Escribe tu pregunta..."
            className="flex-1"
          />
          <Boton type="submit" variante="primario" className="px-lg">
            Enviar
          </Boton>
        </form>
      </main>
    </>
  );
}
