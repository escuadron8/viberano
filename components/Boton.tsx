import type { ButtonHTMLAttributes, ReactNode } from "react";

type BotonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "primario" | "secundario";
  children: ReactNode;
};

const VARIANTES: Record<NonNullable<BotonProps["variante"]>, string> = {
  primario: "bg-success text-ink-base hover:brightness-95",
  secundario: "bg-canvas text-ink-base border border-hairline hover:bg-canvas-soft",
};

export function Boton({
  variante = "primario",
  className = "",
  children,
  ...props
}: BotonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-pill py-md px-xl text-button-md transition-colors ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
