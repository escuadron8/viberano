"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BurbujaChat } from "@/components/BurbujaChat";
import { CabeceraMovil } from "@/components/CabeceraMovil";
import { CampoTexto } from "@/components/CampoTexto";
import { ChipOrigen } from "@/components/ChipOrigen";
import { useHerramienta } from "@/components/HerramientaProvider";

type Mensaje = {
  id: string;
  autor: "ia" | "usuario";
  texto: string;
  fuentes?: ("oficial" | "compartido" | "personal" | "web")[];
  variasFuentes?: boolean;
  abstencion?: boolean;
};

const GUION_GENERICO: Omit<Mensaje, "id" | "autor">[] = [
  {
    texto: `Claro. En {herramienta} puedes hacerlo desde el menú de configuración, en la sección de vistas. Haz clic en el icono de engranaje arriba a la derecha.`,
    fuentes: ["oficial"],
  },
  {
    texto: `Hay dos formas de conseguirlo: la vía recomendada por el equipo y un atajo que comparte la comunidad. Te dejo ambas para que elijas.`,
    fuentes: ["oficial", "compartido"],
    variasFuentes: true,
  },
  {
    texto: `No encontré esto en la documentación oficial ni en el conocimiento compartido o personal, así que busqué referencias externas en la web. Tómalo con algo más de cautela que el resto de respuestas: {herramienta} lo describe así en su documentación pública.`,
    fuentes: ["web"],
  },
  {
    texto: "No dispongo de información fiable para responder esto todavía, ni siquiera en fuentes externas. Prueba a reformular la pregunta o consulta la documentación oficial.",
    abstencion: true,
  },
];

const GUION_N8N: Omit<Mensaje, "id" | "autor">[] = [
  {
    texto: `Buena pregunta para empezar. Antes de nada, ¿tú vienes más del lado técnico o de negocio? Así te lo explico con el ejemplo que más te va a servir.`,
  },
  {
    texto: `Perfecto, entonces piénsalo así: un workflow es como una receta de cocina automática. Cada "nodo" (esos cuadraditos que ves en el lienzo) es un paso de la receta — uno puede decir "cuando llegue un email nuevo", otro "resume ese email con IA", y otro "mándalo a Slack". Tú conectas los pasos con líneas, y n8n los ejecuta solo. ¿Quieres que montemos juntos uno sencillito con tu bandeja de correo como ejemplo?`,
  },
];

function respuestaSimulada(herramienta: string, turno: number): Mensaje {
  const item =
    herramienta === "n8n" && turno < GUION_N8N.length
      ? GUION_N8N[turno]
      : GUION_GENERICO[turno % GUION_GENERICO.length];
  return {
    id: `ia-${turno}-${Date.now()}`,
    autor: "ia",
    ...item,
    texto: item.texto.replace("{herramienta}", herramienta),
  };
}

const MENSAJES_INICIALES_N8N: Mensaje[] = [
  {
    id: "n8n-u-0",
    autor: "usuario",
    texto: `Acabo de abrir n8n y no tengo ni idea de qué estoy viendo. ¿Qué es un "workflow"?`,
  },
  {
    id: "n8n-ia-0",
    autor: "ia",
    texto: `Buena pregunta para empezar. Antes de nada, ¿tú vienes más del lado técnico o de negocio? Así te lo explico con el ejemplo que más te va a servir.`,
  },
  {
    id: "n8n-u-1",
    autor: "usuario",
    texto: "Soy de negocio, no programo.",
  },
  {
    id: "n8n-ia-1",
    autor: "ia",
    texto: `Perfecto, entonces piénsalo así: un workflow es como una receta de cocina automática. Cada "nodo" (esos cuadraditos que ves en el lienzo) es un paso de la receta — uno puede decir "cuando llegue un email nuevo", otro "resume ese email con IA", y otro "mándalo a Slack". Tú conectas los pasos con líneas, y n8n los ejecuta solo. ¿Quieres que montemos juntos uno sencillito con tu bandeja de correo como ejemplo?`,
  },
];

const PAUSA_ENTRE_MENSAJES = 900;
const PAUSA_ANTES_DE_ESCRIBIR = 500;
const DURACION_ESCRIBIENDO = 1100;

export default function ChatPage() {
  const { herramienta } = useHerramienta();
  const nombreHerramienta = herramienta ?? "tu herramienta";
  const esN8n = nombreHerramienta === "n8n";

  const [mensajes, setMensajes] = useState<Mensaje[]>(() =>
    esN8n
      ? []
      : [
          {
            id: "bienvenida",
            autor: "ia",
            texto: `Hola, veo que estás aprendiendo ${nombreHerramienta}. ¿En qué puedo ayudarte hoy?`,
          },
        ]
  );
  const [entrada, setEntrada] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const [reproduciendoDemo, setReproduciendoDemo] = useState(esN8n);
  const turnoRef = useRef(esN8n ? GUION_N8N.length : 0);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes, escribiendo]);

  useEffect(() => {
    if (!esN8n) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let tiempo = PAUSA_ANTES_DE_ESCRIBIR;

    MENSAJES_INICIALES_N8N.forEach((mensaje) => {
      if (mensaje.autor === "ia") {
        timers.push(setTimeout(() => setEscribiendo(true), tiempo));
        tiempo += DURACION_ESCRIBIENDO;
        timers.push(
          setTimeout(() => {
            setEscribiendo(false);
            setMensajes((prev) => [...prev, mensaje]);
          }, tiempo)
        );
      } else {
        timers.push(
          setTimeout(() => {
            setMensajes((prev) => [...prev, mensaje]);
          }, tiempo)
        );
      }
      tiempo += PAUSA_ENTRE_MENSAJES;
    });

    timers.push(setTimeout(() => setReproduciendoDemo(false), tiempo));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [esN8n]);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const texto = entrada.trim();
    if (!texto) return;

    setMensajes((prev) => [...prev, { id: `u-${Date.now()}`, autor: "usuario", texto }]);
    setEntrada("");
    setEscribiendo(true);

    const turno = turnoRef.current;
    turnoRef.current += 1;

    setTimeout(() => {
      setEscribiendo(false);
      setMensajes((prev) => [...prev, respuestaSimulada(nombreHerramienta, turno)]);
    }, 700);
  }

  return (
    <div className="flex h-dvh flex-col">
      <CabeceraMovil
        titulo={`Tutor · ${nombreHerramienta}`}
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

      <div className="flex flex-1 flex-col gap-sm overflow-y-auto px-lg py-md">
        {mensajes.map((m) => (
          <div key={m.id} className="flex flex-col gap-xs" style={{ alignSelf: m.autor === "ia" ? "flex-start" : "flex-end" }}>
            <BurbujaChat variante={m.autor}>{m.texto}</BurbujaChat>
            {m.fuentes && m.fuentes.length > 0 ? (
              <div className="flex flex-wrap items-center gap-xs">
                {m.fuentes.map((f) => (
                  <ChipOrigen key={f} tipo={f} />
                ))}
                {m.variasFuentes ? (
                  <span className="text-body-md text-ink-secondary">Varias fuentes</span>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}

        {escribiendo ? (
          <BurbujaChat variante="ia">
            <span className="flex items-center gap-xs">
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
          placeholder={reproduciendoDemo ? "El tutor está escribiendo..." : "Escribe tu pregunta..."}
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          disabled={reproduciendoDemo}
          aria-label="Escribe tu pregunta"
        />
        <button
          type="submit"
          disabled={!entrada.trim() || reproduciendoDemo}
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
