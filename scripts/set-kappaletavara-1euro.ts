import { createAdminClient } from "@/lib/supabase/admin";
import * as dotenv from "dotenv";
import path from "path";

// Lataa .env.local juuresta
const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

async function setKappaletavaraBaseToOneEuro() {
  const supabase = createAdminClient();
  await supabase
    .from("prices")
    .update({ value: 1, updated_at: new Date().toISOString() })
    .eq("key", "base_kappaletavara");
  const { data, error } = await supabase.from("prices").select("*").eq("key", "base_kappaletavara");
  if (error) {
    console.error("Virhe haettaessa hintaa:", error);
  } else {
    console.log("base_kappaletavara:", data);
  }
}

setKappaletavaraBaseToOneEuro().then(() => process.exit(0));
