-- Bereits auf das Supabase-Projekt "Dienstuebergaben" (vixflxlukncdssucvayy) angewendet.

-- ============ ALLOWLIST + ROLLEN ============
-- Mit Google-Login kann sich grundsätzlich jeder authentifizieren.
-- Datenzugriff bekommt nur, wer in app_users steht; Admins verwalten die Liste.

create table public.app_users (
  email text primary key check (email = lower(email)),
  role text not null default 'member' check (role in ('admin','member')),
  created_at timestamptz not null default now()
);

insert into public.app_users (email, role) values ('dillysrabbit@gmail.com', 'admin');

create or replace function public.current_email()
returns text language sql stable set search_path = '' as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

create or replace function public.is_allowed()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.app_users where email = public.current_email())
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.app_users where email = public.current_email() and role = 'admin')
$$;

revoke execute on function public.is_allowed() from public, anon;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_allowed() to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.app_users enable row level security;

create policy "allowed read app_users" on public.app_users
  for select to authenticated using (public.is_allowed());
create policy "admin insert app_users" on public.app_users
  for insert to authenticated with check (public.is_admin());
create policy "admin update app_users" on public.app_users
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete app_users" on public.app_users
  for delete to authenticated using (public.is_admin());

-- ============ BESTEHENDE POLICIES AUF ALLOWLIST UMSTELLEN ============

drop policy "authenticated read phases" on public.phases;
drop policy "authenticated read tas" on public.tas;
drop policy "authenticated read aps" on public.aps;
drop policy "authenticated read milestones" on public.milestones;
drop policy "authenticated read milestone_deps" on public.milestone_deps;
drop policy "authenticated read activity_log" on public.activity_log;
drop policy "authenticated read task_states" on public.task_states;
drop policy "authenticated update task_states" on public.task_states;
drop policy "authenticated read risks" on public.risks;
drop policy "authenticated insert risks" on public.risks;
drop policy "authenticated update risks" on public.risks;
drop policy "authenticated delete risks" on public.risks;

create policy "allowed read phases" on public.phases for select to authenticated using (public.is_allowed());
create policy "allowed read tas" on public.tas for select to authenticated using (public.is_allowed());
create policy "allowed read aps" on public.aps for select to authenticated using (public.is_allowed());
create policy "allowed read milestones" on public.milestones for select to authenticated using (public.is_allowed());
create policy "allowed read milestone_deps" on public.milestone_deps for select to authenticated using (public.is_allowed());
create policy "allowed read activity_log" on public.activity_log for select to authenticated using (public.is_allowed());

create policy "allowed read task_states" on public.task_states for select to authenticated using (public.is_allowed());
create policy "allowed update task_states" on public.task_states for update to authenticated using (public.is_allowed()) with check (public.is_allowed());

create policy "allowed read risks" on public.risks for select to authenticated using (public.is_allowed());
create policy "allowed insert risks" on public.risks for insert to authenticated with check (public.is_allowed());
create policy "allowed update risks" on public.risks for update to authenticated using (public.is_allowed()) with check (public.is_allowed());
create policy "allowed delete risks" on public.risks for delete to authenticated using (public.is_allowed());
