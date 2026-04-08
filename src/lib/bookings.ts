import { getSupabaseAdminClient } from "./supabase-admin";

export type BookingInsertPayload = {
  asiakas_nimi?: string;
  asiakas_email: string;
  asiakas_puhelin?: string;
  palvelutyyppi: string;
  lahto_osoite: string;
  kohde_osoite: string;
  varaus_pvm: string;
  aloitusaika: string;
  lopetusaika: string;
  ajoaika_kohteeseen_min: number;
  ajoaika_riihimaelta_min: number;
  hinta_alv?: number | null;
  hinta_alv0?: number | null;
  status?: "vahvistettu" | "odottaa_maksua" | "peruttu" | "valmis";
  order_id?: string;
};

export type ReservedBooking = {
  varaus_pvm: string;
  aloitusaika: string;
  lopetusaika: string;
};

function asIsoDate(value: string) {
  return value.slice(0, 10);
}

export async function getReservedBookings(alkuPvm: string, loppuPvm: string) {
  const client = getSupabaseAdminClient();
  if (!client) {
    return [] as ReservedBooking[];
  }

  const { data, error } = await client
    .from("varaukset")
    .select("varaus_pvm, aloitusaika, lopetusaika")
    .gte("varaus_pvm", asIsoDate(alkuPvm))
    .lte("varaus_pvm", asIsoDate(loppuPvm))
    .in("status", ["vahvistettu", "odottaa_maksua"])
    .order("varaus_pvm", { ascending: true });

  if (error) {
    throw new Error(`Reserved bookings fetch failed: ${error.message}`);
  }

  return (data ?? []) as ReservedBooking[];
}

export async function saveBooking(payload: BookingInsertPayload) {
  const client = getSupabaseAdminClient();
  if (!client) {
    throw new Error("Supabase is not configured for bookings.");
  }

  const { data, error } = await client
    .from("varaukset")
    .insert({
      ...payload,
      status: payload.status ?? "vahvistettu",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Booking insert failed: ${error.message}`);
  }

  return data as { id: string };
}

export async function updateBookingStatus(orderId: string, newStatus: "vahvistettu" | "odottaa_maksua" | "peruttu" | "valmis") {
  const client = getSupabaseAdminClient();
  if (!client) {
    throw new Error("Supabase is not configured for bookings.");
  }
  const { error } = await client
    .from("varaukset")
    .update({ status: newStatus })
    .eq("order_id", orderId);
  if (error) {
    throw new Error(`Booking status update failed: ${error.message}`);
  }
}
