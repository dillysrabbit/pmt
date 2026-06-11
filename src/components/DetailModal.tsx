"use client";

import { useEffect, useRef, useState } from "react";
import { useProject } from "@/lib/store";
import {
  halfLabel,
  ORDER,
  phaseColor,
  RED,
  STATUS,
  todayHalf,
} from "@/lib/project";

export function DetailModal() {
  const {
    structure,
    states,
    modalAp,
    closeDetail,
    statusOf,
    notesOf,
    setStatus,
    saveNotes,
    lookupEmail,
  } = useProject();

  const [draft, setDraft] = useState("");
  const [editorEmail, setEditorEmail] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const state = modalAp ? states[modalAp] : undefined;
  const updatedBy = state?.updated_by ?? null;

  useEffect(() => {
    if (modalAp) setDraft(notesOf(modalAp));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalAp]);

  useEffect(() => {
    let cancelled = false;
    setEditorEmail(null);
    if (updatedBy) {
      void lookupEmail(updatedBy).then((email) => {
        if (!cancelled) setEditorEmail(email);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [updatedBy, lookupEmail]);

  useEffect(() => {
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  if (!modalAp) return null;
  const ap = structure.aps.find((a) => a.id === modalAp);
  if (!ap) return null;
  const ta = structure.tas.find((t) => t.id === ap.ta_id);
  const color = phaseColor(structure.phases, ta?.phase_id ?? 0);
  const status = statusOf(ap.id);
  const late = ap.end_half < todayHalf() && status !== "erledigt";

  function onNotesInput(value: string) {
    setDraft(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => saveNotes(ap!.id, value), 500);
  }

  const lastChanged =
    state && updatedBy
      ? `Zuletzt geändert von ${editorEmail ?? "…"} am ${new Date(
          state.updated_at
        ).toLocaleString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })} Uhr`
      : null;

  return (
    <div className="modal-bg" onClick={closeDetail}>
      <div
        className="modal"
        style={{ borderTop: `5px solid ${color}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mo-meta">
          Phase {ta?.phase_id} · TA {ta?.id} {ta?.name}
        </div>
        <div className="mo-title">
          AP {ap.id} · {ap.title}
        </div>
        <div className="mo-info">
          <span>
            <b>Verantwortlich:</b> {ap.responsible}
          </span>
          <span>
            <b>Zeitraum:</b> {halfLabel(ap.start_half)} –{" "}
            {halfLabel(ap.end_half)}
          </span>
          {late && (
            <span style={{ color: RED, fontWeight: 700 }}>⚠ Überfällig</span>
          )}
        </div>
        <div className="mo-btns">
          {ORDER.map((s) => (
            <button
              key={s}
              style={
                status === s
                  ? {
                      border: "none",
                      background: STATUS[s].color,
                      color: "#fff",
                    }
                  : undefined
              }
              onClick={() => setStatus(ap.id, s)}
            >
              {STATUS[s].label}
            </button>
          ))}
        </div>
        <label className="mo-lbl" htmlFor="mo-notes">
          Notizen
        </label>
        <textarea
          id="mo-notes"
          className="mo-notes"
          rows={4}
          placeholder="Notizen zum Arbeitspaket…"
          value={draft}
          onChange={(e) => onNotesInput(e.target.value)}
        />
        {lastChanged && <div className="mo-audit">{lastChanged}</div>}
        <button className="mo-close" onClick={closeDetail}>
          Schließen
        </button>
      </div>
    </div>
  );
}
