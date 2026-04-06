import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ActionResult = { error: string | null; success?: boolean };

export async function withAdminAction(
  fn: (db: SupabaseClient) => Promise<ActionResult>
): Promise<ActionResult> {
  try {
    const auth = await createClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return { error: "Ei kirjautunut" };

    const db = getSupabaseAdminClient();
    if (!db) return { error: "Tietokantayhteys puuttuu (SUPABASE_SERVICE_ROLE_KEY)" };

    return await fn(db);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Odottamaton virhe";
    console.error("Admin action error:", e);
    return { error: formatSupabaseError(msg) };
  }
}

export function formatSupabaseError(msg: string): string {
  if (msg.includes("duplicate key")) return "Tämä tieto on jo olemassa";
  if (msg.includes("not-null") || msg.includes("violates not-null"))
    return "Täytä kaikki pakolliset kentät";
  if (msg.includes("JWT") || msg.includes("session"))
    return "Istunto vanhentunut – kirjaudu uudelleen";
  if (msg.includes("schema cache") || msg.includes("does not exist"))
    return "Tietokantavirhe – ota yhteyttä ylläpitoon";
  return msg || "Tuntematon virhe";
}
