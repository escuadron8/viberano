import { iconoLogo } from "@/lib/icono";

export const dynamic = "force-static";

export async function GET() {
  return iconoLogo(192);
}
