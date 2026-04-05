"use client";

import Image from "next/image";
import { CalculatorProvider } from "@/lib/calculator-context";
import ServiceSelector from "@/components/ServiceSelector";
import { QuoteRequestForm } from "@/components/quote-request-form";
import type { ServiceCategory } from "@/lib/types";

export function CalculatorFormSection({
  initialCategory,
}: {
  initialCategory?: ServiceCategory;
}) {
  return (
    <CalculatorProvider>
      {/* ── Calculator ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-8 max-[390px]:px-3 sm:px-6 lg:px-8 lg:py-12">
        <ServiceSelector initialCategory={initialCategory} />
      </section>

      {/* ── Quote form background ──────────────────────────────── */}
      <section id="quote" className="relative overflow-hidden">
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

        {/* ── Quote form ─────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 max-[390px]:px-3 sm:px-6 lg:px-8 lg:py-12">
          <QuoteRequestForm />
        </section>
      </section>
    </CalculatorProvider>
  );
}
