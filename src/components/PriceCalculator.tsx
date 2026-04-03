"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { KalenteriVaraus } from "@/components/KalenteriVaraus";
import { PriceSummary } from "@/components/PriceSummary";
import {
  ajoneuvohinta,
  kappaletavaraHinta,
  lisaaAlv,
  pyoristaAsiakkaalle,
  projektiHinta,
} from "@/lib/pricing";
import { useCalculatorContext } from "@/lib/calculator-context";
import type { BookingSelectionData, ProjektiTyyppi, ServiceCategory } from "@/lib/types";

const cardClass = "rounded-2xl border border-slate-200 bg-transparent p-4 shadow-sm sm:p-8";

type AddressSuggestion = {
  label: string;
  placeId: string;
};

type RouteSummary = {
  distanceKm: number;
  durationMinutes: number | null;
  calculatedAt: string;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDuration(minutes: number | null) {
  if (minutes === null || minutes <= 0) {
    return "-";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

function AddressAutocompleteField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
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
    const query = value.trim();
    if (query.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(query)}`,
          {
            method: "GET",
            signal: controller.signal,
          },
        );

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
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  return (
    <label htmlFor={id} className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
      {label}
      <div ref={containerRef} className="relative">
        <input
          id={id}
          name={name}
          value={value}
          onFocus={() => setIsFocused(true)}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white/10 px-4 py-3 text-[14px] text-slate-900 shadow-sm backdrop-blur-sm outline-none transition focus:border-slate-400 focus:bg-white/20"
        />

        {isFocused && suggestions.length > 0 ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-xl border border-slate-200 bg-white/10 shadow-lg backdrop-blur-sm">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.placeId || suggestion.label}
                type="button"
                className="block w-full border-b border-slate-200 px-4 py-3 text-left text-[13px] font-medium text-slate-700 transition hover:bg-white/20 hover:text-slate-900 last:border-b-0"
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

      {loading ? (
        <span className="text-[12px] font-medium text-slate-500">Haetaan osoite-ehdotuksia...</span>
      ) : null}
    </label>
  );
}

export function AjoneuvoPriceCalculator() {
  const [km, setKm] = useState(60);
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [distanceStatus, setDistanceStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [distanceMessage, setDistanceMessage] = useState("");
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [bookingSelection, setBookingSelection] = useState<BookingSelectionData | null>(null);
  const calculatorContext = useCalculatorContext();

  useEffect(() => {
    calculatorContext?.setPickupAddress(pickupAddress);
  }, [pickupAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculatorContext?.setDeliveryAddress(deliveryAddress);
  }, [deliveryAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  const hinta = useMemo(() => ajoneuvohinta(km, false), [km]);

  useEffect(() => {
    calculatorContext?.setEstimatedPriceVat0(hinta);
    calculatorContext?.setEstimatedPriceVatIncl(pyoristaAsiakkaalle(lisaaAlv(hinta)));
  }, [hinta]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculatorContext?.setBookingSelection(bookingSelection);
  }, [bookingSelection]); // eslint-disable-line react-hooks/exhaustive-deps

  const haeGoogleMatka = async () => {
    const origin = pickupAddress.trim();
    const destination = deliveryAddress.trim();

    if (!origin || !destination) {
      setDistanceStatus("error");
      setDistanceMessage("Anna sekä nouto- että toimitusosoite.");
      setRouteSummary(null);
      return;
    }

    setDistanceStatus("loading");
    setDistanceMessage("");

    try {
      const response = await fetch("/api/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
        }),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        distanceKm?: number;
        durationMinutes?: number | null;
      };

      if (!response.ok || !result.ok || typeof result.distanceKm !== "number") {
        setDistanceStatus("error");
        setDistanceMessage(result.error ?? "Matkan haku epäonnistui. Tarkista osoitteet.");
        setRouteSummary(null);
        return;
      }

      const roundedKm = Math.max(0, Math.round(result.distanceKm));
      setKm(roundedKm);
      setDistanceStatus("success");
      setDistanceMessage("");
      setRouteSummary({
        distanceKm: roundedKm,
        durationMinutes:
          typeof result.durationMinutes === "number" ? result.durationMinutes : null,
        calculatedAt: new Date().toLocaleTimeString("fi-FI", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } catch {
      setDistanceStatus("error");
      setDistanceMessage("Yhteysvirhe etäisyyspalveluun. Yritä uudelleen.");
      setRouteSummary(null);
    }
  };

  const hintaSisAlv = pyoristaAsiakkaalle(lisaaAlv(hinta));

  return (
    <section className="rounded-2xl bg-transparent p-4 sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Ajoneuvokuljetukset
      </h2>
      <p className="mt-2 text-[14px] leading-7 text-slate-600 sm:text-[15px]">
        Moottoripyörät, mönkijät, ruohonleikkurit ja mopot. 0-40 km 129 €, 41-80 km 169 €, sen jälkeen 1,29 €/km.
      </p>
      <p className="mt-1 text-[14px] leading-7 text-slate-600 sm:text-[15px]">
        Lisäpyörän toimitus samaan toimipisteeseen 89 €.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <AddressAutocompleteField
          id="ajoneuvo-nouto-osoite"
          name="ajoneuvoNoutoOsoite"
          label="Mistä"
          value={pickupAddress}
          onChange={setPickupAddress}
          placeholder="Esim. Mannerheimintie 1, Helsinki"
        />

        <AddressAutocompleteField
          id="ajoneuvo-toimitus-osoite"
          name="ajoneuvoToimitusOsoite"
          label="Minne"
          value={deliveryAddress}
          onChange={setDeliveryAddress}
          placeholder="Esim. Hämeenkatu 10, Tampere"
        />

        <KalenteriVaraus
          lahto={pickupAddress}
          kohde={deliveryAddress}
          onDateTimeSelect={setBookingSelection}
        />

        <button
          type="button"
          onClick={haeGoogleMatka}
          disabled={distanceStatus === "loading"}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/10 px-4 py-3 text-[14px] font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition hover:border-blue-300 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
        >
          {distanceStatus === "loading" ? "Lasketaan hintaa..." : "Laske hinta"}
        </button>

        {distanceStatus === "success" && routeSummary ? (
          <div className="rounded-xl border border-slate-200 bg-white/10 px-4 py-4 shadow-sm backdrop-blur-sm sm:col-span-2">
            <p className="mb-3 text-[12px] font-medium text-slate-500">
              Paivitetty juuri nyt ({routeSummary.calculatedAt})
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Kilometrit</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{routeSummary.distanceKm} km</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Ajoaika</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatDuration(routeSummary.durationMinutes)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Hinta</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatPrice(hintaSisAlv)}</p>
              </div>
            </div>
          </div>
        ) : null}

        {distanceStatus === "error" && distanceMessage ? (
          <p
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700 sm:col-span-2"
          >
            {distanceMessage}
          </p>
        ) : null}
      </div>

      <PriceSummary hintaAlv0={hinta} label="Ajoneuvokuljetus" />
    </section>
  );
}

export function KappaletavaraPriceCalculator() {
  const [km, setKm] = useState(40);
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [distanceStatus, setDistanceStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [distanceMessage, setDistanceMessage] = useState("");
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [bookingSelection, setBookingSelection] = useState<BookingSelectionData | null>(null);
  const calculatorContext = useCalculatorContext();

  useEffect(() => {
    calculatorContext?.setPickupAddress(pickupAddress);
  }, [pickupAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculatorContext?.setDeliveryAddress(deliveryAddress);
  }, [deliveryAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  const hinta = useMemo(() => kappaletavaraHinta(km), [km]);

  useEffect(() => {
    calculatorContext?.setEstimatedPriceVat0(hinta);
    calculatorContext?.setEstimatedPriceVatIncl(pyoristaAsiakkaalle(lisaaAlv(hinta)));
  }, [hinta]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculatorContext?.setBookingSelection(bookingSelection);
  }, [bookingSelection]); // eslint-disable-line react-hooks/exhaustive-deps

  const haeGoogleMatka = async () => {
    const origin = pickupAddress.trim();
    const destination = deliveryAddress.trim();

    if (!origin || !destination) {
      setDistanceStatus("error");
      setDistanceMessage("Anna sekä nouto- että toimitusosoite.");
      setRouteSummary(null);
      return;
    }

    setDistanceStatus("loading");
    setDistanceMessage("");

    try {
      const response = await fetch("/api/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
        }),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        distanceKm?: number;
        durationMinutes?: number | null;
      };

      if (!response.ok || !result.ok || typeof result.distanceKm !== "number") {
        setDistanceStatus("error");
        setDistanceMessage(result.error ?? "Matkan haku epäonnistui. Tarkista osoitteet.");
        setRouteSummary(null);
        return;
      }

      const roundedKm = Math.max(0, Math.round(result.distanceKm));
      setKm(roundedKm);
      setDistanceStatus("success");
      setDistanceMessage("");
      setRouteSummary({
        distanceKm: roundedKm,
        durationMinutes:
          typeof result.durationMinutes === "number" ? result.durationMinutes : null,
        calculatedAt: new Date().toLocaleTimeString("fi-FI", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } catch {
      setDistanceStatus("error");
      setDistanceMessage("Yhteysvirhe etäisyyspalveluun. Yritä uudelleen.");
      setRouteSummary(null);
    }
  };

  const hintaSisAlv = pyoristaAsiakkaalle(lisaaAlv(hinta));

  return (
    <section className={cardClass}>
      <h2 className="max-w-full text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 wrap-anywhere sm:text-3xl">
        Kappaletavara
      </h2>
      <p className="mt-2 text-[14px] leading-7 text-slate-600 sm:text-[15px]">
        Pesukone, sohva ja sänky. 0-40 km 89 €, yli 40 km +1,29 €/km.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <AddressAutocompleteField
          id="kappaletavara-nouto-osoite"
          name="kappaletavaraNoutoOsoite"
          label="Mistä"
          value={pickupAddress}
          onChange={setPickupAddress}
          placeholder="Esim. Mannerheimintie 1, Helsinki"
        />

        <AddressAutocompleteField
          id="kappaletavara-toimitus-osoite"
          name="kappaletavaraToimitusOsoite"
          label="Minne"
          value={deliveryAddress}
          onChange={setDeliveryAddress}
          placeholder="Esim. Hämeenkatu 10, Tampere"
        />

        <KalenteriVaraus
          lahto={pickupAddress}
          kohde={deliveryAddress}
          onDateTimeSelect={setBookingSelection}
        />

        <button
          type="button"
          onClick={haeGoogleMatka}
          disabled={distanceStatus === "loading"}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/10 px-4 py-3 text-[14px] font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition hover:border-blue-300 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
        >
          {distanceStatus === "loading" ? "Lasketaan hintaa..." : "Laske hinta"}
        </button>

        {distanceStatus === "success" && routeSummary ? (
          <div className="rounded-xl border border-slate-200 bg-white/10 px-4 py-4 shadow-sm backdrop-blur-sm sm:col-span-2">
            <p className="mb-3 text-[12px] font-medium text-slate-500">
              Paivitetty juuri nyt ({routeSummary.calculatedAt})
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Kilometrit</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{routeSummary.distanceKm} km</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Ajoaika</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatDuration(routeSummary.durationMinutes)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Hinta</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatPrice(hintaSisAlv)}</p>
              </div>
            </div>
          </div>
        ) : null}

        {distanceStatus === "error" && distanceMessage ? (
          <p
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700 sm:col-span-2"
          >
            {distanceMessage}
          </p>
        ) : null}
      </div>

      <PriceSummary hintaAlv0={hinta} label="Kappaletavarakuljetus" />
    </section>
  );
}

export function ProjektiPriceCalculator() {
  const [tyyppi, setTyyppi] = useState<ProjektiTyyppi>("pieni_muutto");
  const [lisakuormat, setLisakuormat] = useState(0);
  const [kierratysKm, setKierratysKm] = useState(20);
  const [kierratysMaksu, setKierratysMaksu] = useState(35);
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [distanceStatus, setDistanceStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [distanceMessage, setDistanceMessage] = useState("");
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [bookingSelection, setBookingSelection] = useState<BookingSelectionData | null>(null);
  const calculatorContext = useCalculatorContext();

  useEffect(() => {
    calculatorContext?.setPickupAddress(pickupAddress);
  }, [pickupAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculatorContext?.setDeliveryAddress(deliveryAddress);
  }, [deliveryAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  const hinta = useMemo(
    () => projektiHinta(tyyppi, undefined, lisakuormat, kierratysKm, kierratysMaksu),
    [tyyppi, lisakuormat, kierratysKm, kierratysMaksu],
  );

  const haeGoogleMatka = async () => {
    const origin = pickupAddress.trim();
    const destination = deliveryAddress.trim();

    if (!origin || !destination) {
      setDistanceStatus("error");
      setDistanceMessage("Anna sekä nouto- että toimitusosoite.");
      setRouteSummary(null);
      return;
    }

    setDistanceStatus("loading");
    setDistanceMessage("");

    try {
      const response = await fetch("/api/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
        }),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        distanceKm?: number;
        durationMinutes?: number | null;
      };

      if (!response.ok || !result.ok || typeof result.distanceKm !== "number") {
        setDistanceStatus("error");
        setDistanceMessage(result.error ?? "Matkan haku epäonnistui. Tarkista osoitteet.");
        setRouteSummary(null);
        return;
      }

      const roundedKm = Math.max(0, Math.round(result.distanceKm));
      setKierratysKm(roundedKm);
      setDistanceStatus("success");
      setDistanceMessage("");
      setRouteSummary({
        distanceKm: roundedKm,
        durationMinutes:
          typeof result.durationMinutes === "number" ? result.durationMinutes : null,
        calculatedAt: new Date().toLocaleTimeString("fi-FI", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } catch {
      setDistanceStatus("error");
      setDistanceMessage("Yhteysvirhe etäisyyspalveluun. Yritä uudelleen.");
      setRouteSummary(null);
    }
  };

  const hintaSisAlv = hinta === null ? null : pyoristaAsiakkaalle(lisaaAlv(hinta));

  useEffect(() => {
    calculatorContext?.setEstimatedPriceVat0(hinta);
    calculatorContext?.setEstimatedPriceVatIncl(hintaSisAlv);
  }, [hinta, hintaSisAlv]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculatorContext?.setBookingSelection(bookingSelection);
  }, [bookingSelection]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className={cardClass}>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Muuttopalvelut
      </h2>
      <p className="mt-2 text-[14px] leading-7 text-slate-600 sm:text-[15px]">
        Muutot alkaen 269 € ja kierrätys alkaen 54,99 €. Aloitushintaan sisältyy 40 km, jonka jälkeen lisäkilometrit 0,69 €/km.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <AddressAutocompleteField
          id="projekti-nouto-osoite"
          name="projektiNoutoOsoite"
          label="Mistä"
          value={pickupAddress}
          onChange={setPickupAddress}
          placeholder="Esim. Mannerheimintie 1, Helsinki"
        />

        <AddressAutocompleteField
          id="projekti-toimitus-osoite"
          name="projektiToimitusOsoite"
          label="Minne"
          value={deliveryAddress}
          onChange={setDeliveryAddress}
          placeholder="Esim. Hämeenkatu 10, Tampere"
        />

        <KalenteriVaraus
          lahto={pickupAddress}
          kohde={deliveryAddress}
          onDateTimeSelect={setBookingSelection}
        />

        <label htmlFor="projekti-tyyppi" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
          Palvelutyyppi
          <select
            id="projekti-tyyppi"
            name="projektiTyyppi"
            value={tyyppi}
            onChange={(event) => setTyyppi(event.target.value as ProjektiTyyppi)}
            className="w-full rounded-xl border border-slate-200 bg-white/10 px-4 py-3 text-[14px] text-slate-900 shadow-sm backdrop-blur-sm outline-none transition focus:border-slate-400 focus:bg-white/20"
          >
            <option value="pieni_muutto">Pieni muutto (1-2 huonetta)</option>
            <option value="kierratys_1">Kierrätys, 1 kuorma</option>
            <option value="kierratys_lisa">Kierrätys, lisäkuormat</option>
          </select>
        </label>

        {tyyppi === "kierratys_lisa" ? (
          <label htmlFor="projekti-lisakuormat" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            Lisäkuormat
            <input
              id="projekti-lisakuormat"
              name="projektiLisakuormat"
              type="number"
              min={0}
              value={lisakuormat}
              onChange={(event) =>
                setLisakuormat(Math.max(0, Number(event.target.value) || 0))
              }
              className="w-full rounded-xl border border-slate-200 bg-white/10 px-4 py-3 text-[14px] text-slate-900 shadow-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/20 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        ) : null}

        {(tyyppi === "kierratys_1" || tyyppi === "kierratys_lisa") ? (
          <label htmlFor="projekti-kierratysmaksu" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            Kierrätysmaksu
            <select
              id="projekti-kierratysmaksu"
              name="projektiKierratysmaksu"
              value={kierratysMaksu}
              onChange={(event) => setKierratysMaksu(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white/10 px-4 py-3 text-[14px] text-slate-900 shadow-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/20 focus:ring-2 focus:ring-blue-100"
            >
              <option value={25}>Pieni kuorma - 25 € (sis. ALV)</option>
              <option value={35}>Normaalikuorma - 35 € (sis. ALV)</option>
              <option value={50}>Suuri kuorma - 50 € (sis. ALV)</option>
            </select>
          </label>
        ) : null}

        <label htmlFor="kierratys-1-maksu" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
          Kierrätysmaksu
          <select
            id="kierratys-1-maksu"
            name="kierratysMaksu"
            value={kierratysMaksu}
            onChange={(event) => setKierratysMaksu(Number(event.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white/10 px-4 py-3 text-[14px] text-slate-900 shadow-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/20 focus:ring-2 focus:ring-blue-100"
          >
            <option value={25}>Pieni kuorma - 25 € (sis. ALV)</option>
            <option value={35}>Normaalikuorma - 35 € (sis. ALV)</option>
            <option value={50}>Suuri kuorma - 50 € (sis. ALV)</option>
          </select>
        </label>

        <button
          type="button"
          onClick={haeGoogleMatka}
          disabled={distanceStatus === "loading"}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/10 px-4 py-3 text-[14px] font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition hover:border-blue-300 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
        >
          {distanceStatus === "loading" ? "Lasketaan hintaa..." : "Laske hinta"}
        </button>

        {distanceStatus === "success" && routeSummary && hintaSisAlv !== null ? (
          <div className="rounded-xl border border-slate-200 bg-white/10 px-4 py-4 shadow-sm backdrop-blur-sm sm:col-span-2">
            <p className="mb-3 text-[12px] font-medium text-slate-500">
              Paivitetty juuri nyt ({routeSummary.calculatedAt})
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Kilometrit</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{routeSummary.distanceKm} km</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Ajoaika</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatDuration(routeSummary.durationMinutes)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Hinta</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatPrice(hintaSisAlv)}</p>
              </div>
            </div>
          </div>
        ) : null}

        {distanceStatus === "error" && distanceMessage ? (
          <p
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700 sm:col-span-2"
          >
            {distanceMessage}
          </p>
        ) : null}

      </div>

      {(tyyppi === "kierratys_1" || tyyppi === "kierratys_lisa") ? (
        <p className="mt-3 text-[13px] text-slate-700">
          Kierrätyksessä hinta muodostuu perushinnasta 54,99 €, yli 40 km osuudesta (0,69 €/km), lisäkuormista ja asemamaksusta.
        </p>
      ) : null}

      {hinta === null ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-[14px] text-amber-800">
          Suuri muutto hinnoitellaan tarjouksena, koska se vaatii useamman kuljetuskerran. Jätä tarjouspyyntö, niin palaamme nopeasti.
          <div className="mt-3">
            <Link
              href="/#quote"
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-600 sm:w-auto"
            >
              Avaa tarjouslomake
            </Link>
          </div>
        </div>
      ) : (
        <PriceSummary hintaAlv0={hinta} label="Muuttopalvelu" />
      )}
    </section>
  );
}

export function PriceCalculator({ category }: { category: ServiceCategory }) {
  if (category === "ajoneuvo") return <AjoneuvoPriceCalculator />;
  if (category === "kappaletavara") return <KappaletavaraPriceCalculator />;
  return <ProjektiPriceCalculator />;
}
