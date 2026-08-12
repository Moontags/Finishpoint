import { createClient } from "@/lib/supabase/server";
import { defaultPriceConfig, type PriceConfig } from "@/lib/pricing";

// Lukee hintakonfiguraation kannasta palvelinpuolella. Tuntemattomat avaimet
// ohitetaan ja puuttuvat kentät täydentyvät defaultPriceConfigista, joten
// kanta on totuuden lähde myös vat_rate-kentän osalta.
export async function getPriceConfig(): Promise<PriceConfig> {
  const config = { ...defaultPriceConfig };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("prices").select("key, value");
    if (error || !data) return config;

    for (const row of data) {
      if (Object.prototype.hasOwnProperty.call(config, row.key)) {
        (config as Record<string, number>)[row.key] = Number(row.value);
      }
    }
  } catch {
    return { ...defaultPriceConfig };
  }

  return config;
}
