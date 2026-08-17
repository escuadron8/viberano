import { Boton } from "@/components/Boton";

export default function OnboardingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-between gap-xl px-xl py-xl text-center">
      <div aria-hidden="true" />

      <div className="flex flex-col items-center gap-lg">
        <BrujulaEstelar />
        <div className="flex flex-col gap-sm">
          <h1 className="text-display-xl text-ink-base">
            Tutor: Tu guía personal en cada nueva herramienta.
          </h1>
          <p className="text-body-md text-ink-secondary">
            Aprende de forma intuitiva y guiada, a tu propio ritmo.
          </p>
        </div>
      </div>

      <Boton href="/software" variante="primario" className="w-full">
        Empezar
      </Boton>
    </main>
  );
}

function BrujulaEstelar() {
  return (
    <svg width="112" height="112" viewBox="0 0 112 112" fill="none" aria-hidden="true">
      <circle cx="56" cy="56" r="52" className="stroke-primary-soft" strokeWidth="2" />
      <circle cx="56" cy="56" r="42" className="stroke-hairline" strokeWidth="1" />
      <path d="M56 24 L67 56 L56 88 L45 56 Z" className="fill-success" />
      <path d="M24 56 L56 45 L88 56 L56 67 Z" className="fill-primary-soft" opacity="0.6" />
      <circle cx="56" cy="56" r="5" className="fill-primary" />
    </svg>
  );
}
