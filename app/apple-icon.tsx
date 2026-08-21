import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const logo = await readFile(join(process.cwd(), "public/nuevo-logo-tutor.jpg"));
const logoDataUrl = `data:image/jpeg;base64,${logo.toString("base64")}`;

export default function AppleIcon() {
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
          width={470}
          height={351}
          style={{ position: "absolute", left: -145, top: -7 }}
        />
      </div>
    ),
    { ...size }
  );
}
