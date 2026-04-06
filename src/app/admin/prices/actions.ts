"use server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function updatePrice(
  formData: FormData
): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) return { error: "Palvelinyhteys puuttuu" };

    const key = formData.get("key") as string;
    const value = parseFloat(formData.get("value") as string);

    if (!key || isNaN(value)) return { error: "Virheelliset arvot" };

    const { error } = await supabase
      .from("prices")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key);

    if (error) {
      console.error("prices update:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/prices");
    return { error: null };
  } catch (e) {
    console.error("updatePrice:", e);
    return { error: "Odottamaton virhe" };
  }
}
