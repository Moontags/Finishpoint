"use client";

import { Toast, useToast } from "@/components/ui/toast";

export function DeleteButton({
  id,
  action,
}: {
  id: string;
  action: (id: string) => Promise<void>;
}) {
  const { toast, showToast, hideToast } = useToast();

  async function handleDelete() {
    if (!confirm("Oletko varma?")) return;
    try {
      await action(id);
      showToast("Päivä poistettu.", "success");
    } catch {
      showToast("Poisto epäonnistui", "error");
    }
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
      <button
        onClick={handleDelete}
        className="text-red-400 hover:text-red-300 text-sm font-medium"
      >
        Poista
      </button>
    </>
  );
}
