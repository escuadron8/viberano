type ChipOrigenProps = {
  tipo: "oficial" | "compartido" | "personal" | "web";
};

const ETIQUETAS: Record<ChipOrigenProps["tipo"], string> = {
  oficial: "Oficial",
  compartido: "Compartido",
  personal: "Personal",
  web: "Web externa",
};

const ESTILOS: Record<ChipOrigenProps["tipo"], string> = {
  oficial: "bg-primary/15 text-primary",
  compartido: "bg-success/25 text-ink-base",
  personal: "bg-canvas-soft text-ink-secondary border border-hairline",
  web: "bg-warning/20 text-ink-base border border-warning/40",
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
