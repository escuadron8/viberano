type ChipOrigenProps = {
  tipo: "oficial" | "compartido" | "personal";
};

const ETIQUETAS: Record<ChipOrigenProps["tipo"], string> = {
  oficial: "Oficial",
  compartido: "Compartido",
  personal: "Personal",
};

const ESTILOS: Record<ChipOrigenProps["tipo"], string> = {
  oficial: "bg-primary/15 text-primary",
  compartido: "bg-success/25 text-ink-base",
  personal: "bg-canvas-soft text-ink-secondary border border-hairline",
};

export function ChipOrigen({ tipo }: ChipOrigenProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-sm py-xs text-button-md ${ESTILOS[tipo]}`}
    >
      {ETIQUETAS[tipo]}
    </span>
  );
}
