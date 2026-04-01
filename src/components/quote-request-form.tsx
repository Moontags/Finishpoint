"use client";

import { useState } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { quoteServiceOptions } from "@/lib/services";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white/75 px-4 py-3 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:ring-[3px] focus:ring-blue-200";

export function QuoteRequestForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceType: quoteServiceOptions[0],
    pickupAddress: "",
    deliveryAddress: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setStatus("error");
        setFeedback(result.error ?? "Lähetys epäonnistui. Yritä uudelleen.");
        return;
      }

      setStatus("success");
      setFeedback("Tarjouspyyntö lähetettiin onnistuneesti.");
      setFormData({
        name: "",
        phone: "",
        email: "",
        serviceType: quoteServiceOptions[0],
        pickupAddress: "",
        deliveryAddress: "",
        message: "",
      });
    } catch {
      setStatus("error");
      setFeedback("Palvelin ei vastannut. Tarkista yhteys ja yritä uudelleen.");
    }
  };

  return (
    <div
      id="quote"
      className="grid gap-8 rounded-2xl bg-transparent p-5 max-[390px]:p-4 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]"
    >
      {/* Left – info */}
      <div className="space-y-4">
        <div className="inline-flex max-w-full items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">
          <Mail className="h-3.5 w-3.5 text-blue-600" />
          <span className="truncate sm:whitespace-normal">Pyydä tarjous</span>
        </div>
        <h2 className="text-[1.85rem] font-bold tracking-tight text-slate-900 sm:text-4xl">
          Lisää tiedot ja tilaa
        </h2>
        <p className="max-w-xl text-[14px] leading-[1.75] text-slate-600 sm:text-base">
          Täytä yhteystietosi ja valitse palvelutyyppi. Lähetämme tarjouspyynnön suoraan palvelimelta,
          jotta saat kaikki olennaiset tiedot kerralla perille.
        </p>

        {/* Info strip */}
        <div className="space-y-2.5 pt-2">
          {[
            "Vastaamme yleensä saman päivän aikana",
            "Hinnat näytetään sis. ALV 25,5 %",
            "Yritys (ALV 0 %)",
          ].map((line) => (
            <div key={line} className="flex items-start gap-2 text-[13px] text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Right – form */}
      <form className="grid w-full gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor="quote-name" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            Nimi
            <input
              id="quote-name"
              required
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
          <label htmlFor="quote-phone" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            Puhelin
            <input
              id="quote-phone"
              required
              name="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor="quote-email" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            Sähköposti
            <input
              id="quote-email"
              required
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
          <label htmlFor="quote-service-type" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            Palvelutyyppi
            <select
              id="quote-service-type"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className={inputClass}
            >
              {quoteServiceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor="quote-pickup-address" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            Nouto osoite
            <input
              id="quote-pickup-address"
              required
              name="pickupAddress"
              autoComplete="street-address"
              placeholder="Katuosoite, kaupunki"
              value={formData.pickupAddress}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
          <label htmlFor="quote-delivery-address" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            Toimitusosoite
            <input
              id="quote-delivery-address"
              required
              name="deliveryAddress"
              autoComplete="street-address"
              placeholder="Katuosoite, kaupunki"
              value={formData.deliveryAddress}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
        </div>

        <label htmlFor="quote-message" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
          Lisätietoja
          <textarea
            id="quote-message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-6 py-3.5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#1e3a5f] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Lähetetään..." : "Lähetä tarjouspyyntö"}
          <ArrowUpRight className="h-4 w-4" />
        </button>

        {feedback ? (
          <p
            className={`rounded-xl border px-4 py-3 text-[13px] font-medium ${
              status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {feedback}
          </p>
        ) : null}
      </form>
    </div>
  );
}