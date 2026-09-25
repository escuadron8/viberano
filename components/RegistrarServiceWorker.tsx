"use client";

import { useEffect } from "react";

// T-23: registra public/sw.js, requisito de Chrome/Android para permitir
// "Añadir a pantalla de inicio" además del manifest. Sin JSX ni estado propio,
// así que no hace falta que devuelva nada visible.
export default function RegistrarServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Instalar la PWA no es crítico para usar la app en el navegador.
      });
    }
  }, []);

  return null;
}
