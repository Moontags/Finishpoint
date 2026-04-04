"use client";

import { deleteVarausAction } from "../varaukset/[id]/actions";

export function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!confirm("Oletko varma että haluat poistaa tämän varauksen?")) {
      return;
    }
    try {
      const formData = new FormData();
      formData.set("id", id);
      await deleteVarausAction(formData);
    } catch (error) {
      alert(
        "Virhe poistamisessa: " +
          (error instanceof Error ? error.message : "Tuntematon virhe")
      );
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-300 text-xs font-medium"
    >
      Poista
    </button>
  );
}
