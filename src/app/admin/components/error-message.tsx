export function ErrorMessage({
  title = "Virhe",
  message,
  onRetry
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-700 bg-red-900/20 p-6 text-center">
      <h3 className="mb-2 text-lg font-semibold text-red-400">{title}</h3>
      <p className="mb-4 text-sm text-zinc-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
        >
          Yritä uudelleen
        </button>
      )}
    </div>
  );
}
