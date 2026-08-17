import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite probar `next dev` desde el móvil en la misma red WiFi
  // (Next.js bloquea por defecto peticiones que no vengan de localhost).
  allowedDevOrigins: ["192.168.1.16"],
};

export default nextConfig;
