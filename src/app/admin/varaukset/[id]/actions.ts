"use server";

import { updateVaraus, deleteVaraus, createVaraus } from "@/lib/varaukset";
import type { VarausInsert } from "@/lib/varaukset";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveVarausAction(formData: FormData) {
  try {
    const id = formData.get("id") as string;

    const varausData: Omit<VarausInsert, "ajoaika_kohteeseen_min" | "ajoaika_riihimaelta_min"> & {
      ajoaika_kohteeseen_min: number | null;
      ajoaika_riihimaelta_min: number | null;
    } = {
      asiakas_nimi: (formData.get("asiakas_nimi") as string) || null,
      asiakas_email: (formData.get("asiakas_email") as string) || "",
      asiakas_puhelin: (formData.get("asiakas_puhelin") as string) || null,
      palvelutyyppi: (formData.get("palvelutyyppi") as string) || "",
      lahto_osoite: (formData.get("lahto_osoite") as string) || "",
      kohde_osoite: (formData.get("kohde_osoite") as string) || "",
      varaus_pvm: (formData.get("varaus_pvm") as string) || "",
      aloitusaika: (formData.get("aloitusaika") as string) || "",
      lopetusaika: (formData.get("lopetusaika") as string) || "",
      ajoaika_kohteeseen_min: null,
      ajoaika_riihimaelta_min: null,
      hinta_alv: formData.get("hinta_alv")
        ? parseFloat(formData.get("hinta_alv") as string)
        : null,
      hinta_alv0: formData.get("hinta_alv0")
        ? parseFloat(formData.get("hinta_alv0") as string)
        : null,
      status: (formData.get("status") as string) || "vahvistettu",
    };

    if (id === "new") {
      await createVaraus(varausData as VarausInsert);
    } else {
      await updateVaraus(id, varausData);
    }

    revalidatePath("/admin");
    redirect("/admin");
  } catch (error) {
    console.error("Varaus save error:", error);
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    throw new Error("Varauksen tallennus epäonnistui");
  }
}

export async function deleteVarausAction(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    await deleteVaraus(id);

    revalidatePath("/admin");
    redirect("/admin");
  } catch (error) {
    console.error("Varaus delete error:", error);
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    throw new Error("Varauksen poisto epäonnistui");
  }
}
