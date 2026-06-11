-- Bereits auf das Supabase-Projekt "Dienstuebergaben" (vixflxlukncdssucvayy) angewendet.

-- ============ STRUKTUR (Seed, read-only für App) ============

create table public.phases (
  id smallint primary key,
  name text not null,
  time_label text not null,
  color text not null
);

create table public.tas (
  id text primary key,
  phase_id smallint not null references public.phases(id),
  name text not null
);

create table public.aps (
  id text primary key,
  ta_id text not null references public.tas(id),
  title text not null,
  responsible text not null,
  start_half smallint not null,
  end_half smallint not null
);

create table public.milestones (
  id text primary key,
  title text not null,
  due_half smallint not null,
  due_label text not null
);

create table public.milestone_deps (
  milestone_id text references public.milestones(id),
  ap_id text references public.aps(id),
  primary key (milestone_id, ap_id)
);

-- ============ ZUSTAND (mutable) ============

create table public.task_states (
  ap_id text primary key references public.aps(id),
  status text not null default 'offen'
    check (status in ('offen','laufend','erledigt')),
  notes text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table public.risks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  severity text not null check (severity in ('niedrig','mittel','hoch')),
  measure text not null default '',
  status text not null default 'offen' check (status in ('offen','entschärft')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- ============ AUDIT ============

create table public.activity_log (
  id bigint generated always as identity primary key,
  ap_id text references public.aps(id),
  old_status text,
  new_status text,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id)
);

-- updated_at / updated_by automatisch setzen
create or replace function public.task_states_set_meta()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;

create trigger trg_task_states_meta
before update on public.task_states
for each row execute function public.task_states_set_meta();

-- Statuswechsel ins Activity-Log schreiben
create or replace function public.task_states_log_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    insert into public.activity_log (ap_id, old_status, new_status, changed_by)
    values (new.ap_id, old.status, new.status, auth.uid());
  end if;
  return new;
end $$;

create trigger trg_task_states_log
after update on public.task_states
for each row execute function public.task_states_log_status();

-- created_by automatisch setzen
create or replace function public.risks_set_meta()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.created_by := auth.uid();
  return new;
end $$;

create trigger trg_risks_meta
before insert on public.risks
for each row execute function public.risks_set_meta();

-- E-Mail-Lookup für "zuletzt geändert von"
create or replace function public.user_email(uid uuid)
returns text language sql stable security definer set search_path = '' as $$
  select email::text from auth.users where id = uid
$$;
revoke execute on function public.user_email(uuid) from public, anon;
grant execute on function public.user_email(uuid) to authenticated;

-- ============ ROW LEVEL SECURITY ============

alter table public.phases enable row level security;
alter table public.tas enable row level security;
alter table public.aps enable row level security;
alter table public.milestones enable row level security;
alter table public.milestone_deps enable row level security;
alter table public.task_states enable row level security;
alter table public.risks enable row level security;
alter table public.activity_log enable row level security;

create policy "authenticated read phases" on public.phases for select to authenticated using (true);
create policy "authenticated read tas" on public.tas for select to authenticated using (true);
create policy "authenticated read aps" on public.aps for select to authenticated using (true);
create policy "authenticated read milestones" on public.milestones for select to authenticated using (true);
create policy "authenticated read milestone_deps" on public.milestone_deps for select to authenticated using (true);
create policy "authenticated read activity_log" on public.activity_log for select to authenticated using (true);

create policy "authenticated read task_states" on public.task_states for select to authenticated using (true);
create policy "authenticated update task_states" on public.task_states for update to authenticated using (true) with check (true);

create policy "authenticated read risks" on public.risks for select to authenticated using (true);
create policy "authenticated insert risks" on public.risks for insert to authenticated with check (true);
create policy "authenticated update risks" on public.risks for update to authenticated using (true) with check (true);
create policy "authenticated delete risks" on public.risks for delete to authenticated using (true);

-- ============ REALTIME ============

alter publication supabase_realtime add table public.task_states;
alter publication supabase_realtime add table public.risks;
