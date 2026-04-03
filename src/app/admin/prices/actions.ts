"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePrice(formData: FormData) {
  const supabase = await createClient();
  const key = formData.get("key") as string;
  const value = parseFloat(formData.get("value") as string);

  await supabase
    .from("prices")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);

  revalidatePath("/admin/prices");
}
