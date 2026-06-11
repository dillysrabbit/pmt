"use client";

import { useState } from "react";
import { useProject } from "@/lib/store";
import {
  halfLabel,
  ORDER,
  phaseColor,
  phaseOf,
  STATUS,
  todayHalf,
} from "@/lib/project";

export function Board() {
  const { structure, statusOf, setStatus, openDetail } = useProject();
  const { phases, tas, aps } = structure;
  const [kbPhase, setKbPhase] = useState(0);
  const today = todayHalf();

  return (
    <>
      <div className="chips">
        <button
          className={`chip ${kbPhase === 0 ? "active" : ""}`}
          style={kbPhase === 0 ? { background: "#1A1A1A" } : undefined}
          onClick={() => setKbPhase(0)}
        >
          Alle Phasen
        </button>
        {phases.map((p) => (
          <button
            key={p.id}
            className={`chip ${kbPhase === p.id ? "active" : ""}`}
            style={kbPhase === p.id ? { background: p.color } : undefined}
            onClick={() => setKbPhase(p.id)}
          >
            Phase {p.id}
          </button>
        ))}
      </div>
      <div className="kb-grid">
        {ORDER.map((s) => {
          const cards = aps.filter(
            (a) =>
              statusOf(a.id) === s &&
              (kbPhase === 0 || phaseOf(a, tas) === kbPhase)
          );
          const i = ORDER.indexOf(s);
          return (
            <div key={s} className="kb-col">
              <div className="kb-head">
                <span style={{ color: STATUS[s].color }}>
                  {STATUS[s].label}
                </span>
                <span style={{ color: "#888" }}>{cards.length}</span>
              </div>
              <div className="kb-cards">
                {cards.length ? (
                  cards.map((a) => {
                    const color = phaseColor(phases, phaseOf(a, tas));
                    const late = a.end_half < today && s !== "erledigt";
                    return (
                      <div
                        key={a.id}
                        className="kb-card"
                        style={{ borderLeft: `4px solid ${color}` }}
                        onClick={() => openDetail(a.id)}
                      >
                        <div className="kb-meta">
                          AP {a.id} · {a.responsible}
                        </div>
                        <div className="kb-title">{a.title}</div>
                        <div className="kb-foot">
                          <span className={`kb-due ${late ? "late" : ""}`}>
                            bis {halfLabel(a.end_half)}
                          </span>
                          <span onClick={(e) => e.stopPropagation()}>
                            {i > 0 && (
                              <button
                                className="kb-btn"
                                onClick={() => setStatus(a.id, ORDER[i - 1])}
                              >
                                ←
                              </button>
                            )}{" "}
                            {i < 2 && (
                              <button
                                className="kb-btn pri"
                                onClick={() => setStatus(a.id, ORDER[i + 1])}
                              >
                                →
                              </button>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      textAlign: "center",
                      padding: 16,
                    }}
                  >
                    leer
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
