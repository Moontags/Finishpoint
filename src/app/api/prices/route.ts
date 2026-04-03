import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { defaultPriceConfig } from "@/lib/pricing";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("prices").select("key, value");

    const config = { ...defaultPriceConfig };
    for (const row of data ?? []) {
      if (Object.prototype.hasOwnProperty.call(config, row.key)) {
        (config as Record<string, number>)[row.key] = row.value;
      }
    }

    return NextResponse.json(config);
  } catch {
    return NextResponse.json(defaultPriceConfig);
  }
}
