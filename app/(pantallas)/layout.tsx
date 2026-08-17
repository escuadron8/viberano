import type { ReactNode } from "react";

export default function PantallasLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="mx-auto flex w-full max-w-[430px] flex-1 flex-col overflow-x-hidden pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]"
    >
      {children}
    </div>
  );
}
