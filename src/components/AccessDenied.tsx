"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AccessDenied({ email }: { email: string }) {
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="hd-eyebrow">Projektsteuerung</div>
        <div style={{ fontSize: 20, fontWeight: 600, margin: "4px 0 14px" }}>
          Kein Zugang
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: "#555" }}>
          Die Anmeldung mit <b>{email}</b> war erfolgreich, aber diese Adresse
          ist noch nicht für das Projekt freigeschaltet. Bitte an die
          Projektleitung (Stv. PDL) wenden.
        </div>
        <button className="login-btn" onClick={signOut}>
          Abmelden
        </button>
      </div>
    </div>
  );
}
