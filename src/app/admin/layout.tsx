import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "./AdminNav";

export const metadata: Metadata = {
  title: "Finishpoint Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Debug: näet Vercelin logeissa käyttäjän
  console.log("AdminLayout user:", user?.email ?? "NULL", "error:", error?.message);

  if (!user) {
    // Palauta vaalea tausta kirjautumattomille (login)
    return (
      <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    );
  }

  // Kirjautuneille: sidebar + sisältö
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
      <AdminNav />
      <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
