// T-19: cliente de IA y contrato de respuesta. Google Gemini en vez de Claude
// (decisión del 2026-09-22: sin presupuesto para una API key de pago, el
// free tier de Gemini no pide tarjeta y soporta salida estructurada nativa,
// que es justo lo que necesita este contrato). Ver specs/plan.md §1 y §3.
//
// El resto del pipeline (recuperar() en lib/buscar.ts, el umbral de T-17, la
// verificación de citas de T-20) no depende de qué proveedor esté aquí
// detrás — si hiciera falta cambiar de proveedor otra vez, este es el único
// archivo que cambia.

import { GoogleGenAI, Type } from "@google/genai";
import type { ResultadoBusqueda, TipoConocimiento } from "@/lib/buscar";

export type Fuente = {
  id: string;
  tipo: TipoConocimiento;
};

export type RespuestaIA = {
  suficiente: boolean;
  respuesta: string;
  fuentes: Fuente[];
  multiples_fuentes: boolean;
};

export type TurnoHistorial = {
  rol: "usuario" | "tutor";
  contenido: string;
};

const MODELO = "gemini-2.5-flash";

// FR-007, FR-008: las dos reglas que sostienen la defensa contra la
// alucinación viven en el prompt (citar solo lo recibido, abstenerse si no
// alcanza) pero no son la única defensa — T-20 vuelve a comprobar en
// servidor que cada id citado existe de verdad entre los fragmentos
// enviados. El prompt es la primera barrera, no la única.
const REGLAS_SISTEMA = `Eres el Tutor, un asistente que responde dudas sobre el uso de herramientas de software (Salesforce, Jira, Figma, Tableau) a partir ÚNICAMENTE de los fragmentos de documentación que se te entregan en cada turno.

Reglas estrictas:
1. Usa solo la información de los fragmentos numerados del turno actual. No completes con conocimiento propio del producto, aunque lo tengas.
2. Si los fragmentos no contienen la respuesta a la pregunta, o solo la cubren parcialmente y no puedes confirmarla, responde con suficiente=false y respuesta explicando que no dispones de información fiable sobre eso. No adivines ni rellenes huecos.
3. Cada objeto de "fuentes" debe usar exactamente el id de un fragmento que se te entregó — nunca inventes un id ni cites un fragmento que no exista.
4. Si la respuesta se apoya en más de un fragmento distinto, marca multiples_fuentes=true; si es uno solo, false.
5. Si dos fragmentos se contradicen, prioriza el de tipo "oficial" y dilo explícitamente en la respuesta.
6. Responde en español, tono cercano y directo, en pocas frases — esto es una app de móvil, no un manual.`;

const ESQUEMA_RESPUESTA = {
  type: Type.OBJECT,
  properties: {
    suficiente: { type: Type.BOOLEAN },
    respuesta: { type: Type.STRING },
    fuentes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          tipo: {
            type: Type.STRING,
            enum: ["oficial", "compartido", "personal"],
          },
        },
        required: ["id", "tipo"],
      },
    },
    multiples_fuentes: { type: Type.BOOLEAN },
  },
  required: ["suficiente", "respuesta", "fuentes", "multiples_fuentes"],
};

let cliente: GoogleGenAI | null = null;

function obtenerCliente(): GoogleGenAI {
  if (!cliente) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Falta GEMINI_API_KEY (revisa .env.local)");
    }
    cliente = new GoogleGenAI({ apiKey });
  }
  return cliente;
}

function construirPromptUsuario(pregunta: string, fragmentos: ResultadoBusqueda[]): string {
  const fragmentosTexto = fragmentos
    .map((f) => `[${f.id}] (${f.tipo}) ${f.titulo}\n${f.contenido}`)
    .join("\n\n---\n\n");

  return `Fragmentos disponibles para este turno:\n\n${fragmentosTexto}\n\n---\n\nPregunta: ${pregunta}`;
}

// Defensa en profundidad: aunque responseSchema ya obliga la forma en el
// lado de Gemini, no confiamos ciegamente en un JSON.parse ajeno — se
// vuelve a comprobar la forma antes de devolverlo al llamador.
function validarContrato(json: unknown): RespuestaIA {
  if (typeof json !== "object" || json === null) {
    throw new Error("La IA no devolvió un objeto JSON.");
  }
  const r = json as Record<string, unknown>;

  if (typeof r.suficiente !== "boolean" || typeof r.respuesta !== "string" || typeof r.multiples_fuentes !== "boolean" || !Array.isArray(r.fuentes)) {
    throw new Error("La respuesta de la IA no cumple el esquema esperado.");
  }

  const fuentes = r.fuentes.map((f): Fuente => {
    if (typeof f !== "object" || f === null) {
      throw new Error("Una fuente de la respuesta no es un objeto válido.");
    }
    const fr = f as Record<string, unknown>;
    if (typeof fr.id !== "string" || (fr.tipo !== "oficial" && fr.tipo !== "compartido" && fr.tipo !== "personal")) {
      throw new Error("Una fuente de la respuesta tiene forma inválida.");
    }
    return { id: fr.id, tipo: fr.tipo };
  });

  return {
    suficiente: r.suficiente,
    respuesta: r.respuesta,
    fuentes,
    multiples_fuentes: r.multiples_fuentes,
  };
}

// T-22 reenvía aquí los últimos N turnos; los fragmentos recuperados van
// solo en el mensaje del turno actual, nunca se acumulan en el historial.
export async function generarRespuesta(
  pregunta: string,
  fragmentos: ResultadoBusqueda[],
  historial: TurnoHistorial[] = []
): Promise<RespuestaIA> {
  const ai = obtenerCliente();

  const contenidos = [
    ...historial.map((h) => ({
      role: h.rol === "usuario" ? "user" : "model",
      parts: [{ text: h.contenido }],
    })),
    { role: "user", parts: [{ text: construirPromptUsuario(pregunta, fragmentos) }] },
  ];

  const resultado = await ai.models.generateContent({
    model: MODELO,
    contents: contenidos,
    config: {
      systemInstruction: REGLAS_SISTEMA,
      responseMimeType: "application/json",
      responseSchema: ESQUEMA_RESPUESTA,
    },
  });

  const texto = resultado.text;
  if (!texto) {
    throw new Error("Gemini no devolvió texto en la respuesta.");
  }

  return validarContrato(JSON.parse(texto));
}
