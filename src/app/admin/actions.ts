"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveBooking(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const bookingData = {
    service_type: formData.get("service_type"),
    pickup_address: formData.get("from_address"),
    delivery_address: formData.get("to_address"),
    scheduled_date: formData.get("scheduled_date"),
    price: formData.get("price")
      ? parseFloat(formData.get("price") as string)
      : null,
    status: formData.get("status"),
    customer_name: formData.get("customer_name"),
    customer_email: formData.get("customer_email"),
    customer_phone: formData.get("customer_phone"),
    notes: formData.get("notes"),
    updated_at: new Date().toISOString(),
  };

  if (id === "new") {
    await supabase.from("bookings").insert({
      ...bookingData,
      created_at: new Date().toISOString(),
    });
  } else {
    await supabase.from("bookings").update(bookingData).eq("id", id);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteBooking(id: string) {
  const supabase = await createClient();
  await supabase.from("bookings").delete().eq("id", id);
  revalidatePath("/admin");
}
