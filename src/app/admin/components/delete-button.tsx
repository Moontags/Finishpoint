"use client";

import { deleteBooking } from "../actions";

export function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!confirm("Oletko varma että haluat poistaa tämän keikat?")) {
      return;
    }
    try {
      await deleteBooking(id);
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
