import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { DetailModal } from "@/components/DetailModal";
import { Toast } from "@/components/Toast";
import type {
  Ap,
  Milestone,
  Phase,
  ProjectStructure,
  Risk,
  Ta,
  TaskState,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [phases, tas, aps, milestones, deps, states, risks] =
    await Promise.all([
      supabase.from("phases").select("*").order("id"),
      supabase.from("tas").select("*").order("id"),
      supabase.from("aps").select("*").order("id"),
      supabase.from("milestones").select("*").order("id"),
      supabase.from("milestone_deps").select("*"),
      supabase.from("task_states").select("*"),
      supabase.from("risks").select("*").order("created_at"),
    ]);

  const depsByMs = new Map<string, string[]>();
  for (const d of (deps.data ?? []) as { milestone_id: string; ap_id: string }[]) {
    const list = depsByMs.get(d.milestone_id) ?? [];
    list.push(d.ap_id);
    depsByMs.set(d.milestone_id, list);
  }

  const structure: ProjectStructure = {
    phases: (phases.data ?? []) as Phase[],
    tas: (tas.data ?? []) as Ta[],
    aps: (aps.data ?? []) as Ap[],
    milestones: ((milestones.data ?? []) as Omit<Milestone, "deps">[]).map(
      (m) => ({ ...m, deps: (depsByMs.get(m.id) ?? []).sort() })
    ),
  };

  return (
    <ProjectProvider
      structure={structure}
      initialStates={(states.data ?? []) as TaskState[]}
      initialRisks={(risks.data ?? []) as Risk[]}
      userEmail={user.email ?? ""}
    >
      <Header />
      <main>{children}</main>
      <DetailModal />
      <Toast />
    </ProjectProvider>
  );
}
