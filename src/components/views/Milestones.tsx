"use client";

import { useProject } from "@/lib/store";
import { msStatus, STATUS, todayHalf } from "@/lib/project";

export function Milestones() {
  const { structure, statusOf, openDetail } = useProject();
  const { aps, milestones } = structure;
  const today = todayHalf();

  return (
    <>
      {milestones.map((m) => {
        const s = msStatus(m, statusOf, today);
        const done = m.deps.filter((d) => statusOf(d) === "erledigt").length;
        return (
          <div key={m.id} className="msv-card">
            <div className="msv-head">
              <div>
                <div className="msv-title">
                  <span className="msv-dia" style={{ background: s.color }} />
                  {m.id} · {m.title}
                </div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  Fällig: {m.due_label}
                </div>
              </div>
              <span className="msv-badge" style={{ background: s.color }}>
                {s.label}
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>
                Kriterium: {done}/{m.deps.length} verknüpfte Arbeitspakete
                erledigt
              </div>
              <div className="pbar" style={{ height: 6, marginBottom: 10 }}>
                <div
                  style={{
                    width: `${(done / m.deps.length) * 100}%`,
                    background: s.color,
                  }}
                />
              </div>
              {m.deps.map((d) => {
                const ap = aps.find((a) => a.id === d);
                const sd = statusOf(d);
                return (
                  <div
                    key={d}
                    className="msv-dep"
                    onClick={() => openDetail(d)}
                  >
                    <span
                      className="msv-circ"
                      style={{
                        borderColor: STATUS[sd].color,
                        background:
                          sd === "erledigt" ? STATUS[sd].color : "transparent",
                      }}
                    >
                      {sd === "erledigt" ? "✓" : ""}
                    </span>
                    <span
                      style={{
                        color: sd === "erledigt" ? "#999" : "#333",
                        textDecoration:
                          sd === "erledigt" ? "line-through" : undefined,
                      }}
                    >
                      AP {d} · {ap?.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
