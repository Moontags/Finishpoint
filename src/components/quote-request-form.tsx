"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCalculatorContext } from "@/lib/calculator-context";
import { ORDER_DRAFT_STORAGE_KEY } from "@/lib/order-draft";
import { quoteServiceOptions } from "@/lib/services";
import type { ServiceCategory } from "@/lib/types";

const orderServiceTypeOptions = [
  "Ajoneuvokuljetukset",
  "Kappaletavara",
  "Muutot ja kierrätys",
] as const;

const categoryDefaultServiceType: Record<ServiceCategory, string> = {
  ajoneuvo: orderServiceTypeOptions[0],
  kappaletavara: orderServiceTypeOptions[1],
  projekti: orderServiceTypeOptions[2],
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white/75 px-4 py-3 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:ring-[3px] focus:ring-blue-200";

export function QuoteRequestForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceType: "Muu kuljetus",
    pickupAddress: "",
    deliveryAddress: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [hasCalculatorData, setHasCalculatorData] = useState(false);
  const [activeAction, setActiveAction] = useState<"quote" | "order" | null>(null);
  const calculatorContext = useCalculatorContext();

  useEffect(() => {
    if (!calculatorContext) return;
    const { pickupAddress, deliveryAddress, serviceCategory } = calculatorContext;
    if (!pickupAddress && !deliveryAddress) return;
    // Sync calculator values into the order form fields when calculator data changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((current) => ({
      ...current,
      pickupAddress: pickupAddress || current.pickupAddress,
      deliveryAddress: deliveryAddress || current.deliveryAddress,
      serviceType: serviceCategory
        ? (categoryDefaultServiceType[serviceCategory] ?? current.serviceType)
        : current.serviceType,
    }));
    setHasCalculatorData(true);
  }, [calculatorContext?.pickupAddress, calculatorContext?.deliveryAddress, calculatorContext?.serviceCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if ((status !== "success" && status !== "error") || !feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback("");
      setStatus("idle");
    }, status === "success" ? 2000 : 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [status, feedback]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setActiveAction("quote");
    setStatus("loading");
    setFeedback("");

    try {
      const addressParts = [
        formData.pickupAddress ? `Nouto: ${formData.pickupAddress}` : "",
        formData.deliveryAddress ? `Toimitus: ${formData.deliveryAddress}` : "",
      ].filter(Boolean);
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        serviceType: formData.serviceType,
        addresses: addressParts.join(" → "),
        message: formData.message,
      };
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setActiveAction(null);
        setStatus("error");
        setFeedback(result.error ?? "Lähetys epäonnistui. Yritä uudelleen.");
        return;
      }

      setStatus("success");
      setFeedback("Tarjouspyyntö lähetettiin onnistuneesti.");
      setActiveAction(null);
      setHasCalculatorData(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        serviceType: "Muu kuljetus",
        pickupAddress: "",
        deliveryAddress: "",
        message: "",
      });
    } catch {
      setActiveAction(null);
      setStatus("error");
      setFeedback("Palvelin ei vastannut. Tarkista yhteys ja yritä uudelleen.");
    }
  };

  const handleOrderAndPayment = async () => {
    setActiveAction("order");
    setStatus("loading");
    setFeedback("");

    try {
      const addressParts = [
        formData.pickupAddress ? `Nouto: ${formData.pickupAddress}` : "",
        formData.deliveryAddress ? `Toimitus: ${formData.deliveryAddress}` : "",
      ].filter(Boolean);

      const orderDraft = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        serviceType: formData.serviceType,
        pickupAddress: formData.pickupAddress,
        deliveryAddress: formData.deliveryAddress,
        addresses: addressParts.join(" -> "),
        message: formData.message,
        estimatedPriceVat0: calculatorContext?.estimatedPriceVat0 ?? null,
        estimatedPriceVatIncl: calculatorContext?.estimatedPriceVatIncl ?? null,
        bookingSelection: calculatorContext?.bookingSelection ?? null,
      };

      window.sessionStorage.setItem(ORDER_DRAFT_STORAGE_KEY, JSON.stringify(orderDraft));
      setStatus("idle");
      setActiveAction(null);
      router.push("/kassa");
    } catch {
      setActiveAction(null);
      setStatus("error");
      setFeedback("Kassaan siirtyminen epäonnistui. Yritä uudelleen.");
    }
  };

  const hasContactFields =
    formData.name.trim().length > 0 &&
    formData.phone.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.pickupAddress.trim().length > 0 &&
    formData.deliveryAddress.trim().length > 0;

  const hasPriceFromCalculator = Boolean(
    hasCalculatorData && calculatorContext?.estimatedPriceVat0 && calculatorContext.estimatedPriceVat0 > 0,
  );
  const isOrderFlow = hasPriceFromCalculator;
  const serviceTypeOptions = isOrderFlow ? orderServiceTypeOptions : quoteServiceOptions;

  const canAttemptOrder = hasPriceFromCalculator && hasContactFields;

  return (
    <div
      id="quote"
      className="grid gap-8 rounded-2xl bg-transparent p-5 max-[390px]:p-4 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]"
    >
      {/* Left – info */}
      <div className="space-y-4">
        <div className="inline-flex max-w-full items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 sm:text-xs">
          <Mail className="h-3.5 w-3.5 text-blue-600" />
          <span className="truncate sm:whitespace-normal">Vahvista tilaus ja maksa</span>
        </div>
        {isOrderFlow ? (
          <p className="-mt-3 ml-1 inline-flex w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
            Vaihe 1/2: Yhteystiedot
          </p>
        ) : null}
        <h2 className="hidden text-[1.85rem] font-bold tracking-tight text-slate-900 sm:block sm:text-4xl">
          Täytä yhteystietosi
        </h2>
        <p className="max-w-xl text-[14px] leading-[1.75] text-slate-600 sm:text-base">
          {isOrderFlow
            ? "Täydennä yhteystietosi ja jatka kassaan. Tarkistat tilauksen vielä ennen maksua."
            : "Voit lähettää tarjouspyynnön tai tilata suoraan, kun hinta on laskettu laskurissa."}
        </p>

        {/* Info strip */}
        <div className="space-y-2.5 pt-2">
          {[
            "Vastaamme yleensä saman päivän aikana",
            isOrderFlow ? "Seuraava vaihe: tarkista tiedot kassassa" : "Hinnat näytetään sis. ALV 25,5 %",
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
              {serviceTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor="quote-pickup-address" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            Mistä
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
            Minne
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

        <div className="grid gap-3 sm:grid-cols-2">
          {!isOrderFlow ? (
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700/80 px-6 py-3.5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-700/90 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
            >
              {status === "loading" && activeAction === "quote" ? "Lähetetään..." : "Lähetä tarjouspyyntö"}
              <ArrowUpRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOrderAndPayment}
              disabled={status === "loading" || !canAttemptOrder}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700/80 px-6 py-3.5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-700/90 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
            >
              {status === "loading" && activeAction === "order" ? "Siirrytään..." : "Tilaa ja jatka kassaan"}
              <ArrowUpRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {isOrderFlow ? (
          <p className="text-[12px] text-slate-600">
            Seuraava vaihe: tarkista tiedot kassassa ja vahvista maksu.
          </p>
        ) : null}

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