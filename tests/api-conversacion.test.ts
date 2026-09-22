// T-21: alta de la conversación del chat. Lo que importa comprobar aquí es
// que la fila se crea con el usuario de la sesión y no con lo que venga en
// el cuerpo de la petición — `usuario_id` es lo que usa la política RLS de
// T-12 para decidir de quién es cada conversación.
//
// Como en tests/api-consulta.test.ts, se dobla Supabase entero: el test no
// toca ni la red ni la base de datos.

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ crearClienteServidor: vi.fn() }));

import { POST } from "@/app/api/conversacion/route";
import { crearClienteServidor } from "@/lib/supabase/server";

const crearClienteServidorMock = vi.mocked(crearClienteServidor);

const ID_CONVERSACION = "33333333-3333-4333-8333-333333333333";

let insertar: ReturnType<typeof vi.fn>;
let resultadoInsert: { data: { id: string } | null; error: { message: string } | null };

// La cadena que usa el endpoint: from(...).insert(...).select(...).single().
function sesionDe(usuario: { id: string } | null) {
  return {
    auth: { getUser: async () => ({ data: { user: usuario } }) },
    from: vi.fn(() => ({
      insert: insertar.mockReturnValue({
        select: () => ({ single: async () => resultadoInsert }),
      }),
    })),
  } as unknown as Awaited<ReturnType<typeof crearClienteServidor>>;
}

function peticion(cuerpo: unknown): Request {
  return new Request("http://localhost/api/conversacion", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  insertar = vi.fn();
  resultadoInsert = { data: { id: ID_CONVERSACION }, error: null };
  crearClienteServidorMock.mockResolvedValue(sesionDe({ id: "usuario-a" }));
});

describe("POST /api/conversacion", () => {
  it("crea la conversación del usuario de la sesión y devuelve su id", async () => {
    const respuesta = await POST(peticion({ herramienta: "Salesforce" }));

    expect(respuesta.status).toBe(201);
    expect(await respuesta.json()).toEqual({ id: ID_CONVERSACION });
    // El nombre se guarda normalizado, igual que lo busca /api/consulta.
    expect(insertar).toHaveBeenCalledWith({ usuario_id: "usuario-a", herramienta: "salesforce" });
  });

  it("ignora cualquier 'usuario_id' que venga en el cuerpo", async () => {
    await POST(peticion({ herramienta: "salesforce", usuario_id: "usuario-b" }));

    // El dueño de la conversación sale de la sesión, nunca de la petición:
    // aceptarlo del cuerpo sería escribir en la conversación de otro.
    expect(insertar).toHaveBeenCalledWith({ usuario_id: "usuario-a", herramienta: "salesforce" });
  });

  it("responde 400 sin tocar la base de datos si falta 'herramienta'", async () => {
    const respuesta = await POST(peticion({}));

    expect(respuesta.status).toBe(400);
    expect(insertar).not.toHaveBeenCalled();
  });

  it("responde 401 si no hay sesión", async () => {
    crearClienteServidorMock.mockResolvedValue(sesionDe(null));

    const respuesta = await POST(peticion({ herramienta: "salesforce" }));

    expect(respuesta.status).toBe(401);
    expect(insertar).not.toHaveBeenCalled();
  });

  it("responde 500 cuando la base de datos rechaza el insert", async () => {
    resultadoInsert = { data: null, error: { message: "RLS: fila rechazada" } };

    const respuesta = await POST(peticion({ herramienta: "salesforce" }));

    expect(respuesta.status).toBe(500);
  });
});
