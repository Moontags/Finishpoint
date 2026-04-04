import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
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
  const { data: { user } } = await supabase.auth.getUser();

  // Hae polku serverillä
  const pathname = headers().get("x-pathname") || "";

  // Jos ollaan login-sivulla, palauta vain children (login-layout hoitaa ulkoasun)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#252525] text-zinc-100 md:grid md:grid-cols-[260px_1fr]">
      <AdminNav />
      <main className="p-4 md:p-7 lg:p-8">{children}</main>
    </div>
  );
}
