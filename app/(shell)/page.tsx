"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/Boton";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col items-center justify-between px-lg pb-xl pt-xl text-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-lg">
        <Image
          src="/nuevo-logo-tutor.jpg"
          alt="Tutor"
          width={1200}
          height={896}
          priority
          className="h-auto w-40"
        />

        <div className="flex flex-col gap-sm">
          <h1 className="text-display-xl text-ink-base">
            Tu guía personal en cada nueva herramienta.
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
