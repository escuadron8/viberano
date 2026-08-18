type AnilloProgresoProps = {
  progreso: number;
  tamano?: number;
  grosor?: number;
  etiqueta?: string;
};

export function AnilloProgreso({ progreso, tamano = 96, grosor = 8, etiqueta }: AnilloProgresoProps) {
  const clamped = Math.min(Math.max(progreso, 0), 100);
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const desplazamiento = circunferencia * (1 - clamped / 100);
  const centro = tamano / 2;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: tamano, height: tamano }}
    >
      <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} className="-rotate-90">
        <circle cx={centro} cy={centro} r={radio} strokeWidth={grosor} className="stroke-hairline" fill="none" />
        <circle
          cx={centro}
          cy={centro}
          r={radio}
          strokeWidth={grosor}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={desplazamiento}
          className="stroke-success transition-[stroke-dashoffset]"
          fill="none"
        />
      </svg>
      <span className="absolute flex flex-col items-center gap-xs">
        <span className={`text-ink-base ${etiqueta ? "text-display-xl" : "text-heading-md"}`}>
          {`${Math.round(clamped)}%`}
        </span>
        {etiqueta ? <span className="text-body-md text-ink-secondary">{etiqueta}</span> : null}
      </span>
    </div>
  );
}
