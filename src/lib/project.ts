import type { Ap, Milestone, Phase, Status, Ta } from "./types";

export const MONTHS = [
  "Mai 26",
  "Jun 26",
  "Jul 26",
  "Aug 26",
  "Sep 26",
  "Okt 26",
  "Nov 26",
  "Dez 26",
  "Jan 27",
];

export const RED = "#CC0000";
export const MILESTONE_COLOR = "#D97706";

export const STATUS: Record<Status, { label: string; color: string }> = {
  offen: { label: "Offen", color: "#9CA3AF" },
  laufend: { label: "In Arbeit", color: "#F59E0B" },
  erledigt: { label: "Erledigt", color: "#16A34A" },
};

export const ORDER: Status[] = ["offen", "laufend", "erledigt"];

export const RESPONSIBLES = [
  "Stv. PDL",
  "Zentrale PA",
  "PA vor Ort",
  "Azubis",
  "PDL",
  "Pflegeteam",
];

/** Halbmonats-Index heute: 0 = Mai 1H 2026 … 17 = Jan 2H 2027, geclampt auf −1…18 */
export function todayHalf(): number {
  const n = new Date();
  const ms = (n.getFullYear() - 2026) * 12 + (n.getMonth() - 4);
  return Math.max(-1, Math.min(18, ms * 2 + (n.getDate() > 15 ? 1 : 0)));
}

export function halfLabel(i: number): string {
  const m = Math.floor(i / 2);
  return (MONTHS[m] || "?") + " " + (i % 2 === 0 ? "1H" : "2H");
}

export type MsStatus = {
  key: "done" | "late" | "risk" | "open";
  label: string;
  color: string;
};

export function msStatus(
  m: Milestone,
  statusOf: (apId: string) => Status,
  today: number
): MsStatus {
  if (m.deps.every((d) => statusOf(d) === "erledigt"))
    return { key: "done", label: "Erreicht", color: "#16A34A" };
  if (today > m.due_half) return { key: "late", label: "Überfällig", color: RED };
  if (today >= m.due_half - 1)
    return { key: "risk", label: "Kritisch", color: "#F59E0B" };
  return { key: "open", label: "Geplant", color: "#9CA3AF" };
}

export function phaseOf(ap: Ap, tas: Ta[]): number {
  return tas.find((t) => t.id === ap.ta_id)?.phase_id ?? 0;
}

export function phaseColor(phases: Phase[], phaseId: number): string {
  return phases.find((p) => p.id === phaseId)?.color ?? "#999";
}

export function phaseProg(
  phaseId: number,
  aps: Ap[],
  tas: Ta[],
  statusOf: (apId: string) => Status
) {
  const list = aps.filter((a) => phaseOf(a, tas) === phaseId);
  const done = list.filter((a) => statusOf(a.id) === "erledigt").length;
  return {
    done,
    total: list.length,
    pct: list.length ? Math.round((done / list.length) * 100) : 0,
  };
}

export function totals(aps: Ap[], statusOf: (apId: string) => Status) {
  const done = aps.filter((a) => statusOf(a.id) === "erledigt").length;
  const laufend = aps.filter((a) => statusOf(a.id) === "laufend").length;
  return {
    done,
    laufend,
    total: aps.length,
    pct: aps.length ? Math.round((done / aps.length) * 100) : 0,
  };
}
