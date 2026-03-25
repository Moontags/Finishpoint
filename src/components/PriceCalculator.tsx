"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PriceSummary } from "@/components/PriceSummary";
import {
  ajoneuvohinta,
  kappaletavaraHinta,
  projektiHinta,
} from "@/lib/pricing";
import type { ProjektiTyyppi, ServiceCategory } from "@/lib/types";

const cardClass = "rounded-2xl border border-slate-200 bg-transparent p-5 shadow-sm sm:p-8";

function DistanceSlider({
  label,
  fieldName,
  value,
  onChange,
  max = 500,
}: {
  label: string;
  fieldName: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}) {
  const sliderId = `${fieldName}-range`;
  const numberId = `${fieldName}-value`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/5 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor={sliderId} className="text-[13px] font-semibold text-slate-700">{label}</label>
        <span className="inline-flex w-fit items-center rounded-lg border border-slate-200 bg-white/10 px-3 py-1 text-[13px] font-semibold text-slate-900">
          {value} km
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_110px] sm:items-center">
        <div>
          <input
            id={sliderId}
            name={sliderId}
            type="range"
            min={0}
            max={max}
            step={5}
            value={value}
            onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
          />
          <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-600">
            <span>0 km</span>
            <span>{max} km</span>
          </div>
        </div>

        <label htmlFor={numberId} className="sr-only">
          {label} kilometrit
        </label>
        <input
          id={numberId}
          name={numberId}
          type="number"
          min={0}
          max={max}
          value={value}
          onChange={(event) => onChange(Math.min(max, Math.max(0, Number(event.target.value) || 0)))}
          className="w-full rounded-xl border border-slate-200 bg-white/10 px-4 py-3 text-[14px] text-slate-900 shadow-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/15 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

export function AjoneuvoPriceCalculator() {
  const [km, setKm] = useState(60);
  const [monipysahdys, setMonipysahdys] = useState(false);

  const hinta = useMemo(() => ajoneuvohinta(km, monipysahdys), [km, monipysahdys]);

  return (
    <section className={cardClass}>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Ajoneuvokuljetukset
      </h2>
      <p className="mt-2 text-[14px] leading-7 text-slate-600 sm:text-[15px]">
        Moottoripyörät, mönkijät, ruohonleikkurit ja mopot. Kiinteä hinta 0-80 km, sen jälkeen 1,40 €/km.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <DistanceSlider label="Kokonaismatka" fieldName="ajoneuvo-kokonaismatka" value={km} onChange={setKm} />
        <label htmlFor="ajoneuvo-monipysahdys" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/5 px-4 py-3 text-[14px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-blue-300 hover:bg-white/10">
          <input
            id="ajoneuvo-monipysahdys"
            name="ajoneuvoMonipysahdys"
            type="checkbox"
            checked={monipysahdys}
            onChange={(event) => setMonipysahdys(event.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          Monipysahdysreitti (A-B-C-A)
        </label>
      </div>

      <PriceSummary hintaAlv0={hinta} label="Ajoneuvokuljetus" />
    </section>
  );
}

export function KappaletavaraPriceCalculator() {
  const [km, setKm] = useState(40);
  const [kerrosNouto, setKerrosNouto] = useState(0);
  const [kerrosToimitus, setKerrosToimitus] = useState(0);
  const [hissiton, setHissiton] = useState(false);
  const [pakkaus, setPakkaus] = useState(false);

  const laskelma = useMemo(
    () =>
      kappaletavaraHinta(
        km,
        kerrosNouto,
        kerrosToimitus,
        hissiton,
        pakkaus,
      ),
    [km, kerrosNouto, kerrosToimitus, hissiton, pakkaus],
  );

  return (
    <section className={cardClass}>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Kappaletavarakuljetukset
      </h2>
      <p className="mt-2 text-[14px] leading-7 text-slate-600 sm:text-[15px]">
        Pesukone, sohva ja sanky. Rappuslisa lasketaan molemmista paista.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <DistanceSlider label="Matka" fieldName="kappaletavara-matka" value={km} onChange={setKm} />
        <label htmlFor="kappaletavara-kerros-nouto" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
          Kerros noudossa
          <input
            id="kappaletavara-kerros-nouto"
            name="kappaletavaraKerrosNouto"
            type="number"
            min={0}
            value={kerrosNouto}
            onChange={(event) =>
              setKerrosNouto(Math.max(0, Number(event.target.value) || 0))
            }
            className="w-full rounded-xl border border-slate-200 bg-white/5 px-4 py-3 text-[14px] text-slate-900 shadow-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/10 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label htmlFor="kappaletavara-kerros-toimitus" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
          Kerros toimituksessa
          <input
            id="kappaletavara-kerros-toimitus"
            name="kappaletavaraKerrosToimitus"
            type="number"
            min={0}
            value={kerrosToimitus}
            onChange={(event) =>
              setKerrosToimitus(Math.max(0, Number(event.target.value) || 0))
            }
            className="w-full rounded-xl border border-slate-200 bg-white/5 px-4 py-3 text-[14px] text-slate-900 shadow-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/10 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <div className="grid gap-3">
          <label htmlFor="kappaletavara-hissiton" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/5 px-4 py-3 text-[14px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-blue-300 hover:bg-white/10">
            <input
              id="kappaletavara-hissiton"
              name="kappaletavaraHissiton"
              type="checkbox"
              checked={hissiton}
              onChange={(event) => setHissiton(event.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            Hissiton talo
          </label>
          <label htmlFor="kappaletavara-pakkaus" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/5 px-4 py-3 text-[14px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-blue-300 hover:bg-white/10">
            <input
              id="kappaletavara-pakkaus"
              name="kappaletavaraPakkaus"
              type="checkbox"
              checked={pakkaus}
              onChange={(event) => setPakkaus(event.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            Pakkausapu
          </label>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-[13px] text-slate-700">
        <p>Perushinta: {laskelma.perusHinta.toFixed(2)} €</p>
        <p>Lisat: {laskelma.lisat.toFixed(2)} €</p>
      </div>
      <PriceSummary hintaAlv0={laskelma.yhteensa} label="Kappaletavarakuljetus" />
    </section>
  );
}

export function ProjektiPriceCalculator() {
  const [tyyppi, setTyyppi] = useState<ProjektiTyyppi>("tunti");
  const [tunnit, setTunnit] = useState(4);
  const [lisakuormat, setLisakuormat] = useState(0);
  const [kierratysKm, setKierratysKm] = useState(20);
  const [kierratysMaksu, setKierratysMaksu] = useState(35);

  const hinta = useMemo(
    () => projektiHinta(tyyppi, tunnit, lisakuormat, kierratysKm, kierratysMaksu),
    [tyyppi, tunnit, lisakuormat, kierratysKm, kierratysMaksu],
  );

  return (
    <section className={cardClass}>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Projektikuljetukset
      </h2>
      <p className="mt-2 text-[14px] leading-7 text-slate-600 sm:text-[15px]">
        Muutot ja kierratys. Suuri muutto arvioidaan aina tarjouksena.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label htmlFor="projekti-tyyppi" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
          Palvelutyyppi
          <select
            id="projekti-tyyppi"
            name="projektiTyyppi"
            value={tyyppi}
            onChange={(event) => setTyyppi(event.target.value as ProjektiTyyppi)}
            className="w-full rounded-xl border border-slate-200 bg-white/5 px-4 py-3 text-[14px] text-slate-900 shadow-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/10 focus:ring-2 focus:ring-blue-100"
          >
            <option value="tunti">Tuntihinnoittelu</option>
            <option value="pieni_muutto">Pieni muutto (1-2 huonetta)</option>
            <option value="suuri_muutto">Suuri muutto (3+ huonetta)</option>
            <option value="kierratys_1">Kierratys, 1 kuorma</option>
            <option value="kierratys_lisa">Kierratys, lisakuormat</option>
          </select>
        </label>

        {tyyppi === "tunti" ? (
          <label htmlFor="projekti-tunnit" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            Tunnit
            <input
              id="projekti-tunnit"
              name="projektiTunnit"
              type="number"
              min={0}
              value={tunnit}
              onChange={(event) => setTunnit(Math.max(0, Number(event.target.value) || 0))}
              className="w-full rounded-xl border border-slate-200 bg-white/5 px-4 py-3 text-[14px] text-slate-900 shadow-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/10 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        ) : null}

        {tyyppi === "kierratys_lisa" ? (
          <label htmlFor="projekti-lisakuormat" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            Lisakuormat
            <input
              id="projekti-lisakuormat"
              name="projektiLisakuormat"
              type="number"
              min={0}
              value={lisakuormat}
              onChange={(event) =>
                setLisakuormat(Math.max(0, Number(event.target.value) || 0))
              }
              className="w-full rounded-xl border border-slate-200 bg-white/5 px-4 py-3 text-[14px] text-slate-900 shadow-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/10 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        ) : null}

        {(tyyppi === "kierratys_1" || tyyppi === "kierratys_lisa") ? (
          <DistanceSlider label="Kierratysreitin matka" fieldName="projekti-kierratysmatka" value={kierratysKm} onChange={setKierratysKm} max={300} />
        ) : null}

        {(tyyppi === "kierratys_1" || tyyppi === "kierratys_lisa") ? (
          <label htmlFor="projekti-kierratysmaksu" className="grid gap-1.5 text-[13px] font-semibold text-slate-700">
            Kierratysmaksu
            <select
              id="projekti-kierratysmaksu"
              name="projektiKierratysmaksu"
              value={kierratysMaksu}
              onChange={(event) => setKierratysMaksu(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white/5 px-4 py-3 text-[14px] text-slate-900 shadow-sm backdrop-blur-sm outline-none transition focus:border-blue-400 focus:bg-white/10 focus:ring-2 focus:ring-blue-100"
            >
              <option value={25}>Pieni kuorma - 25 €</option>
              <option value={35}>Normaalikuorma - 35 €</option>
              <option value={50}>Suuri kuorma - 50 €</option>
            </select>
          </label>
        ) : null}
      </div>

      {(tyyppi === "kierratys_1" || tyyppi === "kierratys_lisa") ? (
        <p className="mt-3 text-[13px] text-slate-700">
          Kierratyksen hinta muodostuu perusnoutohinnasta, kilometreista ja valitusta kierratysmaksusta.
        </p>
      ) : null}

      {hinta === null ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-[14px] text-amber-800">
          Suuri muutto hinnoitellaan tarjouksena, koska se vaatii useamman kuljetuskerran. Jata tarjouspyynto, niin palaamme nopeasti.
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
        <PriceSummary hintaAlv0={hinta} label="Projektikuljetus" />
      )}
    </section>
  );
}

export function PriceCalculator({ category }: { category: ServiceCategory }) {
  if (category === "ajoneuvo") return <AjoneuvoPriceCalculator />;
  if (category === "kappaletavara") return <KappaletavaraPriceCalculator />;
  return <ProjektiPriceCalculator />;
}
