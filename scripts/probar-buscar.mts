// T-16: prueba de la función buscar() — 10 preguntas conocidas del corpus de
// Salesforce. Para al menos 8 de las 10, el documento correcto debe aparecer
// en el top 3 de resultados.
//
// Usa el cliente de service_role (igual que scripts/cargar-corpus.mts): es
// un script de prueba fuera de una sesión de usuario, no el camino que sigue
// la app en producción (ahí buscar() se llama con el cliente ligado a la
// sesión, y entran en juego las políticas RLS de T-12).
//
// Uso: npm run probar-buscar

import { createClient } from "@supabase/supabase-js";
import { join } from "node:path";
import { buscar } from "../lib/buscar.ts";

try {
  process.loadEnvFile(join(import.meta.dirname, "..", ".env.local"));
} catch {
  // Sin .env.local (por ejemplo en CI): se asume que las variables ya están
  // en el entorno.
}

const PREGUNTAS: { pregunta: string; tituloEsperado: string }[] = [
  { pregunta: "¿Cómo creo un informe de oportunidades?", tituloEsperado: "Cómo crear un informe de oportunidades" },
  { pregunta: "¿Cómo reasigno un lead a otro compañero?", tituloEsperado: "Cómo asignar un lead a otro usuario" },
  { pregunta: "¿Cómo abro un caso de soporte para un cliente?", tituloEsperado: "Cómo crear un caso de soporte" },
  { pregunta: "¿Cómo convierto un lead calificado en cuenta y oportunidad?", tituloEsperado: "Cómo convertir un lead en cuenta, contacto y oportunidad" },
  { pregunta: "¿Cómo filtro una vista de lista?", tituloEsperado: "Cómo crear y filtrar una vista de lista" },
  { pregunta: "¿Cómo envío un correo con una plantilla?", tituloEsperado: "Cómo crear y usar una plantilla de correo" },
  { pregunta: "¿Cómo actualizo muchos registros al mismo tiempo?", tituloEsperado: "Cómo actualizar varios registros a la vez" },
  { pregunta: "¿Cómo armo un dashboard con mis informes?", tituloEsperado: "Cómo crear un dashboard a partir de informes" },
  { pregunta: "¿Cómo fusiono dos cuentas duplicadas?", tituloEsperado: "Cómo fusionar cuentas duplicadas" },
  { pregunta: "¿Cómo cambio la fase de una oportunidad?", tituloEsperado: "Cómo cambiar la fase de una oportunidad y por qué importa" },
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
  let aciertos = 0;

  for (const { pregunta, tituloEsperado } of PREGUNTAS) {
    const resultados = await buscar(supabase, pregunta, "salesforce");
    const posicion = resultados.findIndex((r) => r.titulo === tituloEsperado);
    const acierto = posicion !== -1 && posicion < 3;
    if (acierto) aciertos++;

    console.log(`\n"${pregunta}"`);
    resultados.forEach((r, i) => {
      const marca = r.titulo === tituloEsperado ? " ←" : "";
      console.log(`  ${i + 1}. [${r.rank.toFixed(4)}] ${r.titulo}${marca}`);
    });
    console.log(acierto ? "  ✓ esperado en el top 3" : "  ✗ esperado NO está en el top 3");
  }

  console.log(`\n${aciertos}/${PREGUNTAS.length} preguntas con el documento correcto en el top 3.`);
  if (aciertos < 8) {
    console.log("Por debajo del umbral de T-16 (8/10).");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
