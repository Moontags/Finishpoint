"use server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function updatePrice(formData: FormData) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin client puuttuu");

  const key = formData.get("key") as string;
  const value = parseFloat(formData.get("value") as string);

  const { error } = await supabase
    .from("prices")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) throw new Error(`Hinnan tallennus epäonnistui: ${error.message}`);

  revalidatePath("/admin/prices");
}
