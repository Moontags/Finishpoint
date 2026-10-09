import { SITE_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(SITE_URL);
}
