import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tutor: Tu guía personal en cada nueva herramienta.",
    short_name: "Tutor",
    description: "Tu guía personal en cada nueva herramienta.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#60A5FA",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
