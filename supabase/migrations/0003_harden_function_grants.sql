-- Bereits auf das Supabase-Projekt "Dienstuebergaben" (vixflxlukncdssucvayy) angewendet.

-- Trigger-Funktionen sollen nicht über die REST-API (rpc) aufrufbar sein
revoke execute on function public.task_states_set_meta() from public, anon, authenticated;
revoke execute on function public.task_states_log_status() from public, anon, authenticated;
revoke execute on function public.risks_set_meta() from public, anon, authenticated;
