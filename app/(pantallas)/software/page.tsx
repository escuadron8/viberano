"use client";

import { useRouter } from "next/navigation";
import { Cabecera } from "@/components/Cabecera";
import { Tarjeta } from "@/components/Tarjeta";
import { HERRAMIENTA_STORAGE_KEY } from "@/lib/estado-cliente";

const HERRAMIENTAS = ["Salesforce", "Jira", "Figma", "Tableau"] as const;

export default function SoftwarePage() {
  const router = useRouter();

  function elegir(herramienta: string) {
    localStorage.setItem(HERRAMIENTA_STORAGE_KEY, herramienta);
    router.push("/chat");
  }

  return (
    <>
      <Cabecera titulo="Elige tu herramienta" />
      <main className="flex flex-1 flex-col gap-sm p-lg">
        {HERRAMIENTAS.map((herramienta) => (
          <button key={herramienta} type="button" onClick={() => elegir(herramienta)} className="w-full text-left">
            <Tarjeta className="transition-colors hover:border-primary-soft">
              <span className="text-heading-md text-ink-base">{herramienta}</span>
            </Tarjeta>
          </button>
        ))}
      </main>
    </>
  );
}
