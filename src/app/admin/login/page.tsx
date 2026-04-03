import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminLoginPageClient from "./login-client";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Jos jo kirjautunut, ohjaa suoraan dashboardiin
  if (user) {
    redirect("/admin");
  }

  // Renderöi lomake vasta jos EI kirjautunut
  return <AdminLoginPageClient />;
}
