import type { ReactNode } from "react";

type BurbujaChatProps = {
  variante: "ia" | "usuario";
  children: ReactNode;
  className?: string;
};

const VARIANTES: Record<BurbujaChatProps["variante"], string> = {
  ia: "bg-chat-ai-bg self-start",
  usuario: "bg-chat-user-bg self-end",
};

export function BurbujaChat({ variante, children, className = "" }: BurbujaChatProps) {
  return (
    <div
      className={`max-w-[80%] text-ink-base rounded-lg p-md text-body-md shadow-[0_2px_4px_rgba(0,0,0,0.04)] ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </div>
  );
}
