// T-19: prueba del cliente de IA con fragmentos falsos (sin tocar Postgres
// ni RLS — eso ya lo prueba probar-umbral.mts). Comprueba que la respuesta
// valida contra el contrato y que la IA respeta las reglas básicas:
// cita solo ids que existen y se abstiene cuando toca.
//
// Uso: npm run probar-ia

import { join } from "node:path";
import { generarRespuesta } from "../lib/ia.ts";
import type { ResultadoBusqueda } from "../lib/buscar.ts";

try {
  process.loadEnvFile(join(import.meta.dirname, "..", ".env.local"));
} catch {
  // Sin .env.local (por ejemplo en CI): se asume que las variables ya están
  // en el entorno.
}

const FRAGMENTOS_FALSOS: ResultadoBusqueda[] = [
  {
    id: "frag-1",
    tipo: "oficial",
    herramienta: "salesforce",
    titulo: "Cómo crear un informe de oportunidades",
    contenido:
      "Ve a la pestaña Informes, pulsa 'Nuevo informe', elige el tipo 'Oportunidades' y añade los campos que quieras ver. Guarda con un nombre descriptivo.",
    rank: 0.1,
    coincidencias: 4,
  },
  {
    id: "frag-2",
    tipo: "oficial",
    herramienta: "salesforce",
    titulo: "Cómo reasignar un lead",
    contenido:
      "Abre el lead, pulsa el botón 'Cambiar propietario' en la parte superior, busca al nuevo propietario por nombre y confirma.",
    rank: 0.09,
    coincidencias: 3,
  },
];

async function main() {
  console.log("--- Caso 1: pregunta cubierta por los fragmentos ---");
  const r1 = await generarRespuesta("¿Cómo creo un informe de oportunidades?", FRAGMENTOS_FALSOS);
  console.log(JSON.stringify(r1, null, 2));

  const idsValidos = new Set(FRAGMENTOS_FALSOS.map((f) => f.id));
  const citasValidas = r1.fuentes.every((f) => idsValidos.has(f.id));
  console.log(
    r1.suficiente && citasValidas
      ? "✓ suficiente=true y todas las citas existen entre los fragmentos enviados"
      : "✗ fallo: o no marcó suficiente, o citó un id inventado"
  );

  console.log("\n--- Caso 2: pregunta NO cubierta por los fragmentos ---");
  const r2 = await generarRespuesta("¿Cómo configuro un webhook de Salesforce a Slack?", FRAGMENTOS_FALSOS);
  console.log(JSON.stringify(r2, null, 2));
  console.log(r2.suficiente === false ? "✓ se abstuvo correctamente" : "✗ fallo: debía abstenerse y no lo hizo");

  if (!(r1.suficiente && citasValidas) || r2.suficiente !== false) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
