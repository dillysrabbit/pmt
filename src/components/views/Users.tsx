"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/lib/store";
import { RED } from "@/lib/project";
import type { AppUser } from "@/lib/types";

export function Users() {
  const { isAdmin, userEmail } = useProject();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    void createClient()
      .from("app_users")
      .select("*")
      .order("created_at")
      .then(({ data }) => setUsers((data ?? []) as AppUser[]));
  }, []);

  if (!isAdmin) {
    return (
      <div className="card">
        <h3>Nutzerverwaltung</h3>
        <div className="empty">Nur für Admins sichtbar.</div>
      </div>
    );
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) return;
    setMsg("");
    const { data, error } = await createClient()
      .from("app_users")
      .insert({ email: value, role })
      .select()
      .single();
    if (error) {
      setMsg(
        error.code === "23505"
          ? "Diese E-Mail-Adresse ist bereits freigeschaltet."
          : "Freischalten fehlgeschlagen."
      );
    } else if (data) {
      setUsers((u) => [...u, data as AppUser]);
      setEmail("");
      setRole("member");
    }
  }

  async function removeUser(target: string) {
    if (target === userEmail.toLowerCase()) {
      setMsg("Der eigene Zugang kann nicht entfernt werden.");
      return;
    }
    setMsg("");
    const { error } = await createClient()
      .from("app_users")
      .delete()
      .eq("email", target);
    if (error) {
      setMsg("Entfernen fehlgeschlagen.");
    } else {
      setUsers((u) => u.filter((x) => x.email !== target));
    }
  }

  async function toggleRole(target: AppUser) {
    if (target.email === userEmail.toLowerCase()) {
      setMsg("Die eigene Rolle kann nicht geändert werden.");
      return;
    }
    setMsg("");
    const newRole = target.role === "admin" ? "member" : "admin";
    const { error } = await createClient()
      .from("app_users")
      .update({ role: newRole })
      .eq("email", target.email);
    if (error) {
      setMsg("Rollenwechsel fehlgeschlagen.");
    } else {
      setUsers((u) =>
        u.map((x) => (x.email === target.email ? { ...x, role: newRole } : x))
      );
    }
  }

  return (
    <>
      <div className="card">
        <h3>Nutzer freischalten</h3>
        <form className="rk-form" onSubmit={addUser}>
          <div className="rk-row2">
            <input
              className="inp"
              type="email"
              required
              style={{ flex: 1, minWidth: 180 }}
              placeholder="name@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select
              className="inp"
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "member")}
            >
              <option value="member">Mitglied</option>
              <option value="admin">Admin</option>
            </select>
            <button className="rk-add" type="submit">
              Freischalten
            </button>
          </div>
        </form>
        <div style={{ fontSize: 11, color: "#999", marginTop: 10 }}>
          Freigeschaltete Personen melden sich anschließend selbst mit Google
          (oder per E-Mail-Link) an – eine separate Einladung ist nicht nötig.
        </div>
        {msg && (
          <div
            style={{ color: RED, fontSize: 12, marginTop: 8, fontWeight: 500 }}
          >
            {msg}
          </div>
        )}
      </div>
      <div className="card">
        <h3>Freigeschaltete Nutzer ({users.length})</h3>
        {users.map((u) => {
          const self = u.email === userEmail.toLowerCase();
          return (
            <div key={u.email} className="us-row">
              <span
                className="us-role"
                style={{ background: u.role === "admin" ? RED : "#9CA3AF" }}
              >
                {u.role === "admin" ? "Admin" : "Mitglied"}
              </span>
              <span className="us-mail">
                {u.email}
                {self && (
                  <span style={{ color: "#999", fontWeight: 400 }}> (du)</span>
                )}
              </span>
              {!self && (
                <span style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button className="rk-btn" onClick={() => toggleRole(u)}>
                    {u.role === "admin" ? "Zu Mitglied" : "Zu Admin"}
                  </button>
                  <button
                    className="rk-btn"
                    style={{ color: RED }}
                    onClick={() => removeUser(u.email)}
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
