"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveBooking(formData: FormData) {
  try {
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

    let result;
    if (id === "new") {
      result = await supabase.from("bookings").insert({
        ...bookingData,
        created_at: new Date().toISOString(),
      });
    } else {
      result = await supabase.from("bookings").update(bookingData).eq("id", id);
    }

    if (result.error) {
      console.error("Booking save failed:", result.error);
      throw new Error(`Keikan tallennus epäonnistui: ${result.error.message}`);
    }

    revalidatePath("/admin");
    redirect("/admin");
  } catch (error) {
    console.error("Booking save error:", error);
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    throw new Error("Keikan tallennus epäonnistui");
  }
}

export async function deleteBooking(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const supabase = await createClient();

    const result = await supabase.from("bookings").delete().eq("id", id);

    if (result.error) {
      console.error("Booking delete failed:", result.error);
      throw new Error(`Keikan poisto epäonnistui: ${result.error.message}`);
    }

    revalidatePath("/admin");
    redirect("/admin");
  } catch (error) {
    console.error("Booking delete error:", error);
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    throw new Error("Keikan poisto epäonnistui");
  }
}
