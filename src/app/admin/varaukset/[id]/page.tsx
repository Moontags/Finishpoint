import { getVaraus } from "@/lib/varaukset";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VarausForm } from "./varaus-form";

export default async function VarausPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let varaus = null;

  if (id !== "new") {
    try {
      varaus = await getVaraus(id);
    } catch {
      notFound();
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-100">
          {id === "new" ? "Uusi varaus" : "Muokkaa varausta"}
        </h1>
        <Link href="/admin" className="text-zinc-400 hover:text-zinc-300 text-sm">
          ← Takaisin
        </Link>
      </div>

      <VarausForm id={id} varaus={varaus} />
    </div>
  );
}
