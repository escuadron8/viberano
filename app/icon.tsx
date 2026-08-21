import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 128, height: 128 };
export const contentType = "image/png";

const logo = await readFile(join(process.cwd(), "public/nuevo-logo-tutor.jpg"));
const logoDataUrl = `data:image/jpeg;base64,${logo.toString("base64")}`;

export default function Icon() {
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
          width={334}
          height={249}
          style={{ position: "absolute", left: -103, top: -5 }}
        />
      </div>
    ),
    { ...size }
  );
}
