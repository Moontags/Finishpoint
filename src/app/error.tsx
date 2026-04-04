"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("Root error boundary:", error);
    }
  }, [error]);

  return (
    <html lang="fi">
      <body className="bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-4 text-4xl">⚠️</div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900">
              Jotain meni pieleen
            </h1>
            <p className="mb-6 text-sm text-slate-600">
              Pahoittelemme häiriötä. Voit yrittää uudelleen tai palata etusivulle.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Yritä uudelleen
              </button>
              <Link
                href="/"
                className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Palaa etusivulle
              </Link>
            </div>
            {process.env.NODE_ENV !== "production" && error.digest && (
              <p className="mt-4 text-xs text-slate-400">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
