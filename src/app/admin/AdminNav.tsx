"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryItems = [
  { href: "/admin", label: "Keikat" },
  { href: "/admin/stats", label: "Tilastot" },
  { href: "/admin/customers", label: "Asiakkaat" },
  { href: "/admin/prices", label: "Laskuri & hinnat" },
  { href: "/admin/dates", label: "Päivämäärät" },
  { href: null, label: "Osoitteet" },
  { href: null, label: "Tarjouspyynnöt" },
];

export default function AdminNav() {
  const pathname = usePathname();

  // Login- ja auth-sivuilla ei näytetä navigaatiota
  if (pathname === "/admin/login" || pathname.startsWith("/admin/auth")) {
    return null;
  }

  return (
    <aside className="border-r border-zinc-700/80 bg-[#1f1f1f] md:min-h-screen">
      <div className="p-4 border-b border-zinc-700/80">
        <p className="text-lg font-bold leading-none">Pakuvie</p>
        <p className="text-xs text-zinc-400 mt-1">Hallintapaneeli</p>
      </div>

      <nav className="p-3 space-y-1">
        {primaryItems.map((item) => {
          const active = item.href
            ? item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)
            : false;

          const className = `group flex items-center gap-3 rounded-md px-3 py-2 text-base font-semibold transition-colors ${
            active
              ? "bg-zinc-700/40 text-zinc-100"
              : item.href
              ? "text-zinc-300 hover:bg-zinc-800/70 hover:text-zinc-100"
              : "text-zinc-500 cursor-default"
          }`;

          const dotClass = `h-2 w-2 rounded-full ${
            active ? "bg-zinc-100" : item.href ? "bg-zinc-500" : "bg-zinc-700"
          }`;

          if (!item.href) {
            return (
              <span key={item.label} className={className}>
                <span className={dotClass} aria-hidden />
                {item.label}
              </span>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={className}>
              <span className={dotClass} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-zinc-700/80 p-3 space-y-1">
        <span className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-semibold text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-zinc-600" aria-hidden />
          Asetukset
        </span>
        <Link
          href="/admin/auth/signout"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-semibold text-zinc-300 hover:bg-zinc-800/70 hover:text-zinc-100 transition-colors"
        >
          <span className="h-2 w-2 rounded-full bg-zinc-500" aria-hidden />
          Kirjaudu ulos
        </Link>
      </div>
    </aside>
  );
}
