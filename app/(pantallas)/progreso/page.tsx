import { AnilloProgreso } from "@/components/AnilloProgreso";
import { Cabecera } from "@/components/Cabecera";
import { Tarjeta } from "@/components/Tarjeta";

const LECCIONES_RECOMENDADAS = [
  { titulo: "Crea tu primer informe", herramienta: "Tableau" },
  { titulo: "Automatiza un flujo con reglas", herramienta: "Salesforce" },
  { titulo: "Organiza un tablero Kanban", herramienta: "Jira" },
];

export default function ProgresoPage() {
  return (
    <>
      <Cabecera titulo="Tu progreso" />
      <main className="flex flex-1 flex-col items-center gap-xl p-lg">
        <AnilloProgreso progreso={42} tamano={128} grosor={10} />

        <section className="flex w-full flex-col gap-sm">
          <h2 className="text-heading-md text-ink-base">Micro-lecciones recomendadas</h2>
          {LECCIONES_RECOMENDADAS.map((leccion) => (
            <Tarjeta key={leccion.titulo}>
              <p className="text-body-md text-ink-base">{leccion.titulo}</p>
              <p className="text-body-md text-ink-secondary">{leccion.herramienta}</p>
            </Tarjeta>
          ))}
        </section>
      </main>
    </>
  );
}
