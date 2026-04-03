"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const OTP_COOLDOWN_SECONDS = 60;
const OTP_LAST_SENT_KEY = "finishpoint_admin_otp_last_sent";

function getRemainingCooldownSeconds() {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = window.localStorage.getItem(OTP_LAST_SENT_KEY);
  if (!raw) {
    return 0;
  }

  const lastSent = Number(raw);
  if (!Number.isFinite(lastSent)) {
    return 0;
  }

  const elapsedSeconds = Math.floor((Date.now() - lastSent) / 1000);
  return Math.max(0, OTP_COOLDOWN_SECONDS - elapsedSeconds);
}

export default function AdminLoginPageClient({ errorMessage }: { errorMessage?: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(() =>
    getRemainingCooldownSeconds()
  );

  useEffect(() => {
    const supabase = createClient();

    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      if (data.session?.user) {
        router.replace("/admin");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace("/admin");
      }
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCooldownSeconds(getRemainingCooldownSeconds());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cooldownSeconds > 0) {
      setError(`Odota ${cooldownSeconds} s ennen uuden kirjautumislinkin lähetystä.`);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/admin/auth/callback`
            : "/admin/auth/callback",
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("rate limit")) {
        setError("Liian monta pyyntöä. Odota hetki ja yritä uudelleen.");
      } else {
        setError(authError.message);
      }
    } else {
      setSent(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(OTP_LAST_SENT_KEY, String(Date.now()));
      }
      setCooldownSeconds(OTP_COOLDOWN_SECONDS);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-xl font-bold text-slate-800 mb-1">
          Finishpoint Admin
        </h1>
        <p className="text-sm text-slate-500 mb-6">Kirjaudu sähköpostilinkin avulla</p>

        {sent && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
            Kirjautumislinkki lähetetty osoitteeseen <strong>{email}</strong>.
            return (
              <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
                  <h1 className="text-xl font-bold text-slate-800 mb-1">
                    Finishpoint Admin
                  </h1>
                  <p className="text-sm text-slate-500 mb-6">Kirjaudu sähköpostilinkin avulla</p>

                  {/* Virhebanneri lomakkeen yläpuolelle */}
                  {errorMessage && (
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 8,
                      padding: '12px 16px',
                      marginBottom: 16,
                      color: '#991b1b',
                      fontSize: 14,
                    }}>
                      {errorMessage}
                    </div>
                  )}

                  {sent && (
                    <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                      Kirjautumislinkki lähetetty osoitteeseen <strong>{email}</strong>.
                      Tarkista sähköpostisi.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Sähköpostiosoite
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="sinun@email.fi"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}
                    {cooldownSeconds > 0 && (
                      <p className="text-xs text-slate-500">
                        Uusi lähetys mahdollista {cooldownSeconds} s kuluttua.
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={loading || cooldownSeconds > 0}
                      className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 text-sm transition-colors"
                    >
                      {loading
                        ? "Lähetetään..."
                        : cooldownSeconds > 0
                        ? `Odota ${cooldownSeconds} s`
                        : "Lähetä kirjautumislinkki"}
                    </button>
                  </form>
                </div>
              </div>
            );
      </div>
    </div>
  );
}
