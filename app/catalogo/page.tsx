import { AnilloProgreso } from "@/components/AnilloProgreso";
import { Boton } from "@/components/Boton";
import { BurbujaChat } from "@/components/BurbujaChat";
import { CampoTexto } from "@/components/CampoTexto";
import { ChipOrigen } from "@/components/ChipOrigen";
import { Tarjeta } from "@/components/Tarjeta";

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-sm">
      <h2 className="text-heading-md text-ink-base">{titulo}</h2>
      {children}
    </section>
  );
}

export default function CatalogoPage() {
  return (
    <main className="flex flex-col gap-xl p-lg max-w-[375px] mx-auto">
      <h1 className="text-display-xl text-ink-base">Catálogo</h1>

      <Seccion titulo="Boton">
        <div className="flex flex-wrap gap-sm">
          <Boton variante="primario">Empezar</Boton>
          <Boton variante="secundario">Cancelar</Boton>
        </div>
      </Seccion>

      <Seccion titulo="Tarjeta">
        <Tarjeta>
          <p className="text-body-md text-ink-base">Contenido de una tarjeta.</p>
        </Tarjeta>
      </Seccion>

      <Seccion titulo="CampoTexto">
        <CampoTexto placeholder="Escribe tu pregunta..." />
      </Seccion>

      <Seccion titulo="BurbujaChat">
        <div className="flex flex-col gap-sm">
          <BurbujaChat variante="ia">Hola, ¿en qué puedo ayudarte hoy?</BurbujaChat>
          <BurbujaChat variante="usuario">¿Cómo creo un informe en Tableau?</BurbujaChat>
        </div>
      </Seccion>

      <Seccion titulo="ChipOrigen">
        <div className="flex flex-wrap gap-sm">
          <ChipOrigen tipo="oficial" />
          <ChipOrigen tipo="compartido" />
          <ChipOrigen tipo="personal" />
        </div>
      </Seccion>

      <Seccion titulo="AnilloProgreso">
        <AnilloProgreso progreso={65} />
      </Seccion>
    </main>
  );
}
