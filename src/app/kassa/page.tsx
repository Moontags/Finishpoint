"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
// ...existing code...
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ORDER_DRAFT_STORAGE_KEY, type OrderDraft } from "@/lib/order-draft";

function formatEuro(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}
// (no trailing brace)

export default function CheckoutPage() {
  const { t } = useLanguage();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : undefined;
  const success = searchParams?.get("success") === "1";
  const cancel = searchParams?.get("cancel") === "1";
  const [draft] = useState<OrderDraft | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(ORDER_DRAFT_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as OrderDraft;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canConfirm = useMemo(() => {
    if (!draft) {
      return false;
    }
    return (
      draft.name.trim().length > 0 &&
      draft.phone.trim().length > 0 &&
      draft.email.trim().length > 0 &&
      draft.addresses.trim().length > 0 &&
      typeof draft.estimatedPriceVat0 === "number" &&
      draft.estimatedPriceVat0 > 0 &&
      accepted
    );
  }, [accepted, draft]);

  const confirmAndPay = async () => {
    if (!draft) {
      setError(t('checkout.confirming', 'Vahvistetaan...'));
      return;
    }

    setSubmitting(true);
    setError("");

    return (
      <>
        <SiteHeader />
        <main className="min-h-[60vh]">
          {/* ...existing code... */}
          <button
            type="button"
            disabled={!canConfirm || submitting}
            onClick={confirmAndPay}
            className="..."
          >
            {t('checkout.confirm_and_pay', 'Vahvista tilaus ja siirry maksuun')}
          </button>
          {/* ...existing code... */}
        </main>
        <SiteFooter />
      </>
      if (!orderResponse.ok || !result.ok || !result.paymentUrl) {
        setSubmitting(false);
        setError(result.error ?? "Tilauksen vahvistus epaonnistui. Yrita uudelleen.");
        return;
      }

      window.sessionStorage.removeItem(ORDER_DRAFT_STORAGE_KEY);
      window.location.assign(result.paymentUrl);
    } catch {
      setSubmitting(false);
      setError("Maksuun siirtyminen epaonnistui. Yrita uudelleen.");
    }
  };

  if (typeof window === "undefined") return null;

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-slate-900">
      <SiteHeader opaque noShadow />

      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600">Kassa</p>
          <p className="mt-3 inline-flex w-fit px-0 py-0 text-[11px] font-semibold text-slate-900">
            Vaihe 2/2: Tarkistus ja maksu
          </p>
          {success ? (
            <>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Maksu onnistui!</h1>
              <p className="mt-2 text-sm text-slate-600">Kiitos tilauksestasi. Olemme vastaanottaneet maksun ja käsittelemme tilauksesi pian.</p>
              <div className="mt-6 flex justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-base font-bold text-white transition hover:bg-blue-600"
                >
                  Palaa etusivulle
                </Link>
              </div>
            </>
          ) : cancel ? (
            <>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-rose-700">Maksu peruutettu</h1>
              <p className="mt-2 text-sm text-rose-600">Maksua ei suoritettu loppuun. Voit yrittää maksua uudelleen tai palata etusivulle.</p>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  href="/kassa"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-base font-bold text-white transition hover:bg-blue-600"
                >
                  Yritä maksua uudelleen
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-base font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  Palaa etusivulle
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Tarkista tilaus ennen maksua</h1>
              <p className="mt-2 text-sm text-slate-600">
                Tarkista tiedot, vahvista tilaus ja siirry MobilePay-maksuun.
              </p>

              {draft ? (
                <div className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                  <p><span className="font-semibold">Palvelu:</span> {draft.serviceType}</p>
                  <p><span className="font-semibold">Nimi:</span> {draft.name}</p>
                  <p><span className="font-semibold">Puhelin:</span> {draft.phone}</p>
                  <p><span className="font-semibold">Sahkoposti:</span> {draft.email}</p>
                  <p><span className="font-semibold">Nouto-osoite:</span> {draft.pickupAddress}</p>
                  <p><span className="font-semibold">Toimitusosoite:</span> {draft.deliveryAddress}</p>
                  <p><span className="font-semibold">Lisatiedot:</span> {draft.message || "-"}</p>
                  {draft.bookingSelection ? (
                    <>
                      <p><span className="font-semibold">Varauspaiva:</span> {draft.bookingSelection.reservationDate}</p>
                      <p><span className="font-semibold">Saapumisaika kohteeseen:</span> {draft.bookingSelection.arrivalTime}</p>
                      <p><span className="font-semibold">Auton lahto Riihimaelta:</span> {draft.bookingSelection.riihimakiDepartureTime}</p>
                    </>
                  ) : null}

                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">Maksettava summa</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{formatEuro(draft.estimatedPriceVatIncl)}</p>
                    <p className="mt-1 text-sm text-slate-700">Yritys (ALV 0 %): {formatEuro(draft.estimatedPriceVat0)}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Tilausluonnosta ei loytynyt. Palaa takaisin laskurille ja aloita tilaus uudelleen.
                </div>
              )}

              <label className="mt-5 flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-blue-600"
                  disabled={!draft || submitting}
                />
                Hyvaksyn tilauksen, maksun ja sopimusehdot.
              </label>

              {error ? (
                <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </p>
              ) : null}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/#quote"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Takaisin vaiheeseen 1/2
                </Link>
                <button
                  type="button"
                  onClick={confirmAndPay}
                  disabled={!canConfirm || submitting}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Vahvistetaan..." : "Vahvista tilaus ja siirry maksuun"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
