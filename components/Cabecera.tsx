import type { ReactNode } from "react";

type CabeceraProps = {
  titulo: string;
  accion?: ReactNode;
};

export function Cabecera({ titulo, accion }: CabeceraProps) {
  return (
    <header className="flex items-center justify-between gap-sm border-b border-hairline px-lg py-md">
      <h1 className="truncate text-heading-md text-ink-base">{titulo}</h1>
      {accion}
    </header>
  );
}
