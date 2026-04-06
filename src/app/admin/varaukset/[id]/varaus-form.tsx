"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveVarausAction, deleteVarausAction } from "./actions";
import { Toast, useToast } from "@/components/ui/toast";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Varaus } from "@/lib/varaukset";
import type { ActionResult } from "@/lib/admin-action";

const initial: ActionResult = { error: null };

export function VarausForm({ id, varaus }: { id: string; varaus: Varaus | null }) {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [saveState, saveAction] = useFormState(saveVarausAction, initial);
  const [delState, deleteAction] = useFormState(deleteVarausAction, initial);

  useEffect(() => {
    if (saveState.success) {
      showToast(id === "new" ? "Varaus lisätty!" : "Muutokset tallennettu!", "success");
      setTimeout(() => router.push("/admin"), 1200);
    } else if (saveState.error) {
      showToast(`Virhe: ${saveState.error}`, "error");
    }
  }, [saveState]);

  useEffect(() => {
    if (delState.success) {
      showToast("Varaus poistettu.", "success");
      setTimeout(() => router.push("/admin"), 1000);
    } else if (delState.error) {
      showToast(`Poisto epäonnistui: ${delState.error}`, "error");
    }
  }, [delState]);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <form
        action={saveAction}
        className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 space-y-4"
      >
        <input type="hidden" name="id" value={id} />

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Asiakkaan nimi</label>
          <input
            type="text"
            name="asiakas_nimi"
            defaultValue={varaus?.asiakas_nimi || ""}
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Sähköposti *</label>
            <input
              type="email"
              name="asiakas_email"
              defaultValue={varaus?.asiakas_email || ""}
              required
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Puhelin</label>
            <input
              type="tel"
              name="asiakas_puhelin"
              defaultValue={varaus?.asiakas_puhelin || ""}
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Palvelun tyyppi *</label>
          <select
            name="palvelutyyppi"
            defaultValue={varaus?.palvelutyyppi || ""}
            required
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
          >
            <option value="">Valitse...</option>
            <option value="Ajoneuvokuljetukset">Ajoneuvokuljetukset</option>
            <option value="Kappaletavara">Kappaletavara</option>
            <option value="Muutot ja kierrätys">Muutot ja kierrätys</option>
            <option value="Muu kuljetus">Muu kuljetus</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Mistä (osoite) *</label>
          <input
            type="text"
            name="lahto_osoite"
            defaultValue={varaus?.lahto_osoite || ""}
            required
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Minne (osoite) *</label>
          <input
            type="text"
            name="kohde_osoite"
            defaultValue={varaus?.kohde_osoite || ""}
            required
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Päivämäärä *</label>
            <input
              type="date"
              name="varaus_pvm"
              defaultValue={varaus?.varaus_pvm || ""}
              required
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Aloitusaika *</label>
            <input
              type="time"
              name="aloitusaika"
              defaultValue={varaus?.aloitusaika || ""}
              required
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Lopetusaika *</label>
            <input
              type="time"
              name="lopetusaika"
              defaultValue={varaus?.lopetusaika || ""}
              required
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Hinta (sis. ALV) €</label>
            <input
              type="number"
              step="0.01"
              name="hinta_alv"
              defaultValue={varaus?.hinta_alv || ""}
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Hinta (ALV 0%) €</label>
            <input
              type="number"
              step="0.01"
              name="hinta_alv0"
              defaultValue={varaus?.hinta_alv0 || ""}
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Tila *</label>
          <select
            name="status"
            defaultValue={varaus?.status || "vahvistettu"}
            className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
          >
            <option value="vahvistettu">Vahvistettu</option>
            <option value="peruttu">Peruttu</option>
            <option value="valmis">Valmis</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <SubmitButton
            pendingText="Tallennetaan..."
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded font-medium transition"
          >
            {id === "new" ? "Luo varaus" : "Tallenna muutokset"}
          </SubmitButton>
          <Link
            href="/admin"
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded font-medium transition"
          >
            Peruuta
          </Link>
        </div>
      </form>

      {id !== "new" && (
        <form action={deleteAction} className="mt-4">
          <input type="hidden" name="id" value={id} />
          <SubmitButton
            pendingText="Poistetaan..."
            className="bg-red-700 hover:bg-red-600 disabled:opacity-60 text-white px-4 py-2 rounded font-medium transition"
          >
            Poista varaus
          </SubmitButton>
        </form>
      )}
    </>
  );
}
