"use client";

import { AnilloProgreso } from "@/components/AnilloProgreso";
import { CabeceraMovil } from "@/components/CabeceraMovil";
import { Tarjeta } from "@/components/Tarjeta";
import { useHerramienta } from "@/components/HerramientaProvider";

const MICRO_LECCIONES = [
  { titulo: "Dominando Filtros Avanzados", progreso: 80 },
  { titulo: "Reportes Dinámicos", progreso: 45 },
  { titulo: "Automatizaciones con Flow", progreso: 10 },
];

export default function ProgresoPage() {
  const { herramienta } = useHerramienta();
  const nombreHerramienta = herramienta ?? "tu herramienta";

  return (
    <div className="flex flex-1 flex-col">
      <CabeceraMovil titulo={`Tu progreso en ${nombreHerramienta}.`} hrefAtras="/chat" />

      <main className="flex flex-1 flex-col items-center gap-xl px-lg pb-xl pt-lg">
        <AnilloProgreso progreso={65} tamano={176} grosor={14} etiqueta="Dominio Actual" />

        <section className="flex w-full flex-col gap-sm">
          <h2 className="text-heading-md text-ink-base">Siguientes micro-lecciones.</h2>

          <div className="flex flex-col gap-sm">
            {MICRO_LECCIONES.map((leccion) => (
              <Tarjeta key={leccion.titulo} className="flex flex-col gap-xs">
                <span className="text-heading-md text-ink-base">{leccion.titulo}</span>
                <div className="h-1.5 w-full overflow-hidden rounded-pill bg-hairline">
                  <div
                    className="h-full rounded-pill bg-success"
                    style={{ width: `${leccion.progreso}%` }}
                  />
                </div>
              </Tarjeta>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
