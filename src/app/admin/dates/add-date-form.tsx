"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { addBlockedDate } from "./actions";
import { Toast, useToast } from "@/components/ui/toast";
import { SubmitButton } from "@/components/ui/submit-button";

type State = { error: string | null; success?: boolean };
const initial: State = { error: null };

export function AddDateForm() {
  const { toast, showToast, hideToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useFormState(addBlockedDate, initial);

  useEffect(() => {
    if (state.success) {
      showToast("Suljettu päivä lisätty!", "success");
      formRef.current?.reset();
    } else if (state.error) {
      showToast(`Virhe: ${state.error}`, "error");
    }
  }, [state]);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Päivämäärä *
            </label>
            <input
              type="date"
              name="date"
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Syy (valinnainen)
            </label>
            <input
              type="text"
              name="reason"
              placeholder="esim. loma, huolto"
              className="w-full bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
        <SubmitButton
          pendingText="Tallennetaan..."
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          Lisää suljettu päivä
        </SubmitButton>
      </form>
    </>
  );
}
