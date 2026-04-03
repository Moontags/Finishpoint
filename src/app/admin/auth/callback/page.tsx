"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";

export default function AdminAuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Vahvistetaan kirjautumista...");

  useEffect(() => {
    const supabase = createClient();

    async function handleAuthCallback() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type") as EmailOtpType | null;
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      let authError: string | null = null;

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          authError = error.message;
        }
      } else if (tokenHash && type && !authError) {
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash: tokenHash,
        });
        if (error) {
          authError = error.message;
        }
      } else if (accessToken && refreshToken && !authError) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          authError = error.message;
        }
      }

      if (authError) {
        setMessage("Kirjautuminen epäonnistui. Ohjataan takaisin...");
        router.replace("/admin/login?error=auth");
        return;
      }

      for (let i = 0; i < 5; i += 1) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          router.replace("/admin");
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      setMessage("Sessiota ei löytynyt. Ohjataan kirjautumiseen...");
      router.replace("/admin/login?error=auth");
    }

    void handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-lg font-bold text-slate-800 mb-2">Finishpoint Admin</h1>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}
