// T-20: la prueba que sostiene SC-002.
//
// La verificación de citas de `/api/consulta` (FR-007) no se puede probar
// con el modelo real: no hay forma fiable de conseguir que Gemini invente
// un id a propósito. Por eso aquí se sustituye `generarRespuesta()` por un
// doble que devuelve exactamente la respuesta que queremos — incluida una
// con un id que nunca se envió — y se comprueba qué hace el endpoint con
// ella. Lo que se prueba es la defensa determinista del servidor, no el
// comportamiento del modelo (eso ya lo mira `npm run probar-ia`).
//
// Se mockean las tres fronteras del endpoint (Supabase, recuperación e IA)
// para que el test no toque ni la red ni la base de datos.

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResultadoBusqueda } from "@/lib/buscar";
import type { RespuestaIA } from "@/lib/ia";

vi.mock("@/lib/supabase/server", () => ({ crearClienteServidor: vi.fn() }));
vi.mock("@/lib/buscar", () => ({ recuperar: vi.fn() }));
vi.mock("@/lib/ia", () => ({ generarRespuesta: vi.fn() }));

import { POST } from "@/app/api/consulta/route";
import { crearClienteServidor } from "@/lib/supabase/server";
import { recuperar } from "@/lib/buscar";
import { generarRespuesta } from "@/lib/ia";

const crearClienteServidorMock = vi.mocked(crearClienteServidor);
const recuperarMock = vi.mocked(recuperar);
const generarRespuestaMock = vi.mocked(generarRespuesta);

// Copia literal del mensaje de app/api/consulta/route.ts. No se importa de
// allí a propósito: un route handler de App Router solo puede exportar los
// métodos HTTP y sus opciones de configuración, así que exportar la
// constante rompería el build. Si cambia el mensaje, este test falla — que
// es justo lo que queremos que pase.
const RESPUESTA_ABSTENCION =
  "No dispongo de información fiable para responder a esto todavía.";

const CUERPO_ABSTENCION = {
  suficiente: false,
  respuesta: RESPUESTA_ABSTENCION,
  fuentes: [],
  multiples_fuentes: false,
};

const FRAGMENTOS_ENVIADOS: ResultadoBusqueda[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    tipo: "oficial",
    herramienta: "salesforce",
    titulo: "Cómo crear un informe de oportunidades",
    contenido: "Ve a la pestaña Informes, pulsa 'Nuevo informe' y elige el tipo 'Oportunidades'.",
    rank: 0.12,
    coincidencias: 4,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    tipo: "compartido",
    herramienta: "salesforce",
    titulo: "Truco del equipo para filtrar informes",
    contenido: "Guarda el filtro como vista para no repetirlo cada semana.",
    rank: 0.07,
    coincidencias: 3,
  },
];

// Un id con forma perfectamente válida pero que no está entre los
// fragmentos de arriba: exactamente lo que haría una alucinación creíble.
const ID_INVENTADO = "99999999-9999-4999-8999-999999999999";

function peticion(cuerpo: unknown): Request {
  return new Request("http://localhost/api/consulta", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
}

function respuestaIA(fuentes: RespuestaIA["fuentes"]): RespuestaIA {
  return {
    suficiente: true,
    respuesta: "Ve a la pestaña Informes y pulsa 'Nuevo informe'.",
    fuentes,
    multiples_fuentes: fuentes.length > 1,
  };
}

function sesionDe(usuario: { id: string } | null) {
  return {
    auth: { getUser: async () => ({ data: { user: usuario } }) },
  } as unknown as Awaited<ReturnType<typeof crearClienteServidor>>;
}

beforeEach(() => {
  vi.clearAllMocks();
  crearClienteServidorMock.mockResolvedValue(sesionDe({ id: "usuario-a" }));
  recuperarMock.mockResolvedValue(FRAGMENTOS_ENVIADOS);
});

describe("POST /api/consulta — verificación de citas (FR-007, SC-002)", () => {
  it("descarta la respuesta y se abstiene cuando la IA cita un id que no se le envió", async () => {
    generarRespuestaMock.mockResolvedValue(respuestaIA([{ id: ID_INVENTADO, tipo: "oficial" }]));

    const respuesta = await POST(peticion({ pregunta: "¿Cómo creo un informe?", herramienta: "salesforce" }));
    const cuerpo = await respuesta.json();

    expect(respuesta.status).toBe(200);
    expect(cuerpo).toEqual(CUERPO_ABSTENCION);
    // La cita inventada no puede llegar al cliente por ninguna vía.
    expect(JSON.stringify(cuerpo)).not.toContain(ID_INVENTADO);
  });

  it("descarta la respuesta entera aunque solo una de las citas sea inventada", async () => {
    generarRespuestaMock.mockResolvedValue(
      respuestaIA([
        { id: FRAGMENTOS_ENVIADOS[0].id, tipo: "oficial" },
        { id: ID_INVENTADO, tipo: "oficial" },
      ])
    );

    const respuesta = await POST(peticion({ pregunta: "¿Cómo creo un informe?", herramienta: "salesforce" }));

    // Media respuesta no vale: si una cita es falsa, se cae entera a la
    // abstención en vez de devolver la parte "buena".
    expect(await respuesta.json()).toEqual(CUERPO_ABSTENCION);
  });

  it("devuelve la respuesta tal cual cuando todas las citas existen entre los fragmentos enviados", async () => {
    const valida = respuestaIA([
      { id: FRAGMENTOS_ENVIADOS[0].id, tipo: "oficial" },
      { id: FRAGMENTOS_ENVIADOS[1].id, tipo: "compartido" },
    ]);
    generarRespuestaMock.mockResolvedValue(valida);

    const respuesta = await POST(peticion({ pregunta: "¿Cómo creo un informe?", herramienta: "salesforce" }));

    // El caso de control: sin esto, un endpoint que se abstuviera siempre
    // pasaría los dos tests de arriba.
    expect(await respuesta.json()).toEqual(valida);
  });
});

describe("POST /api/consulta — camino de abstención (FR-008, T-18)", () => {
  it("se abstiene sin llamar al modelo cuando no hay fragmentos por encima del umbral", async () => {
    recuperarMock.mockResolvedValue([]);

    const respuesta = await POST(peticion({ pregunta: "¿Cuál es la capital de Mongolia?", herramienta: "salesforce" }));

    expect(await respuesta.json()).toEqual(CUERPO_ABSTENCION);
    expect(generarRespuestaMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/consulta — validación de entrada y sesión", () => {
  it("responde 400 y no busca nada si falta 'pregunta' o 'herramienta'", async () => {
    const respuesta = await POST(peticion({ herramienta: "salesforce" }));

    expect(respuesta.status).toBe(400);
    expect(recuperarMock).not.toHaveBeenCalled();
    expect(generarRespuestaMock).not.toHaveBeenCalled();
  });

  it("responde 400 cuando 'pregunta' viene vacía o en blanco", async () => {
    const respuesta = await POST(peticion({ pregunta: "   ", herramienta: "salesforce" }));

    expect(respuesta.status).toBe(400);
    expect(recuperarMock).not.toHaveBeenCalled();
  });

  it("responde 401 y no consulta el corpus si no hay sesión", async () => {
    crearClienteServidorMock.mockResolvedValue(sesionDe(null));

    const respuesta = await POST(peticion({ pregunta: "¿Cómo creo un informe?", herramienta: "salesforce" }));

    expect(respuesta.status).toBe(401);
    expect(recuperarMock).not.toHaveBeenCalled();
    expect(generarRespuestaMock).not.toHaveBeenCalled();
  });
});
