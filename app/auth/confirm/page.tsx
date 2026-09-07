import { ConfirmarAcceso } from "@/components/ConfirmarAcceso";

export default async function ConfirmarAccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; token_hash?: string; type?: string }>;
}) {
  const { next, token_hash: tokenHash, type } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col items-center justify-center px-lg pb-xl pt-xl pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <ConfirmarAcceso next={next ?? "/software"} tokenHash={tokenHash} type={type} />
    </main>
  );
}
