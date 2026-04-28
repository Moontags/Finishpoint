'use client';

import { use, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
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
  "w-full rounded-xl border border-slate-400 bg-transparent px-4 py-3 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-white/30 focus:ring-[3px] focus:ring-blue-200";

type AddressSuggestion = {
  label: string;
  placeId: string;
};

function AddressAutocompleteField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      const target = event.target as Node | null;
      if (target && !containerRef.current.contains(target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => {
      document.removeEventListener("mousedown", onDocumentMouseDown);
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      setSuggestions([]);
      return;
    }

    const query = value.trim();
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`, {
          method: "GET",
          signal: controller.signal,
        });

        const result = (await response.json()) as {
          ok: boolean;
          suggestions?: AddressSuggestion[];
        };

        if (!response.ok || !result.ok) {
          setSuggestions([]);
          return;
        }

        setSuggestions(result.suggestions ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [disabled, value]);

  return (
    <label htmlFor={id} className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
      {label}
      <div
        ref={containerRef}
        className="relative max-w-full overflow-x-hidden"
        style={{ touchAction: "pan-y" }}
      >
        <input
          id={id}
          name={name}
          required
          autoComplete="street-address"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onFocus={() => {
            if (!disabled) {
              setIsFocused(true);
            }
          }}
          onChange={(event) => {
            if (!disabled) {
              onChange(event.target.value);
            }
          }}
          className={inputClass}
        />

        {!disabled && isFocused && suggestions.length > 0 ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-10 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.placeId || suggestion.label}
                type="button"
                className="block w-full border-b border-slate-200 px-4 py-3 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 last:border-b-0"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(suggestion.label);
                  setSuggestions([]);
                  setIsFocused(false);
                }}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

    </label>
  );
}

export function QuoteRequestForm() {
  const { t } = useLanguage();
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

  // Listen for autofill event from ChatWidget
  useEffect(() => {
    function handleAutofillQuote(e: Event) {
      const detail = (e as CustomEvent).detail || {};
      setFormData((current) => ({
        ...current,
        name: detail.name || current.name,
        phone: detail.phone || current.phone,
        email: detail.email || current.email,
        pickupAddress: detail.pickupAddress || current.pickupAddress,
        deliveryAddress: detail.deliveryAddress || current.deliveryAddress,
        message: detail.message || current.message,
      }));
    }
    window.addEventListener('fp-autofill-quote', handleAutofillQuote);
    return () => window.removeEventListener('fp-autofill-quote', handleAutofillQuote);
  }, []);
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
        setFeedback(result.error ?? t('form.error_send', 'Lähetys epäonnistui. Yritä uudelleen.'));
        return;
      }

      setStatus("success");
      setFeedback(t('form.success', 'Tarjouspyyntö lähetettiin onnistuneesti.'));
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
      setFeedback(t('form.error_server', 'Palvelin ei vastannut. Tarkista yhteys ja yritä uudelleen.'));
    }
  };

  const handleOrderAndPayment = async () => {
    if (isOrderFlow && !addressesMatchCalculator) {
      setStatus("error");
      setFeedback(t('form.error_address_match', 'Nouto- ja toimitusosoitteen tulee olla samat kuin laskurissa.'));
      return;
    }

    setActiveAction("order");
    setStatus("loading");
    setFeedback("");

    try {
      const draftPickupAddress = isOrderFlow && calculatorPickupAddress
        ? calculatorPickupAddress
        : formData.pickupAddress;
      const draftDeliveryAddress = isOrderFlow && calculatorDeliveryAddress
        ? calculatorDeliveryAddress
        : formData.deliveryAddress;

      const addressParts = [
        draftPickupAddress ? `Nouto: ${draftPickupAddress}` : "",
        draftDeliveryAddress ? `Toimitus: ${draftDeliveryAddress}` : "",
      ].filter(Boolean);

      const orderDraft = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        serviceType: formData.serviceType,
        pickupAddress: draftPickupAddress,
        deliveryAddress: draftDeliveryAddress,
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
      setFeedback(t('form.error_checkout', 'Kassaan siirtyminen epäonnistui. Yritä uudelleen.'));
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

  const calculatorPickupAddress = calculatorContext?.pickupAddress?.trim() ?? "";
  const calculatorDeliveryAddress = calculatorContext?.deliveryAddress?.trim() ?? "";
  const currentPickupAddress = formData.pickupAddress.trim();
  const currentDeliveryAddress = formData.deliveryAddress.trim();

  const addressesMatchCalculator =
    !isOrderFlow ||
    (
      calculatorPickupAddress.length > 0 &&
      calculatorDeliveryAddress.length > 0 &&
      currentPickupAddress === calculatorPickupAddress &&
      currentDeliveryAddress === calculatorDeliveryAddress
    );

  const canAttemptOrder = hasPriceFromCalculator && hasContactFields && addressesMatchCalculator;

  return (
    <div
      id="quote"
      className="grid gap-8 rounded-2xl bg-transparent p-5 max-[390px]:p-4 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]"
    >
      {/* Left – info */}
      <div className="space-y-4">
        <div className="inline-flex max-w-full items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.18em] text-blue-700 sm:text-[15px]">
          <Mail className="h-4 w-4 text-blue-700" />
          <span className="truncate sm:whitespace-normal">{t('form.confirm_order', 'Vahvista tilaus ja maksa')}</span>
        </div>
        {isOrderFlow ? (
          <p className="mt-1 block w-fit px-0 py-0 text-[11px] font-semibold text-slate-900">
            {t("form.step1_contact")}
          </p>
        ) : null}
        <h2 className="hidden text-[1.85rem] font-bold tracking-tight text-slate-900 sm:block sm:text-4xl">
          {t("form.fill_details")}
        </h2>
        <p className="max-w-xl text-[14px] leading-[1.75] text-slate-600 sm:text-base">
          {isOrderFlow
            ? t('form.complete_and_checkout', 'Täydennä yhteystietosi...')
            : t('form.send_quote_or_order', 'Voit lähettää tarjouspyyntön...')}
        </p>

        {/* Info strip */}
        <div className="space-y-2.5 pt-2">
          {[
            t('form.response_same_day', 'Vastaamme yleensä saman päivän aikana'),
            isOrderFlow ? t('form.next_step_checkout', 'Seuraava vaihe...') : t('common.vat_incl', 'Hinnat näytetään sis. ALV 25,5 %'),
            t('common.business_vat', 'Yritys (ALV 0 %)'),
          ].map((line) => (
            <div key={line} className="flex items-start gap-2 text-[13px] text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Right – form */}
      <form className="grid w-full gap-4" data-testid="quote-form" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor="quote-name" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            {t('form.name', 'Nimi')}
            <input
              id="quote-name"
              required
              name="name"
              data-testid="quote-name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
          <label htmlFor="quote-phone" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            {t('form.phone', 'Puhelin')}
            <input
              id="quote-phone"
              required
              name="phone"
              data-testid="quote-phone"
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
            {t('form.email', 'Sähköposti')}
            <input
              id="quote-email"
              required
              name="email"
              data-testid="quote-email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
          <label htmlFor="quote-service-type" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            {t('form.service_type', 'Palvelutyyppi')}
            <select
              id="quote-service-type"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className={inputClass}
            >
              {serviceTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {t(`service.${option}`, option)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AddressAutocompleteField
            id="quote-pickup-address"
            name="pickupAddress"
            label={t('form.from', 'Mistä')}
            value={formData.pickupAddress}
            onChange={(pickupAddress) => setFormData((current) => ({ ...current, pickupAddress }))}
            placeholder={t('form.address_placeholder', 'Katuosoite, kaupunki')}
            disabled={isOrderFlow}
          />
          <AddressAutocompleteField
            id="quote-delivery-address"
            name="deliveryAddress"
            label={t('form.to', 'Minne')}
            value={formData.deliveryAddress}
            onChange={(deliveryAddress) => setFormData((current) => ({ ...current, deliveryAddress }))}
            placeholder={t('form.address_placeholder', 'Katuosoite, kaupunki')}
            disabled={isOrderFlow}
          />
        </div>

        <label htmlFor="quote-message" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
          {t('form.additional_info', 'Lisätietoja')}
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
              data-testid="quote-submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-transparent px-6 py-3.5 text-sm font-bold text-slate-900 transition duration-200 hover:bg-slate-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
            >
              {status === "loading" && activeAction === "quote" ? t('form.sending', 'Lähetetään...') : t('form.send_quote', 'Lähetä tarjouspyyntö')}
              <ArrowUpRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOrderAndPayment}
              disabled={status === "loading" || !canAttemptOrder}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-transparent px-6 py-3.5 text-sm font-bold text-slate-900 transition duration-200 hover:bg-slate-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
            >
              {status === "loading" && activeAction === "order" ? t('form.redirecting', 'Siirrytään...') : t('form.order_checkout', 'Tilaa ja jatka kassaan')}
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
            data-testid="quote-feedback"
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