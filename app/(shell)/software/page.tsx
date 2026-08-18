"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CampoTexto } from "@/components/CampoTexto";
import { Tarjeta } from "@/components/Tarjeta";
import { useHerramienta, type Herramienta } from "@/components/HerramientaProvider";

const HERRAMIENTAS: { nombre: Herramienta; inicial: string; estilo: string }[] = [
  { nombre: "Salesforce", inicial: "S", estilo: "bg-primary/15 text-primary" },
  { nombre: "Jira", inicial: "J", estilo: "bg-success/25 text-ink-base" },
  { nombre: "Figma", inicial: "F", estilo: "bg-primary-soft/30 text-primary" },
  { nombre: "Tableau", inicial: "T", estilo: "bg-canvas-soft text-ink-secondary border border-hairline" },
];

export default function SoftwarePage() {
  const router = useRouter();
  const { seleccionar } = useHerramienta();
  const [busqueda, setBusqueda] = useState("");

  const herramientasFiltradas = useMemo(
    () =>
      HERRAMIENTAS.filter((h) =>
        h.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
      ),
    [busqueda]
  );

  function elegir(herramienta: Herramienta) {
    seleccionar(herramienta);
    router.push("/chat");
  }

  return (
    <main className="flex flex-1 flex-col gap-lg px-lg pb-xl pt-lg">
      <h1 className="text-display-xl text-ink-base">Selecciona el software a dominar.</h1>

      <CampoTexto
        placeholder="Buscar"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar software"
      />

      <div className="flex flex-col gap-sm">
        {herramientasFiltradas.map((h) => (
          <button
            key={h.nombre}
            type="button"
            className="w-full text-left"
            onClick={() => elegir(h.nombre)}
          >
            <Tarjeta className="flex items-center gap-sm transition-colors hover:bg-canvas-soft">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-heading-md ${h.estilo}`}
              >
                {h.inicial}
              </span>
              <span className="text-heading-md text-ink-base">{h.nombre}</span>
            </Tarjeta>
          </button>
        ))}

        {herramientasFiltradas.length === 0 ? (
          <p className="text-body-md text-ink-secondary">Sin resultados para &quot;{busqueda}&quot;.</p>
        ) : null}
      </div>
    </main>
  );
}
