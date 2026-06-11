"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useProject } from "@/lib/store";
import { msStatus, todayHalf, totals } from "@/lib/project";
import { createClient } from "@/lib/supabase/client";

const VIEWS: [string, string][] = [
  ["/", "Dashboard"],
  ["/board", "Board"],
  ["/zeitplan", "Zeitplan"],
  ["/liste", "Liste"],
  ["/meilensteine", "Meilensteine"],
  ["/risiken", "Risiken"],
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { structure, risks, saveMsg, statusOf, notesOf, isAdmin } =
    useProject();

  function exportJSON() {
    const today = todayHalf();
    const data = {
      projekt: "Strukturierte Dienstübergaben",
      exportiert: new Date().toISOString(),
      fortschritt: totals(structure.aps, statusOf),
      arbeitspakete: structure.aps.map((a) => ({
        id: a.id,
        ta: a.ta_id,
        title: a.title,
        resp: a.responsible,
        start: a.start_half,
        end: a.end_half,
        status: statusOf(a.id),
        notizen: notesOf(a.id),
      })),
      meilensteine: structure.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        due: m.due_half,
        dueLabel: m.due_label,
        deps: m.deps,
        status: msStatus(m, statusOf, today).label,
      })),
      risiken: risks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "projektstatus_dienstuebergaben.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { exportProjectPdf } = await import("@/lib/pdf");
    exportProjectPdf(structure, statusOf, notesOf, risks);
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header>
      <div className="hd-art" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/header-art.png" alt="" />
      </div>
      <div className="hd-row">
        <div>
          <div className="hd-eyebrow">Projektsteuerung</div>
          <div className="hd-title">Strukturierte Dienstübergaben</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="hd-save">{saveMsg}</span>
          <button className="hd-export" onClick={exportPDF}>
            PDF ↓
          </button>
          <button className="hd-export" onClick={exportJSON}>
            Export ↓
          </button>
          <button className="hd-export" onClick={signOut} title="Abmelden">
            Abmelden
          </button>
        </div>
      </div>
      <nav className="main-nav">
        {VIEWS.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? "active" : ""}
          >
            {label}
          </Link>
        ))}
        {isAdmin && (
          <Link href="/nutzer" className={pathname === "/nutzer" ? "active" : ""}>
            Nutzer
          </Link>
        )}
      </nav>
    </header>
  );
}
