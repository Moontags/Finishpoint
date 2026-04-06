"use server";

import { revalidatePath } from "next/cache";
import { withAdminAction, formatSupabaseError, type ActionResult } from "@/lib/admin-action";

export async function updatePrice(formData: FormData): Promise<ActionResult> {
  const key = formData.get("key") as string;
  const value = parseFloat(formData.get("value") as string);

  if (!key) return { error: "Hinta-avain puuttuu" };
  if (isNaN(value) || value < 0) return { error: "Virheellinen hinta-arvo" };

  return withAdminAction(async (db) => {
    const { error } = await db
      .from("prices")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key);

    if (error) return { error: formatSupabaseError(error.message) };

    revalidatePath("/admin/prices");
    return { error: null, success: true };
  });
}
