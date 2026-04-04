"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("Admin error boundary:", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#252525] px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-800/50 p-8 text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h1 className="mb-2 text-2xl font-bold text-zinc-100">
          Järjestelmävirhe
        </h1>
        <p className="mb-6 text-sm text-zinc-400">
          Admin-paneelissa tapahtui virhe. Voit yrittää uudelleen tai palata dashboardiin.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Yritä uudelleen
          </button>
          <Link
            href="/admin"
            className="rounded-xl border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-700"
          >
            Palaa dashboardiin
          </Link>
        </div>
        {process.env.NODE_ENV !== "production" && (
          <div className="mt-6 rounded-lg bg-zinc-900 p-4 text-left">
            <p className="text-xs font-mono text-red-400">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-zinc-500">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
