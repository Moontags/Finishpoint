"use client";

export function DeleteButton({
  id,
  action,
}: {
  id: string;
  action: (id: string) => Promise<void>;
}) {
  async function handleDelete() {
    if (!confirm("Oletko varma?")) return;
    try {
      await action(id);
    } catch (error) {
      alert("Virhe poistamisessa");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-300 text-sm font-medium"
    >
      Poista
    </button>
  );
}
