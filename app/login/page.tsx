import { FormularioLogin } from "@/components/FormularioLogin";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center px-lg pb-xl pt-xl pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <FormularioLogin next={next ?? "/software"} errorInicial={error} />
    </main>
  );
}
