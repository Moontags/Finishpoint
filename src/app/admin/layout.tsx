import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "./AdminNav";
import { SessionRefresher } from "./components/session-refresher";

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

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#252525] text-zinc-100 md:grid md:grid-cols-[260px_1fr]">
      <SessionRefresher />
      <AdminNav />
      <main className="p-4 md:p-7 lg:p-8">{children}</main>
    </div>
  );
}
