import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variante = "primario" | "secundario";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-success text-ink-base hover:brightness-95",
  secundario: "bg-canvas text-ink-base border border-hairline hover:bg-canvas-soft",
};

const BASE =
  "inline-flex items-center justify-center rounded-pill py-md px-xl text-button-md transition-colors";

type BotonComoBoton = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  href?: undefined;
  children: ReactNode;
};

type BotonComoEnlace = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variante?: Variante;
  href: string;
  children: ReactNode;
};

type BotonProps = BotonComoBoton | BotonComoEnlace;

export function Boton({ variante = "primario", className = "", children, href, ...props }: BotonProps) {
  const clases = `${BASE} ${VARIANTES[variante]} ${className}`;

  if (href !== undefined) {
    return (
      <Link href={href} className={clases} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={clases} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
