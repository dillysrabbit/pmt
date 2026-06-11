"use client";

import { useProject } from "@/lib/store";
import {
  halfLabel,
  MONTHS,
  msStatus,
  phaseColor,
  todayHalf,
} from "@/lib/project";

export function Gantt() {
  const { structure, statusOf, openDetail } = useProject();
  const { phases, tas, aps, milestones } = structure;
  const today = todayHalf();

  return (
    <div className="card">
      <h3>Zeitplan Mai 2026 – Januar 2027</h3>
      <div className="gantt-wrap">
        <div className="gantt">
          <div className="g-hrow">
            <div />
            {MONTHS.map((m, i) => (
              <div
                key={m}
                className="g-month"
                style={{ gridColumn: `${2 + i * 2} / span 2` }}
              >
                {m}
              </div>
            ))}
          </div>

          {tas.map((ta) => {
            const color = phaseColor(phases, ta.phase_id);
            return (
              <div key={ta.id}>
                <div className="g-ta">
                  <div className="lbl" style={{ color }}>
                    TA {ta.id} {ta.name}
                  </div>
                  {Array.from({ length: 18 }, (_, i) => (
                    <div
                      key={i}
                      className={`g-cell ${i % 2 === 0 ? "alt" : ""} ${
                        i === today ? "today" : ""
                      }`}
                      style={{ height: "100%" }}
                    />
                  ))}
                </div>
                {aps
                  .filter((a) => a.ta_id === ta.id)
                  .map((a) => {
                    const s = statusOf(a.id);
                    return (
                      <div
                        key={a.id}
                        className="g-ap"
                        onClick={() => openDetail(a.id)}
                      >
                        <div className="lbl">
                          {a.id} {a.title}
                        </div>
                        {Array.from({ length: 18 }, (_, i) => {
                          const inBar = i >= a.start_half && i <= a.end_half;
                          let bar = null;
                          if (inBar) {
                            const bg =
                              s === "erledigt"
                                ? color
                                : s === "laufend"
                                  ? color + "99"
                                  : color + "44";
                            const br =
                              i === a.start_half && i === a.end_half
                                ? "3px"
                                : i === a.start_half
                                  ? "3px 0 0 3px"
                                  : i === a.end_half
                                    ? "0 3px 3px 0"
                                    : "0";
                            bar = (
                              <div
                                className="g-bar"
                                style={{ background: bg, borderRadius: br }}
                              >
                                {s === "erledigt" && i === a.end_half
                                  ? "✓"
                                  : ""}
                              </div>
                            );
                          }
                          return (
                            <div
                              key={i}
                              className={`g-cell ${i % 2 === 0 ? "alt" : ""} ${
                                i === today ? "today" : ""
                              }`}
                            >
                              {bar}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
              </div>
            );
          })}

          <div className="g-msrow">
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#D97706",
                padding: 4,
              }}
            >
              MEILENSTEINE
            </div>
            {Array.from({ length: 18 }, (_, i) => {
              const ms = milestones.find((x) => x.due_half === i);
              return (
                <div
                  key={i}
                  className={`g-cell ${i % 2 === 0 ? "alt" : ""}`}
                  style={{ height: 32 }}
                >
                  {ms && (
                    <div
                      className="g-diamond"
                      title={`${ms.id}: ${ms.title}`}
                      style={{
                        background: msStatus(ms, statusOf, today).color,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="g-legend">
            ▮ kräftig = erledigt · ▮ mittel = in Arbeit · ▮ blass = offen ·
            rote Spalte = aktueller Halbmonat (
            {today >= 0 && today < 18 ? halfLabel(today) : "außerhalb Laufzeit"}
            )
          </div>
        </div>
      </div>
    </div>
  );
}
