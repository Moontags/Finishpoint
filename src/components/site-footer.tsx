import Image from "next/image";
import Link from "next/link";
import { serviceFooterLinks } from "@/lib/services";
import { siteContact } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/90">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">

        {/* Vasempi palsta: yhteystiedot + logo tekstin oikealla mobiilissa */}
        <div className="min-w-0 lg:max-w-md lg:pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-[16px] text-slate-700">{siteContact.phoneDisplay}</p>
              <p className="break-all text-[16px] text-slate-700">{siteContact.email}</p>
              <p className="pt-1 text-[14px] text-slate-600">
                Hinnat näytetään sis. ALV 25,5 %. Yritys (ALV 0 %).
              </p>
              <a
                href="/images/sopimusehdot.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[14px] text-slate-700 underline transition hover:text-blue-600"
              >
                Sopimusehdot
              </a>
            </div>
            {/* Logo poistettu footerista pyynnöstä */}
          </div>
        </div>

        {/* Oikea palsta: vain Palvelut — isot näytöt */}
        <div className="hidden lg:grid gap-4 lg:max-w-md lg:justify-self-end lg:w-full">
          <div>
            {/* 'Palvelut' otsikko poistettu footerista */}
            <div className="grid grid-cols-2 gap-2 text-[15px] text-slate-700">
              {serviceFooterLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg px-2 py-1.5 transition hover:bg-slate-100 hover:text-blue-600 hover:underline"
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

      </div>
    </footer>
  );
}
