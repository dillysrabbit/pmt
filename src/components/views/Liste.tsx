"use client";

import { useState } from "react";
import { useProject } from "@/lib/store";
import {
  halfLabel,
  ORDER,
  phaseColor,
  phaseOf,
  RESPONSIBLES,
  STATUS,
  todayHalf,
} from "@/lib/project";

export function Liste() {
  const { structure, statusOf, cycleStatus, openDetail } = useProject();
  const { phases, tas, aps } = structure;
  const [fSearch, setFSearch] = useState("");
  const [fPhase, setFPhase] = useState(0);
  const [fResp, setFResp] = useState("");
  const [fStatus, setFStatus] = useState("");
  const today = todayHalf();

  const list = aps.filter((a) => {
    if (fPhase && phaseOf(a, tas) !== fPhase) return false;
    if (fResp && a.responsible !== fResp) return false;
    if (fStatus && statusOf(a.id) !== fStatus) return false;
    if (
      fSearch &&
      !(
        a.title.toLowerCase().includes(fSearch.toLowerCase()) ||
        a.id.includes(fSearch)
      )
    )
      return false;
    return true;
  });

  return (
    <div className="card">
      <h3>Arbeitspakete ({list.length})</h3>
      <div className="filters">
        <input
          className="inp"
          placeholder="Suchen…"
          value={fSearch}
          onChange={(e) => setFSearch(e.target.value)}
        />
        <select
          className="inp"
          value={fPhase}
          onChange={(e) => setFPhase(Number(e.target.value))}
        >
          <option value={0}>Alle Phasen</option>
          {phases.map((p) => (
            <option key={p.id} value={p.id}>
              Phase {p.id}
            </option>
          ))}
        </select>
        <select
          className="inp"
          value={fResp}
          onChange={(e) => setFResp(e.target.value)}
        >
          <option value="">Alle Personen</option>
          {RESPONSIBLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          className="inp"
          value={fStatus}
          onChange={(e) => setFStatus(e.target.value)}
        >
          <option value="">Alle Status</option>
          {ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS[s].label}
            </option>
          ))}
        </select>
      </div>
      {list.length ? (
        list.map((a) => {
          const s = statusOf(a.id);
          const color = phaseColor(phases, phaseOf(a, tas));
          const late = a.end_half < today && s !== "erledigt";
          return (
            <div
              key={a.id}
              className="li-row"
              style={{ borderLeft: `4px solid ${color}` }}
            >
              <button
                className="li-circ"
                style={{
                  borderColor: STATUS[s].color,
                  background:
                    s === "erledigt" ? STATUS[s].color : "transparent",
                }}
                onClick={() => cycleStatus(a.id)}
                title="Status wechseln"
              >
                {s === "erledigt" ? "✓" : s === "laufend" ? "·" : ""}
              </button>
              <div className="li-main" onClick={() => openDetail(a.id)}>
                <div className={`li-title ${s === "erledigt" ? "done" : ""}`}>
                  <span
                    style={{ color: "#999", fontWeight: 600, fontSize: 11 }}
                  >
                    AP {a.id}
                  </span>{" "}
                  {a.title}
                </div>
                <div className={`li-sub ${late ? "late" : ""}`}>
                  {a.responsible} · {halfLabel(a.start_half)} –{" "}
                  {halfLabel(a.end_half)}
                  {late ? " · ÜBERFÄLLIG" : ""}
                </div>
              </div>
              <span className="li-st" style={{ color: STATUS[s].color }}>
                {STATUS[s].label}
              </span>
            </div>
          );
        })
      ) : (
        <div className="empty">Keine Treffer.</div>
      )}
    </div>
  );
}
