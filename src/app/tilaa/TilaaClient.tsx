"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CalculatorProvider, useCalculatorContext } from "@/lib/calculator-context";
import { QuoteRequestForm } from "@/components/quote-request-form";
import type { ServiceCategory } from "@/lib/types";

const serviceLabels: Record<string, string> = {
  ajoneuvo: "Ajoneuvokuljetukset",
  kappaletavara: "Kappaletavarakuljetus",
  projekti: "Muutto / kierrätys",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function TilaaContent() {
  const params = useSearchParams();
  const ctx = useCalculatorContext();

  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const km = params.get("km") ?? "0";
  const price = params.get("price") ?? "0";
  const service = params.get("service") ?? "";
  const date = params.get("date") ?? "";

  const priceNum = Number(price);
  const serviceLabel = serviceLabels[service] ?? service;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (!ctx) return;
    if (from) ctx.setPickupAddress(from);
    if (to) ctx.setDeliveryAddress(to);
    if (service) ctx.setServiceCategory(service as ServiceCategory);
    if (price) {
      const p = Number(price);
      ctx.setEstimatedPriceVatIncl(p);
      ctx.setEstimatedPriceVat0(p / 1.255);
    }
    if (date) {
      ctx.setBookingSelection({
        reservationDate: date,
        arrivalTime: "",
        riihimakiDepartureTime: "",
        releaseTime: "",
        driveToDestinationMinutes: 0,
        driveFromRiihimakiMinutes: 0,
        workDurationMinutes: 0,
        calendarBlockMinutes: 0,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="relative grow min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/images/paku5.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/65" />
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-[#f5f6f8] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#f5f6f8] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 max-[390px]:px-3 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">

          {/* Left: order summary */}
          <div className="self-start rounded-2xl bg-white/90 p-6 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600">
              Tilauksesi yhteenveto
            </p>
            <div className="mt-4 space-y-4">
              {from && to && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Reitti
                  </p>
                  <p className="mt-0.5 text-[14px] font-medium text-slate-800">{from}</p>
                  <p className="text-[13px] text-slate-500">→ {to}</p>
                </div>
              )}
              {km && km !== "0" && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Etäisyys
                  </p>
                  <p className="mt-0.5 text-[14px] font-medium text-slate-800">{km} km</p>
                </div>
              )}
              {serviceLabel && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Palvelu
                  </p>
                  <p className="mt-0.5 text-[14px] font-medium text-slate-800">{serviceLabel}</p>
                </div>
              )}
              {date && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Päivämäärä
                  </p>
                  <p className="mt-0.5 text-[14px] font-medium text-slate-800">{date}</p>
                </div>
              )}
            </div>
            {priceNum > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Hinta (sis. ALV)
                </p>
                <p
                  className="mt-1 text-4xl font-extrabold leading-none"
                  style={{ color: "#1e3a5f" }}
                >
                  {formatPrice(priceNum)}
                </p>
              </div>
            )}
          </div>

          {/* Right: QuoteRequestForm — same as on the main page */}
          <QuoteRequestForm />
        </div>
      </div>
    </section>
  );
}

export function TilaaClient() {
  return (
    <CalculatorProvider>
      <TilaaContent />
    </CalculatorProvider>
  );
}
