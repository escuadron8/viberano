"use client";

import { useRouter } from "next/navigation";
import { Boton } from "@/components/Boton";

function IconoBrujula() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="32" cy="32" r="22" className="text-hairline" />
      <path
        d="M40 24 L28 30 L24 40 L36 34 Z"
        className="text-success"
        fill="currentColor"
        stroke="none"
      />
      <circle cx="32" cy="32" r="2.5" className="text-ink-base" fill="currentColor" stroke="none" />
      <path d="M32 6 L32 10" className="text-success" strokeLinecap="round" />
    </svg>
  );
}

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col items-center justify-between px-lg pb-xl pt-xl text-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-lg">
        <div className="flex h-32 w-32 items-center justify-center rounded-full border border-hairline text-ink-secondary">
          <IconoBrujula />
        </div>

        <div className="flex flex-col gap-sm">
          <h1 className="text-display-xl text-ink-base">
            <span className="font-bold">Tutor:</span> Tu guía personal en cada nueva herramienta.
          </h1>
          <p className="text-body-md text-ink-secondary">
            Aprende de forma intuitiva y guiada, a tu propio ritmo.
          </p>
        </div>
      </div>

      <Boton
        variante="primario"
        className="w-full"
        onClick={() => router.push("/software")}
      >
        Empezar
      </Boton>
    </main>
  );
}
