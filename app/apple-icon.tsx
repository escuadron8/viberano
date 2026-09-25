import { iconoLogo } from "@/lib/icono";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return iconoLogo(size.width);
}
