"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  ProjectStructure,
  Risk,
  RiskStatus,
  Severity,
  Status,
  TaskState,
} from "@/lib/types";
import { ORDER } from "@/lib/project";

interface ProjectContextValue {
  structure: ProjectStructure;
  states: Record<string, TaskState>;
  risks: Risk[];
  userEmail: string;
  isAdmin: boolean;
  saveMsg: string;
  toastMsg: string;
  modalAp: string | null;
  statusOf: (apId: string) => Status;
  notesOf: (apId: string) => string;
  setStatus: (apId: string, status: Status) => void;
  cycleStatus: (apId: string) => void;
  saveNotes: (apId: string, notes: string) => void;
  addRisk: (title: string, severity: Severity, measure: string) => void;
  toggleRisk: (id: string) => void;
  deleteRisk: (id: string) => void;
  openDetail: (apId: string) => void;
  closeDetail: () => void;
  lookupEmail: (uid: string) => Promise<string | null>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject außerhalb des ProjectProvider");
  return ctx;
}

export function ProjectProvider({
  structure,
  initialStates,
  initialRisks,
  userEmail,
  isAdmin,
  children,
}: {
  structure: ProjectStructure;
  initialStates: TaskState[];
  initialRisks: Risk[];
  userEmail: string;
  isAdmin: boolean;
  children: ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [states, setStates] = useState<Record<string, TaskState>>(() =>
    Object.fromEntries(initialStates.map((s) => [s.ap_id, s]))
  );
  const [risks, setRisks] = useState<Risk[]>(initialRisks);
  const [saveMsg, setSaveMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [modalAp, setModalAp] = useState<string | null>(null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailCache = useRef<Map<string, string | null>>(new Map());

  const flashSaved = useCallback((msg = "gespeichert ✓") => {
    setSaveMsg(msg);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveMsg(""), 1600);
  }, []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 3500);
  }, []);

  // Realtime: Änderungen anderer Geräte ohne Reload übernehmen
  useEffect(() => {
    const channel = supabase
      .channel("project-sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "task_states" },
        (payload) => {
          const row = payload.new as TaskState;
          setStates((prev) => ({ ...prev, [row.ap_id]: row }));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "risks" },
        (payload) => {
          const row = payload.new as Risk;
          setRisks((prev) =>
            prev.some((r) => r.id === row.id) ? prev : [...prev, row]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "risks" },
        (payload) => {
          const row = payload.new as Risk;
          setRisks((prev) => prev.map((r) => (r.id === row.id ? row : r)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "risks" },
        (payload) => {
          const old = payload.old as { id?: string };
          if (old.id) setRisks((prev) => prev.filter((r) => r.id !== old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const statusOf = useCallback(
    (apId: string): Status => states[apId]?.status ?? "offen",
    [states]
  );
  const notesOf = useCallback(
    (apId: string): string => states[apId]?.notes ?? "",
    [states]
  );

  const setStatus = useCallback(
    (apId: string, status: Status) => {
      const prev = states[apId];
      setStates((s) => ({
        ...s,
        [apId]: {
          ...(s[apId] ?? { ap_id: apId, notes: "", updated_by: null }),
          ap_id: apId,
          status,
          updated_at: new Date().toISOString(),
        } as TaskState,
      }));
      void supabase
        .from("task_states")
        .update({ status })
        .eq("ap_id", apId)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) {
            setStates((s) => (prev ? { ...s, [apId]: prev } : s));
            toast("Speichern fehlgeschlagen – bitte erneut versuchen.");
          } else if (data) {
            setStates((s) => ({ ...s, [apId]: data as TaskState }));
            flashSaved();
          }
        });
    },
    [states, supabase, toast, flashSaved]
  );

  const cycleStatus = useCallback(
    (apId: string) => {
      const current = statusOf(apId);
      setStatus(apId, ORDER[(ORDER.indexOf(current) + 1) % 3]);
    },
    [statusOf, setStatus]
  );

  const saveNotes = useCallback(
    (apId: string, notes: string) => {
      const prev = states[apId];
      setStates((s) => ({
        ...s,
        [apId]: { ...(s[apId] as TaskState), notes },
      }));
      void supabase
        .from("task_states")
        .update({ notes })
        .eq("ap_id", apId)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) {
            setStates((s) => (prev ? { ...s, [apId]: prev } : s));
            toast("Notizen konnten nicht gespeichert werden.");
          } else if (data) {
            setStates((s) => ({ ...s, [apId]: data as TaskState }));
            flashSaved();
          }
        });
    },
    [states, supabase, toast, flashSaved]
  );

  const addRisk = useCallback(
    (title: string, severity: Severity, measure: string) => {
      void supabase
        .from("risks")
        .insert({ title, severity, measure })
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) {
            toast("Risiko konnte nicht angelegt werden.");
          } else if (data) {
            const row = data as Risk;
            setRisks((prev) =>
              prev.some((r) => r.id === row.id) ? prev : [...prev, row]
            );
            flashSaved();
          }
        });
    },
    [supabase, toast, flashSaved]
  );

  const toggleRisk = useCallback(
    (id: string) => {
      const prev = risks;
      const target = risks.find((r) => r.id === id);
      if (!target) return;
      const status: RiskStatus =
        target.status === "offen" ? "entschärft" : "offen";
      setRisks((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
      void supabase
        .from("risks")
        .update({ status })
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            setRisks(prev);
            toast("Änderung konnte nicht gespeichert werden.");
          } else {
            flashSaved();
          }
        });
    },
    [risks, supabase, toast, flashSaved]
  );

  const deleteRisk = useCallback(
    (id: string) => {
      const prev = risks;
      setRisks((rs) => rs.filter((r) => r.id !== id));
      void supabase
        .from("risks")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            setRisks(prev);
            toast("Risiko konnte nicht gelöscht werden.");
          } else {
            flashSaved();
          }
        });
    },
    [risks, supabase, toast, flashSaved]
  );

  const lookupEmail = useCallback(
    async (uid: string): Promise<string | null> => {
      if (emailCache.current.has(uid)) return emailCache.current.get(uid)!;
      const { data, error } = await supabase.rpc("user_email", { uid });
      const email = error ? null : (data as string | null);
      emailCache.current.set(uid, email);
      return email;
    },
    [supabase]
  );

  const value: ProjectContextValue = {
    structure,
    states,
    risks,
    userEmail,
    isAdmin,
    saveMsg,
    toastMsg,
    modalAp,
    statusOf,
    notesOf,
    setStatus,
    cycleStatus,
    saveNotes,
    addRisk,
    toggleRisk,
    deleteRisk,
    openDetail: (apId) => setModalAp(apId),
    closeDetail: () => setModalAp(null),
    lookupEmail,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
