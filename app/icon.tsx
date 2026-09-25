import { iconoLogo } from "@/lib/icono";

export const size = { width: 128, height: 128 };
export const contentType = "image/png";

export default function Icon() {
  return iconoLogo(size.width);
}
