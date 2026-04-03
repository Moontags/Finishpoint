"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addBlockedDate(formData: FormData) {
  const supabase = await createClient();
  const date = formData.get("date") as string;
  const reason = formData.get("reason") as string;

  await supabase.from("blocked_dates").insert({
    blocked_date: date,
    reason,
  });

  revalidatePath("/admin/dates");
}

export async function removeBlockedDate(id: string) {
  const supabase = await createClient();
  await supabase.from("blocked_dates").delete().eq("id", id);
  revalidatePath("/admin/dates");
}
