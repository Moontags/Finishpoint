import { getSupabaseAdminClient } from "./supabase-admin";
import type { QuoteRequestData } from "./types";

export async function saveQuoteRequest(quote: QuoteRequestData) {
  const client = getSupabaseAdminClient();
  if (!client) {
    return;
  }

  const { error } = await client.from("quote_requests").insert({
    customer_name: quote.name,
    customer_email: quote.email,
    customer_phone: quote.phone,
    service_type: quote.serviceType,
    addresses: quote.addresses,
    message: quote.message,
    source: quote.source,
    status: quote.status,
  });

  if (error) {
    throw new Error(`Quote persistence failed: ${error.message}`);
  }
}