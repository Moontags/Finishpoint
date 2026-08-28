"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { AddressAutocompleteField, inputClass } from "@/components/form-fields";
import { INVALID_EMAIL_MESSAGE, isValidEmail } from "@/lib/email-validation";
import { useLanguage } from "@/lib/LanguageContext";
import { services } from "@/lib/services";

// Kierrätyksellä on oma tarjouspyyntölomake, koska kysytyt tiedot ovat eri kuin
// kuljetuksissa (ei toimitusosoitetta, mutta jätekuvaus ja arvioitu määrä).
// Lähetys menee samaan /api/quote-reittiin, joten SMTP ja tallennus ovat yhteiset.
const SERVICE_TYPE = services.kierratys.navLabel;

const amountOptions = [
  { value: "Puolikas kuorma", labelKey: "kierratys.form.amount_half" },
  { value: "Täysi pakettiauto", labelKey: "kierratys.form.amount_full" },
  { value: "Useampi kuorma", labelKey: "kierratys.form.amount_multiple" },
] as const;

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  pickupAddress: "",
  wasteDescription: "",
  amount: amountOptions[1].value as string,
  preferredTime: "",
  message: "",
};

export function KierratysQuoteForm() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const emailIsValid = isValidEmail(formData.email);
  const showEmailError = emailTouched && formData.email.trim().length > 0 && !emailIsValid;

  useEffect(() => {
    if ((status !== "success" && status !== "error") || !feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback("");
      setStatus("idle");
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [status, feedback]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(formData.email)) {
      setStatus("error");
      setFeedback(t("form.error_invalid_email", INVALID_EMAIL_MESSAGE));
      return;
    }

    setStatus("loading");
    setFeedback("");

    try {
      // Kierrätyksen omat kentät kootaan viestikenttään, jotta ne välittyvät
      // sellaisenaan kuljetus@pakuvie.fi-osoitteeseen ilman muutoksia
      // /api/quote-reitin sopimukseen.
      const messageLines = [
        `Jätteen/tavaran kuvaus: ${formData.wasteDescription}`,
        `Arvioitu määrä: ${formData.amount}`,
        `Toivottu ajankohta: ${formData.preferredTime}`,
        formData.message ? `Vapaa viesti: ${formData.message}` : "",
      ].filter(Boolean);

      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          serviceType: SERVICE_TYPE,
          addresses: `Nouto: ${formData.pickupAddress}`,
          message: messageLines.join("\n"),
        }),
      });

      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setStatus("error");
        setFeedback(result.error ?? t("form.error_send", "Lähetys epäonnistui. Yritä uudelleen."));
        return;
      }

      setStatus("success");
      setFeedback(t("form.success", "Tarjouspyyntö lähetettiin onnistuneesti."));
      setEmailTouched(false);
      setFormData(emptyForm);
    } catch {
      setStatus("error");
      setFeedback(
        t("form.error_server", "Palvelin ei vastannut. Tarkista yhteys ja yritä uudelleen."),
      );
    }
  };

  return (
    <section
      id="quote"
      className="grid gap-8 rounded-2xl border border-slate-300 bg-white/30 p-5 shadow-sm backdrop-blur-sm sm:p-8 lg:grid-cols-[0.9fr_1.1fr]"
    >
      {/* Vasen – info */}
      <div className="space-y-4">
        <div className="inline-flex max-w-full items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.18em] text-blue-700 sm:text-[15px]">
          <Mail className="h-4 w-4 text-blue-700" />
          <span>{t("kierratys.form.eyebrow", "Pyydä tarjous kierrätyksestä")}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t("kierratys.form.title", "Kerro meille mitä viedään")}
        </h2>
        <p className="max-w-xl text-[14px] leading-[1.75] text-slate-700 sm:text-base">
          {t(
            "kierratys.form.intro",
            "Täytä lomake, niin vahvistamme noutoajan ja lähetämme ohjeet jätemaksun maksamiseen. Vastaamme yleensä saman päivän aikana.",
          )}
        </p>

        <div className="space-y-2.5 pt-2">
          {[t("form.response_same_day", "Vastaamme saman päivän aikana")].map((line) => (
            <div key={line} className="flex items-start gap-2 text-[13px] text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Oikea – lomake */}
      <form className="grid w-full gap-4" data-testid="kierratys-form" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label
            htmlFor="kierratys-name"
            className="grid gap-1.5 text-[13px] font-semibold text-slate-700"
          >
            {t("form.name", "Nimi")}
            <input
              id="kierratys-name"
              name="name"
              required
              autoComplete="name"
              data-testid="kierratys-name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
          <label
            htmlFor="kierratys-phone"
            className="grid gap-1.5 text-[13px] font-semibold text-slate-700"
          >
            {t("form.phone", "Puhelin")}
            <input
              id="kierratys-phone"
              name="phone"
              required
              type="tel"
              autoComplete="tel"
              data-testid="kierratys-phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label
            htmlFor="kierratys-email"
            className="grid gap-1.5 text-[13px] font-semibold text-slate-700"
          >
            {t("form.email", "Sähköposti")}
            <input
              id="kierratys-email"
              name="email"
              required
              type="email"
              autoComplete="email"
              data-testid="kierratys-email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => setEmailTouched(true)}
              aria-invalid={showEmailError}
              aria-describedby={showEmailError ? "kierratys-email-error" : undefined}
              className={`${inputClass}${
                showEmailError
                  ? " border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                  : ""
              }`}
            />
            {showEmailError ? (
              <span
                id="kierratys-email-error"
                data-testid="kierratys-email-error"
                className="text-[12px] font-medium text-rose-600"
              >
                {t("form.error_invalid_email", INVALID_EMAIL_MESSAGE)}
              </span>
            ) : null}
          </label>

          <AddressAutocompleteField
            id="kierratys-pickup-address"
            name="pickupAddress"
            label={t("kierratys.form.pickup_address", "Nouto-osoite")}
            value={formData.pickupAddress}
            onChange={(pickupAddress) =>
              setFormData((current) => ({ ...current, pickupAddress }))
            }
            placeholder={t("form.address_placeholder", "Katuosoite, kaupunki")}
          />
        </div>

        <label
          htmlFor="kierratys-waste-description"
          className="grid gap-1.5 text-[13px] font-semibold text-slate-700"
        >
          {t("kierratys.form.waste_description", "Jätteen tai tavaran kuvaus")}
          <textarea
            id="kierratys-waste-description"
            name="wasteDescription"
            required
            rows={3}
            data-testid="kierratys-waste-description"
            value={formData.wasteDescription}
            onChange={handleChange}
            placeholder={t(
              "kierratys.form.waste_placeholder",
              "Esim. vintin tyhjennys: vanhoja huonekaluja, pahvia ja sekajätettä",
            )}
            className={inputClass}
          />
        </label>

        <fieldset className="grid gap-2">
          <legend className="pb-1.5 text-[13px] font-semibold text-slate-700">
            {t("kierratys.form.amount", "Arvioitu määrä")}
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {amountOptions.map(({ value, labelKey }) => {
              const selected = formData.amount === value;
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-center text-[13px] font-bold transition ${
                    selected
                      ? "border-blue-500 bg-white/60 text-slate-900 ring-[3px] ring-blue-200"
                      : "border-slate-400 bg-white/30 text-slate-700 hover:bg-white/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="amount"
                    value={value}
                    checked={selected}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {t(labelKey, value)}
                </label>
              );
            })}
          </div>
        </fieldset>

        <label
          htmlFor="kierratys-preferred-time"
          className="grid gap-1.5 text-[13px] font-semibold text-slate-700"
        >
          {t("kierratys.form.preferred_time", "Toivottu ajankohta")}
          <input
            id="kierratys-preferred-time"
            name="preferredTime"
            required
            data-testid="kierratys-preferred-time"
            value={formData.preferredTime}
            onChange={handleChange}
            placeholder={t("kierratys.form.time_placeholder", "Esim. ensi viikon alussa tai 12.9.")}
            className={inputClass}
          />
        </label>

        <label
          htmlFor="kierratys-message"
          className="grid gap-1.5 text-[13px] font-semibold text-slate-700"
        >
          {t("kierratys.form.free_message", "Vapaa viesti")}
          <textarea
            id="kierratys-message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          data-testid="kierratys-submit"
          disabled={status === "loading" || !emailIsValid}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-[0.5px] border-slate-400 bg-white/30 px-6 py-3.5 text-sm font-bold text-slate-900 backdrop-blur-sm transition duration-200 hover:bg-white/60 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading"
            ? t("form.sending", "Lähetetään...")
            : t("form.send_quote", "Lähetä tarjouspyyntö")}
          <ArrowUpRight className="h-4 w-4" />
        </button>

        {feedback ? (
          <p
            data-testid="kierratys-feedback"
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
    </section>
  );
}
