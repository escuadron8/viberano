import Link from "next/link";
import type { ReactNode } from "react";

type CabeceraMovilProps = {
  titulo: ReactNode;
  hrefAtras: string;
  accion?: ReactNode;
  className?: string;
};

export function CabeceraMovil({ titulo, hrefAtras, accion, className = "" }: CabeceraMovilProps) {
  return (
    <header className={`flex items-center gap-sm px-lg py-md ${className}`}>
      <Link
        href={hrefAtras}
        aria-label="Volver"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-base transition-colors hover:bg-canvas-soft"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </Link>
      <h1 className="flex-1 text-heading-md text-ink-base">{titulo}</h1>
      {accion}
    </header>
  );
}
