import { jsPDF } from "jspdf";
import type { Ap, ProjectStructure, Risk, Status, TaskState } from "./types";
import { halfLabel, msStatus, STATUS, todayHalf, totals } from "./project";

const INK: [number, number, number] = [26, 26, 26];
const GRAY: [number, number, number] = [110, 110, 110];
const LIGHT: [number, number, number] = [225, 225, 225];
const CARITAS: [number, number, number] = [204, 0, 0];

const PAGE_W = 210;
const PAGE_H = 297;
const M_L = 18;
const M_R = 18;
const CONTENT_W = PAGE_W - M_L - M_R;
const BOTTOM = PAGE_H - 22;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function statusRgb(s: Status): [number, number, number] {
  return hexToRgb(STATUS[s].color);
}

function today(): string {
  return new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Seitenzahlen + Fußzeile auf alle Seiten stempeln */
function addFooters(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(
      `Strukturierte Dienstübergaben · Maria-Hötte-Stift · Stand ${today()}`,
      M_L,
      PAGE_H - 12
    );
    doc.text(`Seite ${i} von ${pages}`, PAGE_W - M_R, PAGE_H - 12, {
      align: "right",
    });
  }
}

function docHeader(doc: jsPDF, subtitle: string) {
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, PAGE_W, 30, "F");
  doc.setFillColor(...CARITAS);
  doc.rect(0, 30, PAGE_W, 1.6, "F");
  doc.setTextColor(...CARITAS);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("PROJEKTSTEUERUNG", M_L, 11);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("Strukturierte Dienstübergaben", M_L, 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text(subtitle, M_L, 25.5);
}

/** Kompletter Projektbericht: alle APs mit Notizen, Meilensteine, Risiken */
export function exportProjectPdf(
  structure: ProjectStructure,
  statusOf: (apId: string) => Status,
  notesOf: (apId: string) => string,
  risks: Risk[]
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { phases, tas, aps, milestones } = structure;
  const t = todayHalf();
  let y = 40;

  const ensure = (h: number) => {
    if (y + h > BOTTOM) {
      doc.addPage();
      y = 20;
    }
  };

  docHeader(doc, `Projektbericht · erstellt am ${today()}`);

  // KPI-Zeile
  const tot = totals(aps, statusOf);
  const overdue = aps.filter(
    (a) => a.end_half < t && statusOf(a.id) !== "erledigt"
  ).length;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(
    `Gesamtfortschritt: ${tot.pct} %   ·   Erledigt: ${tot.done}/${tot.total}   ·   In Arbeit: ${tot.laufend}   ·   Überfällig: ${overdue}`,
    M_L,
    y
  );
  y += 9;

  // Meilensteine
  doc.setFontSize(11);
  doc.setTextColor(...CARITAS);
  doc.text("MEILENSTEINE", M_L, y);
  y += 6;
  for (const m of milestones) {
    const s = msStatus(m, statusOf, t);
    const done = m.deps.filter((d) => statusOf(d) === "erledigt").length;
    ensure(6);
    doc.setFillColor(...hexToRgb(s.color));
    doc.circle(M_L + 1.5, y - 1.2, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(`${m.id} · ${m.title}`, M_L + 6, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(
      `fällig ${m.due_label} · ${s.label} (${done}/${m.deps.length} APs erledigt)`,
      PAGE_W - M_R,
      y,
      { align: "right" }
    );
    y += 5.5;
  }
  y += 4;

  // Arbeitspakete je Phase
  for (const phase of phases) {
    const pc = hexToRgb(phase.color);
    const phaseTas = tas.filter((ta) => ta.phase_id === phase.id);

    ensure(14);
    doc.setFillColor(...pc);
    doc.rect(M_L, y - 4.5, CONTENT_W, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `PHASE ${phase.id} · ${phase.name.toUpperCase()}  (${phase.time_label})`,
      M_L + 2.5,
      y
    );
    y += 8;

    for (const ta of phaseTas) {
      ensure(8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...pc);
      doc.text(`TA ${ta.id} · ${ta.name}`, M_L, y);
      y += 5;

      for (const ap of aps.filter((a) => a.ta_id === ta.id)) {
        const s = statusOf(ap.id);
        const late = ap.end_half < t && s !== "erledigt";
        const notes = notesOf(ap.id).trim();

        doc.setFontSize(9);
        const noteLines: string[] = notes
          ? doc.splitTextToSize(notes, CONTENT_W - 12)
          : [];
        const blockH = 9 + (noteLines.length ? noteLines.length * 3.8 + 3 : 0);
        ensure(blockH + 2);

        // Phasenfarbene Markierung + Statuspunkt
        doc.setFillColor(...pc);
        doc.rect(M_L, y - 3, 1, blockH - 2, "F");
        doc.setFillColor(...statusRgb(s));
        doc.circle(M_L + 5, y - 0.8, 1.4, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...INK);
        doc.text(`AP ${ap.id} · ${ap.title}`, M_L + 9, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...(late ? CARITAS : GRAY));
        doc.text(
          late ? `${STATUS[s].label} · ÜBERFÄLLIG` : STATUS[s].label,
          PAGE_W - M_R,
          y,
          { align: "right" }
        );
        y += 4.2;
        doc.setTextColor(...GRAY);
        doc.setFontSize(8.5);
        doc.text(
          `Verantwortlich: ${ap.responsible} · Zeitraum: ${halfLabel(ap.start_half)} – ${halfLabel(ap.end_half)}`,
          M_L + 9,
          y
        );
        y += 4.8;

        if (noteLines.length) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8.5);
          doc.setTextColor(60, 60, 60);
          doc.text("Notizen:", M_L + 9, y - 1);
          doc.text(noteLines, M_L + 9, y + 2.8);
          y += noteLines.length * 3.8 + 3;
          doc.setFont("helvetica", "normal");
        }

        doc.setDrawColor(...LIGHT);
        doc.line(M_L, y - 1.5, PAGE_W - M_R, y - 1.5);
        y += 2.5;
      }
      y += 1.5;
    }
    y += 3;
  }

  // Risikoregister
  ensure(16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...CARITAS);
  doc.text("RISIKOREGISTER", M_L, y);
  y += 6;
  if (!risks.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text("Keine Risiken erfasst.", M_L, y);
    y += 6;
  } else {
    for (const r of risks) {
      const c =
        r.severity === "hoch"
          ? CARITAS
          : r.severity === "mittel"
            ? hexToRgb("#F59E0B")
            : hexToRgb("#16A34A");
      doc.setFontSize(9);
      const measureLines: string[] = r.measure
        ? doc.splitTextToSize(`Gegenmaßnahme: ${r.measure}`, CONTENT_W - 8)
        : [];
      ensure(8 + measureLines.length * 3.8);
      doc.setFillColor(...c);
      doc.circle(M_L + 1.5, y - 1.2, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...INK);
      doc.text(r.title, M_L + 6, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY);
      doc.text(
        `${r.severity.toUpperCase()} · ${r.status === "offen" ? "offen" : "entschärft"}`,
        PAGE_W - M_R,
        y,
        { align: "right" }
      );
      y += 4.5;
      if (measureLines.length) {
        doc.setFontSize(8.5);
        doc.text(measureLines, M_L + 6, y);
        y += measureLines.length * 3.8 + 1;
      }
      y += 2;
    }
  }

  addFooters(doc);
  doc.save("projektbericht_dienstuebergaben.pdf");
}

/** Einzelnes Arbeitspaket als One-Pager */
export function exportApPdf(
  structure: ProjectStructure,
  ap: Ap,
  state: TaskState | undefined,
  lastChanged: string | null
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ta = structure.tas.find((x) => x.id === ap.ta_id);
  const phase = structure.phases.find((p) => p.id === ta?.phase_id);
  const pc = hexToRgb(phase?.color ?? "#999999");
  const s: Status = state?.status ?? "offen";
  const t = todayHalf();
  const late = ap.end_half < t && s !== "erledigt";
  const notes = (state?.notes ?? "").trim();
  let y = 44;

  docHeader(doc, `Arbeitspaket-Bericht · erstellt am ${today()}`);

  doc.setFillColor(...pc);
  doc.rect(M_L, y - 6, CONTENT_W, 1.6, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(
    `Phase ${phase?.id} · ${phase?.name} (${phase?.time_label}) · TA ${ta?.id} ${ta?.name}`,
    M_L,
    y
  );
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  const titleLines: string[] = doc.splitTextToSize(
    `AP ${ap.id} · ${ap.title}`,
    CONTENT_W
  );
  doc.text(titleLines, M_L, y);
  y += titleLines.length * 6.5 + 4;

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...INK);
  doc.text(`Verantwortlich:  ${ap.responsible}`, M_L, y);
  y += 6;
  doc.text(
    `Zeitraum:  ${halfLabel(ap.start_half)} – ${halfLabel(ap.end_half)}`,
    M_L,
    y
  );
  y += 6;
  doc.setFillColor(...statusRgb(s));
  doc.circle(M_L + 1.5, y - 1.2, 1.7, "F");
  doc.setTextColor(...statusRgb(s));
  doc.setFont("helvetica", "bold");
  doc.text(`Status: ${STATUS[s].label}`, M_L + 5.5, y);
  if (late) {
    doc.setTextColor(...CARITAS);
    doc.text("· ÜBERFÄLLIG", M_L + 5.5 + 35, y);
  }
  y += 11;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text("Notizen", M_L, y);
  y += 5;
  doc.setDrawColor(...LIGHT);
  if (notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    const noteLines: string[] = doc.splitTextToSize(notes, CONTENT_W - 6);
    const boxH = noteLines.length * 4.6 + 7;
    doc.roundedRect(M_L, y - 2, CONTENT_W, boxH, 1.5, 1.5, "S");
    doc.text(noteLines, M_L + 3, y + 3.5);
    y += boxH + 6;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(...GRAY);
    doc.text("Keine Notizen vorhanden.", M_L, y + 1);
    y += 9;
  }

  if (lastChanged) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.text(lastChanged, M_L, y + 2);
  }

  addFooters(doc);
  doc.save(`AP_${ap.id.replaceAll(".", "-")}_dienstuebergaben.pdf`);
}
