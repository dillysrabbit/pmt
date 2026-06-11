"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
              Kein Passwort nötig – Sie erhalten einen Anmelde-Link per E-Mail.
              Zugang nur für eingeladene Nutzer.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
