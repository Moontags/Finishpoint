export function LoadingSpinner({ message = "Ladataan..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
        <p className="text-sm text-zinc-400">{message}</p>
      </div>
    </div>
  );
}
