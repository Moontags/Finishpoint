"use server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function addBlockedDate(formData: FormData) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin client puuttuu");

  const date = formData.get("date") as string;
  const reason = formData.get("reason") as string;

  const { error } = await supabase.from("blocked_dates").insert({
    blocked_date: date,
    reason: reason || null,
  });

  if (error) throw new Error(`Päivän lisäys epäonnistui: ${error.message}`);

  revalidatePath("/admin/dates");
}

export async function removeBlockedDate(id: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin client puuttuu");

  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) throw new Error(`Päivän poisto epäonnistui: ${error.message}`);

  revalidatePath("/admin/dates");
}
