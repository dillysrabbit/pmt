"use client";

import { useProject } from "@/lib/store";

export function Toast() {
  const { toastMsg } = useProject();
  if (!toastMsg) return null;
  return <div className="toast">{toastMsg}</div>;
}
