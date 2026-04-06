"use server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function addBlockedDate(
  formData: FormData
): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return { error: "Palvelinyhteys puuttuu (SUPABASE_SERVICE_ROLE_KEY)" };
    }

    const date = formData.get("date") as string;
    const reason = formData.get("reason") as string;

    if (!date) return { error: "Päivämäärä puuttuu" };

    const { error } = await supabase.from("blocked_dates").insert({
      blocked_date: date,
      reason: reason || null,
    });

    if (error) {
      console.error("blocked_dates insert:", error);
      return { error: `Tallennus epäonnistui: ${error.message}` };
    }

    revalidatePath("/admin/dates");
    return { error: null };
  } catch (e) {
    console.error("addBlockedDate:", e);
    return { error: "Odottamaton virhe" };
  }
}

export async function removeBlockedDate(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin client puuttuu");

  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dates");
}
