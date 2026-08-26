"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { KalenteriVaraus } from "@/components/KalenteriVaraus";
import { PriceSummary } from "@/components/PriceSummary";
import {
  HOME_BASE,
  kappaletavaraHinta,
  lisaaAlv,
  positiointiYhteensa,
  pyoristaAsiakkaalle,
  projektiHinta,
} from "@/lib/pricing";
import { usePrices } from "@/lib/use-prices";
import { useCalculatorContext } from "@/lib/calculator-context";
import { useLanguage } from "@/lib/LanguageContext";
import type { BookingSelectionData, ProjektiTyyppi, ServiceCategory } from "@/lib/types";

const cardClass = "bg-transparent";

function slowScrollToQuote() {
  const el = document.getElementById("quote");
  if (!el) return;
  const targetY = el.getBoundingClientRect().top + window.scrollY;
  const startY = window.scrollY;
  const diff = targetY - startY;
  // Hidas vieritys, jotta asiakas ehtii nähdä hinta- ja aikatauluyhteenvedon
  // ennen kuin sivu siirtyy yhteystietolomakkeeseen.
  const duration = 4000;
  const startTime = performance.now();
  function step(now: number) {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    window.scrollTo(0, startY + diff * ease);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

type AddressSuggestion = {
  label: string;
  placeId: string;
};

type RouteSummary = {
  distanceKm: number;
  durationMinutes: number | null;
  calculatedAt: string;
};

// Tyhjänä ajettavat osuudet tukikohdasta noutopaikkaan ja jättöpaikasta
// takaisin tukikohtaan. null tarkoittaa, ettei etäisyyttä saatu — positiointi
// lasketaan silloin 0 €:na.
type PositioningDistances = {
  pickupKm: number;
  deliveryKm: number;
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
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  // Ei tarvita portaalin sijaintilaskentaa flow-versiossa

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
        // Korjattu: endpointin perään lisätty kauttaviiva App Router -yhteensopivaksi
        const response = await fetch(
          `/api/places/autocomplete/?input=${encodeURIComponent(query)}`,
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

  const { t } = useLanguage();
  return (
    <label htmlFor={id} className="grid gap-1.5 text-[13px] font-semibold text-slate-900">
      {t(label, label)}
      <div
        ref={containerRef}
        style={{ position: 'relative', overflow: 'visible', touchAction: 'pan-y' }}
      >
        <input
          ref={inputRef}
          id={id}
          name={name}
          data-testid={
            name.toLowerCase().includes('nouto') || name === 'pickupAddress'
              ? 'pickup-address-input'
              : name.toLowerCase().includes('toimitus') || name === 'deliveryAddress'
              ? 'delivery-address-input'
              : undefined
          }
          value={value}
          onFocus={() => setIsFocused(true)}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t(placeholder, placeholder)}
          style={{
            width: '100%',
            borderRadius: '12px',
            border: '1px solid #94a3b8',
            background: 'transparent',
            padding: '12px 18px',
            fontSize: 15,
            color: '#1e293b',
            outline: 'none',
            marginBottom: 0,
          }}
        />
        {/* Osoite-ehdotukset */}
        {isFocused && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 99999,
              marginTop: '4px',
              backgroundColor: '#1e1e2e',
              border: '1px solid #444',
              borderRadius: '8px',
              overflow: 'visible',
            }}
          >
            {suggestions.map((s, i) => (
              <div
                key={s.placeId || s.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(s.label);
                  setSuggestions([]);
                  setIsFocused(false);
                }}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#fff',
                  borderBottom: i < suggestions.length - 1 ? '1px solid #333' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {s.label}
              </div>
            ))}
          </div>
        )}
      </div>

    </label>
  );
}

export function KappaletavaraPriceCalculator({ serviceTabsSlot }: { serviceTabsSlot?: ReactNode }) {
  const prices = usePrices();
  const { t } = useLanguage();
  const [km, setKm] = useState(40);
  const calculatorContext = useCalculatorContext();
  const [pickupAddress, setPickupAddress] = useState(calculatorContext?.pickupAddress ?? "");
  const [deliveryAddress, setDeliveryAddress] = useState(calculatorContext?.deliveryAddress ?? "");
  const [distanceStatus, setDistanceStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [distanceMessage, setDistanceMessage] = useState("");
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [positioning, setPositioning] = useState<PositioningDistances | null>(null);
  const [bookingSelection, setBookingSelection] = useState<BookingSelectionData | null>(null);

  useEffect(() => {
    calculatorContext?.setPickupAddress(pickupAddress);
  }, [pickupAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculatorContext?.setDeliveryAddress(deliveryAddress);
  }, [deliveryAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  const positiointiHinta = useMemo(
    () => positiointiYhteensa(positioning?.pickupKm, positioning?.deliveryKm, prices),
    [positioning, prices],
  );

  // Reittihinta + tyhjänä ajon positiointimaksu. Summa menee sellaisenaan
  // tilaukselle, joten ALV lisätään vasta tämän päälle.
  const hinta = useMemo(
    () => kappaletavaraHinta(km, prices) + positiointiHinta,
    [km, prices, positiointiHinta],
  );

  useEffect(() => {
    calculatorContext?.setEstimatedPriceVat0(hinta);
    calculatorContext?.setEstimatedPriceVatIncl(pyoristaAsiakkaalle(lisaaAlv(hinta, prices)));
  }, [hinta]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculatorContext?.setBookingSelection(bookingSelection);
  }, [bookingSelection]); // eslint-disable-line react-hooks/exhaustive-deps

  const haeGoogleMatka = async () => {
    const origin = pickupAddress.trim();
    const destination = deliveryAddress.trim();

    if (!origin || !destination) {
      setDistanceStatus("error");
      setDistanceMessage(t('calculator.error_missing_address', 'Anna sekä nouto- että toimitusosoite.'));
      setRouteSummary(null);
      setPositioning(null);
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
          // Tukikohta positiointimaksun laskentaan (tyhjänä ajo).
          positioningBase: HOME_BASE,
        }),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        distanceKm?: number;
        durationMinutes?: number | null;
        positioning?: { pickupKm?: number; deliveryKm?: number } | null;
      };

      if (!response.ok || !result.ok || typeof result.distanceKm !== "number") {
        setDistanceStatus("error");
        setDistanceMessage(result.error ?? t('calculator.error_distance', 'Matkan haku epäonnistui. Tarkista osoitteet.'));
        setRouteSummary(null);
        setPositioning(null);
        return;
      }

      const roundedKm = Math.max(0, Math.round(result.distanceKm));
      setKm(roundedKm);
      // Positiointietäisyys on vapaaehtoinen: jos sen haku ei onnistunut, hinta
      // lasketaan ilman positiointimaksua eikä laskuri näytä virhettä.
      setPositioning(
        typeof result.positioning?.pickupKm === "number" &&
          typeof result.positioning?.deliveryKm === "number"
          ? {
              pickupKm: result.positioning.pickupKm,
              deliveryKm: result.positioning.deliveryKm,
            }
          : null,
      );
      setDistanceStatus("success");
      setDistanceMessage("");
      setTimeout(slowScrollToQuote, 300);
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
      setDistanceMessage(t('calculator.error_connection', 'Yhteysvirhe etäisyyspalveluun. Yritä uudelleen.'));
      setRouteSummary(null);
      setPositioning(null);
    }
  };

  const hintaSisAlv = pyoristaAsiakkaalle(lisaaAlv(hinta, prices));

  return (
    <section className={cardClass}>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <AddressAutocompleteField
          id="kappaletavara-nouto-osoite"
          name="kappaletavaraNoutoOsoite"
          label="calculator.from"
          value={pickupAddress}
          onChange={setPickupAddress}
          placeholder="calculator.address_placeholder"
        />

        <AddressAutocompleteField
          id="kappaletavara-toimitus-osoite"
          name="kappaletavaraToimitusOsoite"
          label="calculator.to"
          value={deliveryAddress}
          onChange={setDeliveryAddress}
          placeholder="calculator.address_placeholder"
        />

        <KalenteriVaraus
          lahto={pickupAddress}
          kohde={deliveryAddress}
          onDateTimeSelect={setBookingSelection}
        />

        {serviceTabsSlot}

        <button
          type="button"
          onClick={haeGoogleMatka}
          disabled={distanceStatus === "loading"}
          data-testid="calculate-button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-400 bg-transparent px-6 py-3.5 text-sm font-bold text-slate-900 disabled:cursor-not-allowed sm:col-span-2"
        >
          {distanceStatus === "loading"
            ? t('calculator.calculating_price', 'Lasketaan hintaa...')
            : t('calculator.calculate_price', 'Laske hinta')}
        </button>

        {distanceStatus === "success" && routeSummary ? (
          <div className="rounded-xl bg-white/10 px-4 py-4 shadow-sm backdrop-blur-sm sm:col-span-2" data-testid="price-result">
            <p className="mb-3 text-[12px] font-medium text-slate-700">
              {t('calculator.updated_now', 'Päivitetty juuri nyt')} ({routeSummary.calculatedAt})
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">{t('calculator.kilometers', 'Kilometrit')}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{routeSummary.distanceKm} km</p>
              </div>
              <div className="rounded-lg bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">{t('calculator.duration', 'Ajoaika')}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatDuration(routeSummary.durationMinutes)}</p>
              </div>
              <div className="rounded-lg bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">{t('calculator.price', 'Hinta')}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatPrice(hintaSisAlv)}</p>
              </div>
            </div>
          </div>
        ) : null}

        {distanceStatus === "error" && distanceMessage ? (
          <p
            className="rounded-xl bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700 sm:col-span-2"
          >
            {distanceMessage}
          </p>
        ) : null}
      </div>

      <p className="mt-3 text-[13px] text-slate-900">
        {t(
          "calculator.kappaletavara_note",
          "Hinta määräytyy matkan pituuden sekä nouto- ja jättöpaikan sijainnin mukaan.",
        )}
      </p>

      <PriceSummary
        hintaAlv0={hinta}
        positiointiAlv0={positiointiHinta}
        label="Pikakuljetus"
        prices={prices}
      />
    </section>
  );
}

export function ProjektiPriceCalculator({ serviceTabsSlot }: { serviceTabsSlot?: ReactNode }) {
  const { t } = useLanguage();
  const prices = usePrices();
  const calculatorContext = useCalculatorContext();
  // Kierrätys on siirtynyt omaksi pääpalvelukseen (/kierratys) ja on
  // tarjouspohjainen, joten muuttolaskuri hinnoittelee vain pienen muuton.
  const tyyppi: ProjektiTyyppi = "pieni_muutto";
  const [muuttoKm, setMuuttoKm] = useState(20);
  const [pickupAddress, setPickupAddress] = useState(calculatorContext?.pickupAddress ?? "");
  const [deliveryAddress, setDeliveryAddress] = useState(calculatorContext?.deliveryAddress ?? "");
  const [distanceStatus, setDistanceStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [distanceMessage, setDistanceMessage] = useState("");
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [bookingSelection, setBookingSelection] = useState<BookingSelectionData | null>(null);

  useEffect(() => {
    calculatorContext?.setPickupAddress(pickupAddress);
  }, [pickupAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculatorContext?.setDeliveryAddress(deliveryAddress);
  }, [deliveryAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  const hinta = useMemo(
    () => projektiHinta(tyyppi, undefined, muuttoKm, prices),
    [tyyppi, muuttoKm, prices],
  );

  const haeGoogleMatka = async () => {
    const origin = pickupAddress.trim();
    const destination = deliveryAddress.trim();

    if (!origin || !destination) {
      setDistanceStatus("error");
      setDistanceMessage(t('calculator.error_missing_address', 'Anna sekä nouto- että toimitusosoite.'));
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
        setDistanceMessage(result.error ?? t('calculator.error_distance', 'Matkan haku epäonnistui. Tarkista osoitteet.'));
        setRouteSummary(null);
        return;
      }

      const roundedKm = Math.max(0, Math.round(result.distanceKm));
      setMuuttoKm(roundedKm);
      setDistanceStatus("success");
      setDistanceMessage("");
      setTimeout(slowScrollToQuote, 300);
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
      setDistanceMessage(t('calculator.error_connection', 'Yhteysvirhe etäisyyspalveluun. Yritä uudelleen.'));
      setRouteSummary(null);
    }
  };

  const hintaSisAlv = hinta === null ? null : pyoristaAsiakkaalle(lisaaAlv(hinta, prices));

  useEffect(() => {
    calculatorContext?.setEstimatedPriceVat0(hinta);
    calculatorContext?.setEstimatedPriceVatIncl(hintaSisAlv);
  }, [hinta, hintaSisAlv]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculatorContext?.setBookingSelection(bookingSelection);
  }, [bookingSelection]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className={cardClass}>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <AddressAutocompleteField
          id="projekti-nouto-osoite"
          name="projektiNoutoOsoite"
          label={t('form.from', 'Mistä')}
          value={pickupAddress}
          onChange={setPickupAddress}
          placeholder={t('calculator.address_placeholder', 'Katuosoite, kaupunki')}
        />

        <AddressAutocompleteField
          id="projekti-toimitus-osoite"
          name="projektiToimitusOsoite"
          label={t('form.to', 'Minne')}
          value={deliveryAddress}
          onChange={setDeliveryAddress}
          placeholder={t('calculator.address_placeholder', 'Katuosoite, kaupunki')}
        />

        <KalenteriVaraus
          lahto={pickupAddress}
          kohde={deliveryAddress}
          onDateTimeSelect={setBookingSelection}
        />

        {serviceTabsSlot}

        <button
          type="button"
          onClick={haeGoogleMatka}
          disabled={distanceStatus === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-400 bg-transparent px-6 py-3.5 text-sm font-bold text-slate-900 disabled:cursor-not-allowed sm:col-span-2"
        >
          {distanceStatus === "loading" ? t('calculator.calculating_price', 'Lasketaan hintaa...') : t('calculator.calculate_price', 'Laske hinta')}
        </button>

        {distanceStatus === "success" && routeSummary && hintaSisAlv !== null ? (
          <div className="rounded-xl bg-white/10 px-4 py-4 shadow-sm backdrop-blur-sm sm:col-span-2">
            <p className="mb-3 text-[12px] font-medium text-slate-700">
              Paivitetty juuri nyt ({routeSummary.calculatedAt})
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">Kilometrit</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{routeSummary.distanceKm} km</p>
              </div>
              <div className="rounded-lg bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">Ajoaika</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatDuration(routeSummary.durationMinutes)}</p>
              </div>
              <div className="rounded-lg bg-white/10 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">Hinta</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatPrice(hintaSisAlv)}</p>
              </div>
            </div>
          </div>
        ) : null}

        {distanceStatus === "error" && distanceMessage ? (
          <p
            className="rounded-xl bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700 sm:col-span-2"
          >
            {distanceMessage}
          </p>
        ) : null}

      </div>

      <p className="mt-3 text-[13px] text-slate-900">
        {t(
          "calculator.muutto_note",
          "Pienen muuton hinta muodostuu perushinnasta",
        )}{" "}
        {formatPrice(prices.base_muutto)}{" "}
        {t("calculator.muutto_note_km", "sekä mahdollisesta yli 40 km osuudesta")}{" "}
        ({formatPrice(prices.km_rate_muutto)}/km).
      </p>

      {hinta === null ? (
        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-4 text-[14px] text-amber-800">
          Suuri muutto hinnoitellaan tarjouksena, koska se vaatii useamman kuljetuskerran. Jätä tarjouspyyntö, niin palaamme nopeasti.
          <div className="mt-3">
            <Link
              href="/#quote"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-400 bg-transparent px-5 py-3 text-sm font-bold text-slate-900 sm:w-auto"
            >
              Avaa tarjouslomake
            </Link>
          </div>
        </div>
      ) : (
        <PriceSummary hintaAlv0={hinta} label="Muuttopalvelu" prices={prices} />
      )}
    </section>
  );
}

export function PriceCalculator({ category, serviceTabsSlot }: { category: ServiceCategory; serviceTabsSlot?: ReactNode }) {
  if (category === "kappaletavara") return <KappaletavaraPriceCalculator serviceTabsSlot={serviceTabsSlot} />;
  return <ProjektiPriceCalculator serviceTabsSlot={serviceTabsSlot} />;
}
