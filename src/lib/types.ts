export type Status = "offen" | "laufend" | "erledigt";
export type Severity = "niedrig" | "mittel" | "hoch";
export type RiskStatus = "offen" | "entschärft";

export interface Phase {
  id: number;
  name: string;
  time_label: string;
  color: string;
}

export interface Ta {
  id: string;
  phase_id: number;
  name: string;
}

export interface Ap {
  id: string;
  ta_id: string;
  title: string;
  responsible: string;
  start_half: number;
  end_half: number;
}

export interface Milestone {
  id: string;
  title: string;
  due_half: number;
  due_label: string;
  deps: string[];
}

export interface TaskState {
  ap_id: string;
  status: Status;
  notes: string;
  updated_at: string;
  updated_by: string | null;
}

export interface Risk {
  id: string;
  title: string;
  severity: Severity;
  measure: string;
  status: RiskStatus;
  created_at: string;
  created_by: string | null;
}

export interface ProjectStructure {
  phases: Phase[];
  tas: Ta[];
  aps: Ap[];
  milestones: Milestone[];
}
