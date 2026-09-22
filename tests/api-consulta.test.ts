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
// `normalizarHerramienta` no se dobla: es una función pura de una línea y lo
// que el test quiere comprobar es justo que el endpoint la aplica antes de
// buscar, no que la llama.
vi.mock("@/lib/buscar", () => ({
  recuperar: vi.fn(),
  normalizarHerramienta: (herramienta: string) => herramienta.trim().toLowerCase(),
}));
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

const ID_CONVERSACION = "33333333-3333-4333-8333-333333333333";

// El doble de Supabase: `auth.getUser()` para la sesión y `from(...).insert()`
// para la persistencia del turno (T-21). `insertar` se deja accesible para
// poder afirmar qué filas se escribieron.
let insertar: ReturnType<typeof vi.fn>;

function sesionDe(usuario: { id: string } | null) {
  return {
    auth: { getUser: async () => ({ data: { user: usuario } }) },
    from: vi.fn(() => ({ insert: insertar })),
  } as unknown as Awaited<ReturnType<typeof crearClienteServidor>>;
}

function filasInsertadas() {
  return insertar.mock.calls[0]?.[0] as { rol: string; contenido: string; fuentes?: unknown }[];
}

beforeEach(() => {
  vi.clearAllMocks();
  insertar = vi.fn(async () => ({ error: null }));
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

  it("responde 400 si 'conversacion_id' viene con un valor que no es un id", async () => {
    const respuesta = await POST(
      peticion({ pregunta: "¿Cómo creo un informe?", herramienta: "salesforce", conversacion_id: 42 })
    );

    expect(respuesta.status).toBe(400);
    expect(recuperarMock).not.toHaveBeenCalled();
  });
});

// T-21: la pantalla manda el nombre tal y como lo enseña ("Salesforce"),
// pero el corpus guarda 'salesforce' y buscar() compara con un '=' exacto.
// Sin esta normalización, todas las preguntas del chat real se irían por el
// camino de abstención aunque el corpus tuviera la respuesta.
describe("POST /api/consulta — nombre de la herramienta", () => {
  it("normaliza el nombre que llega de la UI antes de buscar en el corpus", async () => {
    generarRespuestaMock.mockResolvedValue(respuestaIA([{ id: FRAGMENTOS_ENVIADOS[0].id, tipo: "oficial" }]));

    await POST(peticion({ pregunta: "¿Cómo creo un informe?", herramienta: "  Salesforce  " }));

    expect(recuperarMock).toHaveBeenCalledWith(
      expect.anything(),
      "¿Cómo creo un informe?",
      "salesforce",
      "usuario-a"
    );
  });
});

// T-21: persistencia del turno en `mensaje` (movida aquí desde T-20, que no
// tenía todavía una pantalla que creara la conversación). Alimenta la
// auditoría de SC-002 y SC-003.
describe("POST /api/consulta — persistencia del turno", () => {
  it("guarda la pregunta y la respuesta con sus fuentes cuando hay conversación", async () => {
    const valida = respuestaIA([{ id: FRAGMENTOS_ENVIADOS[0].id, tipo: "oficial" }]);
    generarRespuestaMock.mockResolvedValue(valida);

    await POST(
      peticion({
        pregunta: "¿Cómo creo un informe?",
        herramienta: "salesforce",
        conversacion_id: ID_CONVERSACION,
      })
    );

    expect(filasInsertadas()).toEqual([
      { conversacion_id: ID_CONVERSACION, rol: "usuario", contenido: "¿Cómo creo un informe?" },
      {
        conversacion_id: ID_CONVERSACION,
        rol: "tutor",
        contenido: valida.respuesta,
        fuentes: valida.fuentes,
      },
    ]);
  });

  it("guarda también las abstenciones — son parte de lo que hay que auditar", async () => {
    recuperarMock.mockResolvedValue([]);

    await POST(
      peticion({
        pregunta: "¿Cuál es la capital de Mongolia?",
        herramienta: "salesforce",
        conversacion_id: ID_CONVERSACION,
      })
    );

    const filas = filasInsertadas();
    expect(filas[1].contenido).toBe(RESPUESTA_ABSTENCION);
    expect(filas[1].fuentes).toEqual([]);
  });

  it("no escribe nada si la petición no trae conversación", async () => {
    generarRespuestaMock.mockResolvedValue(respuestaIA([{ id: FRAGMENTOS_ENVIADOS[0].id, tipo: "oficial" }]));

    await POST(peticion({ pregunta: "¿Cómo creo un informe?", herramienta: "salesforce" }));

    expect(insertar).not.toHaveBeenCalled();
  });

  it("devuelve la respuesta igualmente si falla el guardado", async () => {
    const valida = respuestaIA([{ id: FRAGMENTOS_ENVIADOS[0].id, tipo: "oficial" }]);
    generarRespuestaMock.mockResolvedValue(valida);
    insertar.mockResolvedValue({ error: { message: "RLS: fila rechazada" } });
    const errorDeConsola = vi.spyOn(console, "error").mockImplementation(() => {});

    const respuesta = await POST(
      peticion({
        pregunta: "¿Cómo creo un informe?",
        herramienta: "salesforce",
        conversacion_id: ID_CONVERSACION,
      })
    );

    // La persistencia es auditoría: un fallo suyo no puede tragarse una
    // respuesta ya generada delante del usuario.
    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toEqual(valida);
    expect(errorDeConsola).toHaveBeenCalled();

    errorDeConsola.mockRestore();
  });
});

describe("POST /api/consulta — fallo del proveedor de IA", () => {
  it("responde 502 en vez de abstenerse cuando la generación revienta", async () => {
    generarRespuestaMock.mockRejectedValue(new Error("Falta GEMINI_API_KEY (revisa .env.local)"));
    const errorDeConsola = vi.spyOn(console, "error").mockImplementation(() => {});

    const respuesta = await POST(peticion({ pregunta: "¿Cómo creo un informe?", herramienta: "salesforce" }));

    // Decir "no dispongo de información fiable" aquí sería mentir: el corpus
    // sí tenía fragmentos, lo que falló fue el proveedor. La pantalla necesita
    // poder distinguir un error técnico de una abstención real.
    expect(respuesta.status).toBe(502);
    expect(await respuesta.json()).not.toHaveProperty("suficiente");

    errorDeConsola.mockRestore();
  });
});
