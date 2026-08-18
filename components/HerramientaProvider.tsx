"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Herramienta = "Salesforce" | "Jira" | "Figma" | "Tableau";

type HerramientaContextValue = {
  herramienta: Herramienta | null;
  seleccionar: (herramienta: Herramienta) => void;
};

const HerramientaContext = createContext<HerramientaContextValue | null>(null);

export function HerramientaProvider({ children }: { children: ReactNode }) {
  const [herramienta, setHerramienta] = useState<Herramienta | null>(null);

  return (
    <HerramientaContext.Provider value={{ herramienta, seleccionar: setHerramienta }}>
      {children}
    </HerramientaContext.Provider>
  );
}

export function useHerramienta() {
  const ctx = useContext(HerramientaContext);
  if (!ctx) {
    throw new Error("useHerramienta debe usarse dentro de HerramientaProvider");
  }
  return ctx;
}
