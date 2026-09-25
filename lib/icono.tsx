import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const logo = await readFile(join(process.cwd(), "public/nuevo-logo-tutor.jpg"));
const logoDataUrl = `data:image/jpeg;base64,${logo.toString("base64")}`;

// Recorte de referencia a 128px (el que ya usaba app/icon.tsx). El resto de
// tamaños escala esta misma proporción en vez de repetir números mágicos.
const BASE = { tamano: 128, ancho: 334, alto: 249, izquierda: -103, arriba: -5 };

export function iconoLogo(tamano: number) {
  const k = tamano / BASE.tamano;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "white",
        }}
      >
        <img
          src={logoDataUrl}
          width={Math.round(BASE.ancho * k)}
          height={Math.round(BASE.alto * k)}
          style={{
            position: "absolute",
            left: Math.round(BASE.izquierda * k),
            top: Math.round(BASE.arriba * k),
          }}
        />
      </div>
    ),
    { width: tamano, height: tamano }
  );
}
