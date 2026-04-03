import type { Metadata } from "next";
import AdminNav from "./AdminNav";

export const metadata: Metadata = {
  title: "Finishpoint Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#252525] text-zinc-100 md:grid md:grid-cols-[260px_1fr]">
      <AdminNav />
      <main className="p-4 md:p-7 lg:p-8">{children}</main>
    </div>
  );
}
