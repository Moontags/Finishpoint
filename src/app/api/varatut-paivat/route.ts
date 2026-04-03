import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocked_dates")
    .select("blocked_date");

  const dates = data?.map((d) => d.blocked_date) ?? [];
  return NextResponse.json(dates);
}
