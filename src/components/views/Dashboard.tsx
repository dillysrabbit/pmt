"use client";

import { useProject } from "@/lib/store";
import {
  halfLabel,
  msStatus,
  phaseProg,
  RED,
  STATUS,
  todayHalf,
  totals,
} from "@/lib/project";
import type { Ap } from "@/lib/types";

export function Dashboard() {
  const { structure, statusOf, openDetail } = useProject();
  const { phases, tas, aps, milestones } = structure;
  const today = todayHalf();
  const t = totals(aps, statusOf);
  const overdue = aps.filter(
    (a) => a.end_half < today && statusOf(a.id) !== "erledigt"
  );
  const soon = aps.filter(
    (a) =>
      a.end_half >= today &&
      a.end_half <= today + 1 &&
      statusOf(a.id) !== "erledigt"
  );

  function Mini({ ap, late }: { ap: Ap; late: boolean }) {
    return (
      <div className="mini" onClick={() => openDetail(ap.id)}>
        <span
          className="dot"
          style={{ background: late ? RED : STATUS[statusOf(ap.id)].color }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t">
            AP {ap.id} · {ap.title}
          </div>
          <div className="s">
            {ap.responsible} · bis {halfLabel(ap.end_half)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid g-kpi" style={{ marginBottom: 16 }}>
        <div className="kpi" style={{ borderTop: `3px solid ${RED}` }}>
          <div className="v" style={{ color: RED }}>
            {t.pct} %
          </div>
          <div className="l">Gesamtfortschritt</div>
        </div>
        <div className="kpi" style={{ borderTop: "3px solid #16A34A" }}>
          <div className="v" style={{ color: "#16A34A" }}>
            {t.done}/{t.total}
          </div>
          <div className="l">Erledigt</div>
        </div>
        <div className="kpi" style={{ borderTop: "3px solid #F59E0B" }}>
          <div className="v" style={{ color: "#F59E0B" }}>
            {t.laufend}
          </div>
          <div className="l">In Arbeit</div>
        </div>
        <div
          className="kpi"
          style={{
            borderTop: `3px solid ${overdue.length ? RED : "#9CA3AF"}`,
          }}
        >
          <div className="v" style={{ color: overdue.length ? RED : "#9CA3AF" }}>
            {overdue.length}
          </div>
          <div className="l">Überfällig</div>
        </div>
      </div>

      <div className="card">
        <h3>Meilensteine</h3>
        <div className="grid g-ms">
          {milestones.map((ms) => {
            const s = msStatus(ms, statusOf, today);
            return (
              <div
                key={ms.id}
                className="ms-card"
                style={{ borderTop: `3px solid ${s.color}` }}
              >
                <div className="ms-head">
                  <span className="ms-id">{ms.id}</span>
                  <span className="ms-st" style={{ color: s.color }}>
                    {s.label}
                  </span>
                </div>
                <div className="ms-title">{ms.title}</div>
                <div className="ms-due">{ms.due_label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3>Fortschritt je Phase</h3>
        {phases.map((p) => {
          const pr = phaseProg(p.id, aps, tas, statusOf);
          return (
            <div key={p.id} className="ph-row">
              <div className="ph-head">
                <span>
                  <b style={{ color: p.color }}>Phase {p.id}</b> · {p.name}{" "}
                  <span style={{ color: "#999", fontSize: 11 }}>
                    ({p.time_label})
                  </span>
                </span>
                <span style={{ fontWeight: 600 }}>
                  {pr.done}/{pr.total}
                </span>
              </div>
              <div className="pbar">
                <div style={{ width: `${pr.pct}%`, background: p.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid g-2">
        <div className="card">
          <h3>Überfällig ({overdue.length})</h3>
          {overdue.length ? (
            overdue.map((a) => <Mini key={a.id} ap={a} late />)
          ) : (
            <div className="empty">Nichts überfällig – stark! 💪</div>
          )}
        </div>
        <div className="card">
          <h3>Anstehend ({soon.length})</h3>
          {soon.length ? (
            soon.map((a) => <Mini key={a.id} ap={a} late={false} />)
          ) : (
            <div className="empty">Aktuell nichts fällig.</div>
          )}
        </div>
      </div>
    </>
  );
}
