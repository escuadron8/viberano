"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

export type Herramienta = "Salesforce" | "Jira" | "Claude" | "n8n";

export const HERRAMIENTAS: Herramienta[] = ["Salesforce", "Jira", "Claude", "n8n"];

type HerramientaContextValue = {
  herramienta: Herramienta | null;
  // Hasta que el componente no está hidratado en el navegador no se sabe si
  // hay herramienta elegida: en el servidor no existe `sessionStorage`. Sin
  // esta bandera, el chat vería `null` en el primer render y mandaría de
  // vuelta a /software a quien solo ha recargado la página.
  cargando: boolean;
  seleccionar: (herramienta: Herramienta) => void;
};

const CLAVE_SESION = "tutor:herramienta";

const HerramientaContext = createContext<HerramientaContextValue | null>(null);

// T-21: la elección se guarda en `sessionStorage` porque a partir de ahora el
// chat la necesita de verdad — es lo que se manda a /api/consulta. Viviendo
// solo en el estado de React, recargar /chat (o volver a abrir la PWA) dejaba
// la pantalla sin herramienta y toda consulta habría fallado con un 400.
//
// `sessionStorage` es un sistema externo a React, así que se lee con
// useSyncExternalStore en vez de con un efecto que llame a setState: React
// se encarga de servir null durante el render del servidor y el valor real
// tras la hidratación, sin desajustes ni renders en cascada.
const oyentes = new Set<() => void>();

// La instantánea tiene que ser estable entre renders (si devolviera un valor
// nuevo cada vez, React entraría en bucle), de ahí la caché.
let cache: Herramienta | null | undefined;

function leerDeLaSesion(): Herramienta | null {
  try {
    const guardada = sessionStorage.getItem(CLAVE_SESION);
    return HERRAMIENTAS.find((h) => h === guardada) ?? null;
  } catch {
    // Navegador sin sessionStorage disponible (modo privado estricto): se
    // sigue funcionando, solo que la elección no sobrevive a una recarga.
    return null;
  }
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

function instantanea(): Herramienta | null {
  if (cache === undefined) {
    cache = leerDeLaSesion();
  }
  return cache;
}

function instantaneaServidor(): Herramienta | null {
  return null;
}

function guardar(elegida: Herramienta) {
  cache = elegida;
  try {
    sessionStorage.setItem(CLAVE_SESION, elegida);
  } catch {
    // Ver leerDeLaSesion(): sin almacenamiento la app sigue siendo usable.
  }
  for (const oyente of oyentes) oyente();
}

export function HerramientaProvider({ children }: { children: ReactNode }) {
  const herramienta = useSyncExternalStore(suscribir, instantanea, instantaneaServidor);
  // Mismo mecanismo para saber si ya estamos en el navegador: en el servidor
  // devuelve false, tras la hidratación true.
  const hidratado = useSyncExternalStore(
    suscribir,
    () => true,
    () => false
  );

  return (
    <HerramientaContext.Provider
      value={{ herramienta, cargando: !hidratado, seleccionar: guardar }}
    >
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
