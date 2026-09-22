// Configuración de la suite de tests (T-20). El camino que documenta el
// propio Next para tests unitarios es Vitest — ver
// node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md — aunque
// ese doc todavía manda instalar `vite-tsconfig-paths`: esta versión de
// Vite ya resuelve los `paths` de tsconfig.json nativamente con la opción
// de abajo, que es lo que hace funcionar el alias `@/` en los tests.
//
// Entorno `node` (no jsdom): lo que se prueba aquí son route handlers y
// funciones de servidor, no componentes. Cuando T-21 traiga tests de
// componentes habrá que añadir jsdom y React Testing Library.

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
