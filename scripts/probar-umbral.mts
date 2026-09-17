// T-17: prueba del umbral de relevancia. Las 10 preguntas conocidas de T-16
// deben devolver al menos un resultado por encima de UMBRAL_RELEVANCIA; 5
// preguntas deliberadamente fuera del corpus no deben devolver ninguno.
//
// Uso: npm run probar-umbral

import { createClient } from "@supabase/supabase-js";
import { join } from "node:path";
import { recuperar, UMBRAL_RELEVANCIA } from "../lib/buscar.ts";

try {
  process.loadEnvFile(join(import.meta.dirname, "..", ".env.local"));
} catch {
  // Sin .env.local (por ejemplo en CI): se asume que las variables ya están
  // en el entorno.
}

const CUBIERTAS = [
  "¿Cómo creo un informe de oportunidades?",
  "¿Cómo reasigno un lead a otro compañero?",
  "¿Cómo abro un caso de soporte para un cliente?",
  "¿Cómo convierto un lead calificado en cuenta y oportunidad?",
  "¿Cómo filtro una vista de lista?",
  "¿Cómo envío un correo con una plantilla?",
  "¿Cómo actualizo muchos registros al mismo tiempo?",
  "¿Cómo armo un dashboard con mis informes?",
  "¿Cómo fusiono dos cuentas duplicadas?",
  "¿Cómo cambio la fase de una oportunidad?",
];

const FUERA_DE_CORPUS = [
  "¿Cómo creo un webhook para notificar cambios en tiempo real?",
  "¿Cómo hago una copia de seguridad completa de mi organización?",
  "¿Cómo activo las recomendaciones de Einstein para oportunidades?",
  "¿Cómo escribo un trigger en Apex para validar un campo?",
  "¿Cómo conecto Salesforce con Slack para notificaciones?",
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveServicio = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !claveServicio) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (revisa .env.local)"
    );
  }

  const supabase = createClient(url, claveServicio);
  console.log(`Umbral de relevancia: ${UMBRAL_RELEVANCIA}\n`);

  let aciertosCubiertas = 0;
  console.log("--- Preguntas cubiertas por el corpus (deben pasar el umbral) ---");
  for (const pregunta of CUBIERTAS) {
    const resultados = await recuperar(supabase, pregunta, "salesforce");
    const pasa = resultados.length > 0;
    if (pasa) aciertosCubiertas++;
    const mejorRank = resultados[0]?.rank.toFixed(4) ?? "—";
    console.log(`${pasa ? "✓" : "✗"} [${mejorRank}] ${pregunta}`);
  }

  let aciertosFuera = 0;
  console.log("\n--- Preguntas fuera del corpus (deben quedar por debajo) ---");
  for (const pregunta of FUERA_DE_CORPUS) {
    const resultados = await recuperar(supabase, pregunta, "salesforce");
    const pasa = resultados.length === 0;
    if (pasa) aciertosFuera++;
    const mejorRank = resultados[0]?.rank.toFixed(4) ?? "—";
    console.log(`${pasa ? "✓" : "✗"} [${mejorRank}] ${pregunta}`);
  }

  console.log(
    `\nCubiertas por encima del umbral: ${aciertosCubiertas}/${CUBIERTAS.length}`
  );
  console.log(
    `Fuera de corpus por debajo del umbral: ${aciertosFuera}/${FUERA_DE_CORPUS.length}`
  );

  if (aciertosCubiertas < CUBIERTAS.length || aciertosFuera < FUERA_DE_CORPUS.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
