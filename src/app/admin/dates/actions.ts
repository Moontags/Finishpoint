"use server";

import { revalidatePath } from "next/cache";
import { withAdminAction, formatSupabaseError, type ActionResult } from "@/lib/admin-action";

export async function addBlockedDate(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const date = formData.get("date") as string;
  const reason = formData.get("reason") as string;

  if (!date) return { error: "Päivämäärä on pakollinen" };

  return withAdminAction(async (db) => {
    const { error } = await db
      .from("blocked_dates")
      .insert({ blocked_date: date, reason: reason || null });

    if (error) return { error: formatSupabaseError(error.message) };

    revalidatePath("/admin/dates");
    return { error: null, success: true };
  });
}

export async function removeBlockedDate(id: string): Promise<ActionResult> {
  if (!id) return { error: "ID puuttuu" };

  return withAdminAction(async (db) => {
    const { error } = await db.from("blocked_dates").delete().eq("id", id);
    if (error) return { error: formatSupabaseError(error.message) };

    revalidatePath("/admin/dates");
    return { error: null, success: true };
  });
}
