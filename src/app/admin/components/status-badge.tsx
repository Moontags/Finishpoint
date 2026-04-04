export function StatusBadge({ status }: { status: string }) {
  const styles: Record<
    string,
    { bg: string; text: string; label: string }
  > = {
    // Englanti (legacy)
    new: {
      bg: "bg-blue-900/30",
      text: "text-blue-300",
      label: "Uusi",
    },
    pending: {
      bg: "bg-blue-900/30",
      text: "text-blue-300",
      label: "Odottaa",
    },
    confirmed: {
      bg: "bg-green-900/30",
      text: "text-green-300",
      label: "Vahvistettu",
    },
    completed: {
      bg: "bg-gray-900/30",
      text: "text-gray-300",
      label: "Valmis",
    },
    cancelled: {
      bg: "bg-red-900/30",
      text: "text-red-300",
      label: "Peruutettu",
    },
    // Suomi (uusi)
    vahvistettu: {
      bg: "bg-green-900/30",
      text: "text-green-300",
      label: "Vahvistettu",
    },
    valmis: {
      bg: "bg-gray-900/30",
      text: "text-gray-300",
      label: "Valmis",
    },
    peruttu: {
      bg: "bg-red-900/30",
      text: "text-red-300",
      label: "Peruttu",
    },
  };

  const style = styles[status] || styles.pending;

  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}
