"use client";

import { useTransition } from "react";
import { Toast, useToast } from "@/components/ui/toast";
import type { ActionResult } from "@/lib/admin-action";

export function DeleteDateButton({
  id,
  removeAction,
}: {
  id: string;
  removeAction: (id: string) => Promise<ActionResult>;
}) {
  const [isPending, startTransition] = useTransition();
  const { toast, showToast, hideToast } = useToast();

  function handleDelete() {
    if (!confirm("Poistetaanko suljettu päivä?")) return;
    startTransition(async () => {
      const result = await removeAction(id);
      if (result.error) {
        showToast(`Poisto epäonnistui: ${result.error}`, "error");
      } else {
        showToast("Päivä poistettu.", "success");
      }
    });
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-400 hover:text-red-300 disabled:opacity-40 text-sm font-medium transition"
      >
        {isPending ? "Poistetaan..." : "Poista"}
      </button>
    </>
  );
}
