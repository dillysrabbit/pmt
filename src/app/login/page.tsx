"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.2 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signInWithGoogle() {
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    if (error) {
      setError(
        "Google-Anmeldung derzeit nicht möglich. Bitte später erneut versuchen."
      );
    }
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setBusy(false);
    if (error) {
      setError(
        error.message.toLowerCase().includes("signup")
          ? "Diese E-Mail-Adresse ist nicht freigeschaltet. Bitte an die Projektleitung wenden."
          : "Login-Link konnte nicht gesendet werden. Bitte später erneut versuchen."
      );
    } else {
      setSent(true);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="hd-eyebrow">Projektsteuerung</div>
        <div style={{ fontSize: 20, fontWeight: 600, margin: "4px 0 4px" }}>
          Strukturierte Dienstübergaben
        </div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 18 }}>
          Maria-Hötte-Stift · Mai 2026 – Januar 2027
        </div>

        <button className="google-btn" onClick={signInWithGoogle}>
          <GoogleIcon />
          Mit Google anmelden
        </button>

        <div className="login-divider">
          <span>oder per E-Mail-Link</span>
        </div>

        {sent ? (
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>
            <b>Login-Link gesendet ✓</b>
            <br />
            Bitte das Postfach von <b>{email}</b> öffnen und auf den Link
            klicken. Der Link ist kurze Zeit gültig.
          </div>
        ) : (
          <form onSubmit={sendLink}>
            <label className="mo-lbl" htmlFor="email">
              E-Mail-Adresse
            </label>
            <input
              id="email"
              type="email"
              required
              className="inp"
              style={{ width: "100%", marginTop: 6, minHeight: 40 }}
              placeholder="name@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="login-btn" type="submit" disabled={busy}>
              {busy ? "Wird gesendet…" : "Login-Link anfordern"}
            </button>
          </form>
        )}

        {error && (
          <div
            style={{
              color: "#CC0000",
              fontSize: 12,
              marginTop: 10,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}
        <div style={{ fontSize: 11, color: "#999", marginTop: 14 }}>
          Zugang nur für freigeschaltete Nutzer. Die Freischaltung übernimmt
          die Projektleitung.
        </div>
      </div>
    </div>
  );
}
