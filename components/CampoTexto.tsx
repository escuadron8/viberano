import type { InputHTMLAttributes } from "react";

type CampoTextoProps = InputHTMLAttributes<HTMLInputElement>;

export function CampoTexto({ className = "", ...props }: CampoTextoProps) {
  return (
    <input
      className={`w-full bg-canvas-soft border border-hairline text-ink-base rounded-pill py-md px-[20px] text-body-md placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-primary-soft ${className}`}
      {...props}
    />
  );
}
