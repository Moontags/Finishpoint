import Link from "next/link";
import { serviceFooterLinks } from "@/lib/services";
import { siteContact } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="bg-[#f5f6f8]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">

          {/* Vasempi palsta: yhteystiedot */}
          <div className="space-y-3">
            <p className="text-[17px] font-medium text-slate-600">{siteContact.phoneDisplay}</p>
            <p className="break-all text-[17px] font-medium text-slate-600">{siteContact.email}</p>
            <p className="pt-2 text-[14px] leading-relaxed text-slate-600">
              Hinnat näytetään sis. ALV 25,5 %. Yritys (ALV 0 %).
            </p>
            <a
              href="/images/sopimusehdot.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[14px] text-slate-600 underline underline-offset-2 transition hover:text-blue-600"
            >
              Sopimusehdot
            </a>
          </div>

          {/* Oikea palsta: Palvelut — isot näytöt */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              {serviceFooterLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-2 py-2 text-[15px] text-slate-600 transition hover:text-blue-600 hover:underline"
                >
                  {label === "Mönkijäkuljetus"
                    ? "Mönkijä kuljetus"
                    : label === "Moottoripyöräkuljetus"
                      ? "Moottoripyörän kuljetus"
                      : label}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Alareuna */}
        <div className="mt-4 border-t border-slate-700 pt-3 text-[13px] text-slate-500">
          © {new Date().getFullYear()} FP-pikakuljetus. Kaikki oikeudet pidätetään.
        </div>
      </div>
    </footer>
  );
}
