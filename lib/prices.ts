import { createClient } from "@/lib/supabase/server";

export async function getPrices(): Promise<Record<string, number>> {
  const fallback: Record<string, number> = {
    base_kappaletavara: 89,
    base_muutto: 269,
    base_kierratys: 54.99,
    base_ajoneuvo_40: 129,
    base_ajoneuvo_80: 169,
    km_rate_tavara: 1.29,
    km_rate_muutto: 0.69,
    km_rate_ajoneuvo: 1.29,
    floor_extra: 5,
    vat_rate: 0.255,
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prices")
      .select("key, value");

    if (error || !data) return fallback;

    return data.reduce(
      (acc, row) => {
        acc[row.key] = row.value;
        return acc;
      },
      {} as Record<string, number>
    );
  } catch {
    return fallback;
  }
}
