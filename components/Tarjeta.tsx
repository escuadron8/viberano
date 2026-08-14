import type { ReactNode } from "react";

type TarjetaProps = {
  children: ReactNode;
  className?: string;
};

export function Tarjeta({ children, className = "" }: TarjetaProps) {
  return (
    <div
      className={`bg-canvas border border-hairline rounded-lg p-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}
