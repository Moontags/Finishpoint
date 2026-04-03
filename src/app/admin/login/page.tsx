import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminLoginPageClient from "./login-client";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Jos jo kirjautunut, ohjaa suoraan dashboardiin
  if (user) {
    redirect("/admin");
  }

  // Muodosta selkeä virheilmoitus error-koodista
  const errorMessages: Record<string, string> = {
    otp_expired: 'Kirjautumislinkki on vanhentunut. Pyydä uusi linkki.',
    auth_error:  'Kirjautuminen epäonnistui. Yritä uudelleen.',
    session_error: 'Istunnon luominen epäonnistui. Yritä uudelleen.',
    auth_failed: 'Kirjautuminen epäonnistui. Yritä uudelleen.',
  };

  const errorMsg = searchParams?.error
    ? (errorMessages[searchParams.error] ?? 'Kirjautuminen epäonnistui.')
    : null;

  // Renderöi lomake ja välitä virheilmoitus
  return <AdminLoginPageClient errorMessage={errorMsg} />;
}
