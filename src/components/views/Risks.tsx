"use client";

import { useState } from "react";
import { useProject } from "@/lib/store";
import { RED } from "@/lib/project";
import type { Severity } from "@/lib/types";

export function Risks() {
  const { risks, addRisk, toggleRisk, deleteRisk } = useProject();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<Severity>("mittel");
  const [measure, setMeasure] = useState("");

  function submit() {
    if (!title.trim()) return;
    addRisk(title.trim(), severity, measure.trim());
    setTitle("");
    setMeasure("");
    setSeverity("mittel");
  }

  return (
    <>
      <div className="card">
        <h3>Neues Risiko erfassen</h3>
        <div className="rk-form">
          <input
            className="inp"
            placeholder="Risiko beschreiben (z. B. 'Azubi-Ausfall durch Prüfungsphase')"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="rk-row2">
            <select
              className="inp"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
            >
              <option value="niedrig">Niedrig</option>
              <option value="mittel">Mittel</option>
              <option value="hoch">Hoch</option>
            </select>
            <input
              className="inp"
              style={{ flex: 1, minWidth: 180 }}
              placeholder="Gegenmaßnahme"
              value={measure}
              onChange={(e) => setMeasure(e.target.value)}
            />
            <button className="rk-add" onClick={submit}>
              Hinzufügen
            </button>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Risikoregister ({risks.length})</h3>
        {risks.length ? (
          risks.map((r) => {
            const c =
              r.severity === "hoch"
                ? RED
                : r.severity === "mittel"
                  ? "#F59E0B"
                  : "#16A34A";
            return (
              <div
                key={r.id}
                className={`rk-item ${r.status === "entschärft" ? "muted" : ""}`}
              >
                <span className="rk-sev" style={{ background: c }}>
                  {r.severity}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className={`rk-title ${
                      r.status === "entschärft" ? "done" : ""
                    }`}
                  >
                    {r.title}
                  </div>
                  {r.measure && (
                    <div className="rk-measure">→ {r.measure}</div>
                  )}
                </div>
                <span style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button className="rk-btn" onClick={() => toggleRisk(r.id)}>
                    {r.status === "offen" ? "Entschärfen" : "Reaktivieren"}
                  </button>
                  <button
                    className="rk-btn"
                    style={{ color: RED }}
                    onClick={() => deleteRisk(r.id)}
                  >
                    ✕
                  </button>
                </span>
              </div>
            );
          })
        ) : (
          <div className="empty">Noch keine Risiken erfasst.</div>
        )}
      </div>
    </>
  );
}
