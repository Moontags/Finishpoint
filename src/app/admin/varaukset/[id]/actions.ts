"use server";

import { revalidatePath } from "next/cache";
import { withAdminAction, formatSupabaseError, type ActionResult } from "@/lib/admin-action";

export async function saveVarausAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;

  const varausData = {
    asiakas_nimi: (formData.get("asiakas_nimi") as string) || null,
    asiakas_email: (formData.get("asiakas_email") as string) || "",
    asiakas_puhelin: (formData.get("asiakas_puhelin") as string) || null,
    palvelutyyppi: (formData.get("palvelutyyppi") as string) || "",
    lahto_osoite: (formData.get("lahto_osoite") as string) || "",
    kohde_osoite: (formData.get("kohde_osoite") as string) || "",
    varaus_pvm: (formData.get("varaus_pvm") as string) || "",
    aloitusaika: (formData.get("aloitusaika") as string) || "",
    lopetusaika: (formData.get("lopetusaika") as string) || "",
    ajoaika_kohteeseen_min: null as number | null,
    ajoaika_riihimaelta_min: null as number | null,
    hinta_alv: formData.get("hinta_alv") ? parseFloat(formData.get("hinta_alv") as string) : null,
    hinta_alv0: formData.get("hinta_alv0") ? parseFloat(formData.get("hinta_alv0") as string) : null,
    status: (formData.get("status") as string) || "vahvistettu",
  };

  return withAdminAction(async (db) => {
    let error;
    if (id === "new") {
      ({ error } = await db.from("varaukset").insert({
        ...varausData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } else {
      ({ error } = await db
        .from("varaukset")
        .update({ ...varausData, updated_at: new Date().toISOString() })
        .eq("id", id));
    }

    if (error) return { error: formatSupabaseError(error.message) };

    revalidatePath("/admin");
    revalidatePath("/admin/varaukset");
    return { error: null, success: true };
  });
}

export async function deleteVarausAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID puuttuu" };

  return withAdminAction(async (db) => {
    const { error } = await db.from("varaukset").delete().eq("id", id);
    if (error) return { error: formatSupabaseError(error.message) };

    revalidatePath("/admin");
    return { error: null, success: true };
  });
}
