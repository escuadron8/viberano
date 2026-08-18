import type { ReactNode } from "react";
import { HerramientaProvider } from "@/components/HerramientaProvider";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <HerramientaProvider>
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {children}
      </div>
    </HerramientaProvider>
  );
}
