-- WORKOUT SCHEMA SETUP + AUDIT (IDEMPOTENTE)
-- Esegui in Supabase SQL Editor in un unico run.
-- Obiettivo:
-- 1) Creare/allineare tabelle core workout
-- 2) Applicare vincoli, indici, RLS e policy
-- 3) Applicare trigger (updated_at + premium enforcement)
-- 4) Verificare stato finale con query di audit

begin;

create extension if not exists pgcrypto;

-- ============================================================================
-- 0) PROFILES (prerequisito premium)
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists is_premium boolean not null default false;

-- ============================================================================
-- 1) EXERCISES (allineamento colonne minime richieste dal frontend)
-- ============================================================================

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_muscle text,
  equipment text,
  instructions text,
  image_url text,
  video_url text,
  is_premium_only boolean not null default false,
  difficulty text,
  created_at timestamptz not null default now()
);

alter table public.exercises add column if not exists target_muscle text;
alter table public.exercises add column if not exists equipment text;
alter table public.exercises add column if not exists instructions text;
alter table public.exercises add column if not exists image_url text;
alter table public.exercises add column if not exists video_url text;
alter table public.exercises add column if not exists is_premium_only boolean not null default false;
alter table public.exercises add column if not exists difficulty text;

do $$
begin
  -- 1) Normalizzazione dati esistenti per evitare errori di vincolo
  update public.exercises
  set difficulty = lower(trim(difficulty))
  where difficulty is not null;

  update public.exercises
  set difficulty = 'novice'
  where difficulty in ('beginner', 'principiante', 'easy');

  update public.exercises
  set difficulty = 'advanced'
  where difficulty in ('expert', 'esperto', 'elite');

  -- 2) Aggiunta del vincolo rimasto
  if not exists (
    select 1 from pg_constraint
    where conname = 'exercises_difficulty_chk'
  ) then
    alter table public.exercises
      add constraint exercises_difficulty_chk
      check (difficulty is null or difficulty in ('novice','intermediate','advanced'));
  end if;
end $$;

create unique index if not exists idx_exercises_name_unique on public.exercises(name);
create index if not exists idx_exercises_target_muscle on public.exercises(target_muscle);

-- ============================================================================
-- 2) WORKOUT TEMPLATES
-- ============================================================================

create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

alter table public.workout_templates add column if not exists profile_id uuid references public.profiles(id) on delete cascade;
alter table public.workout_templates add column if not exists name text;
alter table public.workout_templates add column if not exists description text;
alter table public.workout_templates add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'workout_templates_name_not_empty_chk'
  ) then
    alter table public.workout_templates
      add constraint workout_templates_name_not_empty_chk
      check (length(trim(name)) > 0);
  end if;
end $$;

create index if not exists idx_workout_templates_profile_created
  on public.workout_templates(profile_id, created_at desc);

-- ============================================================================
-- 3) WORKOUT TEMPLATE EXERCISES
-- ============================================================================

create table if not exists public.workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workout_templates(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  exercise_order integer not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.workout_template_exercises add column if not exists template_id uuid references public.workout_templates(id) on delete cascade;
alter table public.workout_template_exercises add column if not exists exercise_id uuid references public.exercises(id) on delete restrict;
alter table public.workout_template_exercises add column if not exists exercise_order integer;
alter table public.workout_template_exercises add column if not exists notes text;
alter table public.workout_template_exercises add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'wte_template_order_unique'
  ) then
    alter table public.workout_template_exercises
      add constraint wte_template_order_unique
      unique (template_id, exercise_order);
  end if;
end $$;

create index if not exists idx_wte_template_order
  on public.workout_template_exercises(template_id, exercise_order);

create index if not exists idx_wte_exercise
  on public.workout_template_exercises(exercise_id);

-- ============================================================================
-- 4) WORKOUT TEMPLATE SETS (NUOVA)
-- ============================================================================

create table if not exists public.workout_template_sets (
  id uuid primary key default gen_random_uuid(),
  template_exercise_id uuid not null references public.workout_template_exercises(id) on delete cascade,
  set_number smallint not null,
  set_type text not null default 'normal',
  target_reps_min smallint,
  target_reps_max smallint,
  target_rpe numeric(3,1),
  target_rir smallint,
  target_weight numeric(6,2),
  rest_seconds smallint not null default 90,
  intensity_payload jsonb,
  is_premium_feature boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workout_template_sets add column if not exists template_exercise_id uuid references public.workout_template_exercises(id) on delete cascade;
alter table public.workout_template_sets add column if not exists set_number smallint;
alter table public.workout_template_sets add column if not exists set_type text not null default 'normal';
alter table public.workout_template_sets add column if not exists target_reps_min smallint;
alter table public.workout_template_sets add column if not exists target_reps_max smallint;
alter table public.workout_template_sets add column if not exists target_rpe numeric(3,1);
alter table public.workout_template_sets add column if not exists target_rir smallint;
alter table public.workout_template_sets add column if not exists target_weight numeric(6,2);
alter table public.workout_template_sets add column if not exists rest_seconds smallint not null default 90;
alter table public.workout_template_sets add column if not exists intensity_payload jsonb;
alter table public.workout_template_sets add column if not exists is_premium_feature boolean not null default false;
alter table public.workout_template_sets add column if not exists created_at timestamptz not null default now();
alter table public.workout_template_sets add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'workout_template_sets_set_type_chk') then
    alter table public.workout_template_sets
      add constraint workout_template_sets_set_type_chk
      check (set_type in ('warmup','normal','failure','dropset','backoff','cluster','myo_reps','rest_pause'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'workout_template_sets_reps_chk') then
    alter table public.workout_template_sets
      add constraint workout_template_sets_reps_chk
      check (
        (target_reps_min is null and target_reps_max is null)
        or (target_reps_min is not null and target_reps_max is not null and target_reps_min > 0 and target_reps_max >= target_reps_min)
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'workout_template_sets_rest_chk') then
    alter table public.workout_template_sets
      add constraint workout_template_sets_rest_chk
      check (rest_seconds > 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'workout_template_sets_unique_order') then
    alter table public.workout_template_sets
      add constraint workout_template_sets_unique_order
      unique (template_exercise_id, set_number);
  end if;
end $$;

create index if not exists idx_wts_template_exercise
  on public.workout_template_sets(template_exercise_id, set_number);

-- ============================================================================
-- 5) WORKOUT SESSIONS
-- ============================================================================

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid references public.workout_templates(id) on delete set null,
  status text not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  total_volume numeric(12,2),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.workout_sessions add column if not exists profile_id uuid references public.profiles(id) on delete cascade;
alter table public.workout_sessions add column if not exists template_id uuid references public.workout_templates(id) on delete set null;
alter table public.workout_sessions add column if not exists status text not null default 'in_progress';
alter table public.workout_sessions add column if not exists started_at timestamptz not null default now();
alter table public.workout_sessions add column if not exists completed_at timestamptz;
alter table public.workout_sessions add column if not exists duration_seconds integer;
alter table public.workout_sessions add column if not exists total_volume numeric(12,2);
alter table public.workout_sessions add column if not exists notes text;
alter table public.workout_sessions add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'workout_sessions_status_chk') then
    alter table public.workout_sessions
      add constraint workout_sessions_status_chk
      check (status in ('in_progress','completed','cancelled'));
  end if;
end $$;

create index if not exists idx_ws_profile_started
  on public.workout_sessions(profile_id, started_at desc);

-- ============================================================================
-- 6) PERFORMED SETS
-- ============================================================================

create table if not exists public.performed_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  template_set_id uuid references public.workout_template_sets(id) on delete set null,
  set_number smallint not null,
  set_type text not null default 'normal',
  reps smallint,
  weight numeric(6,2),
  rpe numeric(3,1),
  rir smallint,
  rest_real_seconds smallint,
  intensity_payload jsonb,
  is_completed boolean not null default true,
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.performed_sets add column if not exists session_id uuid references public.workout_sessions(id) on delete cascade;
alter table public.performed_sets add column if not exists exercise_id uuid references public.exercises(id) on delete restrict;
alter table public.performed_sets add column if not exists template_set_id uuid references public.workout_template_sets(id) on delete set null;
alter table public.performed_sets add column if not exists set_number smallint;
alter table public.performed_sets add column if not exists set_type text not null default 'normal';
alter table public.performed_sets add column if not exists reps smallint;
alter table public.performed_sets add column if not exists weight numeric(6,2);
alter table public.performed_sets add column if not exists rpe numeric(3,1);
alter table public.performed_sets add column if not exists rir smallint;
alter table public.performed_sets add column if not exists rest_real_seconds smallint;
alter table public.performed_sets add column if not exists intensity_payload jsonb;
alter table public.performed_sets add column if not exists is_completed boolean not null default true;
alter table public.performed_sets add column if not exists performed_at timestamptz not null default now();
alter table public.performed_sets add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'performed_sets_set_type_chk') then
    alter table public.performed_sets
      add constraint performed_sets_set_type_chk
      check (set_type in ('warmup','normal','failure','dropset','backoff','cluster','myo_reps','rest_pause'));
  end if;
end $$;

create index if not exists idx_ps_session_order
  on public.performed_sets(session_id, set_number);

create index if not exists idx_ps_exercise_time
  on public.performed_sets(exercise_id, performed_at desc);

-- ============================================================================
-- 7) PR HISTORY
-- ============================================================================

create table if not exists public.pr_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  pr_type text not null default 'weight_reps',
  weight numeric(6,2) not null,
  reps smallint not null,
  e1rm numeric(7,2),
  source_session_id uuid references public.workout_sessions(id) on delete set null,
  achieved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.pr_history add column if not exists profile_id uuid references public.profiles(id) on delete cascade;
alter table public.pr_history add column if not exists exercise_id uuid references public.exercises(id) on delete cascade;
alter table public.pr_history add column if not exists pr_type text not null default 'weight_reps';
alter table public.pr_history add column if not exists weight numeric(6,2);
alter table public.pr_history add column if not exists reps smallint;
alter table public.pr_history add column if not exists e1rm numeric(7,2);
alter table public.pr_history add column if not exists source_session_id uuid references public.workout_sessions(id) on delete set null;
alter table public.pr_history add column if not exists achieved_at timestamptz not null default now();
alter table public.pr_history add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'pr_history_type_chk') then
    alter table public.pr_history
      add constraint pr_history_type_chk
      check (pr_type in ('weight_reps','e1rm','volume'));
  end if;
end $$;

create index if not exists idx_pr_profile_exercise_time
  on public.pr_history(profile_id, exercise_id, achieved_at desc);

-- ============================================================================
-- 8) FUNZIONI E TRIGGER
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_workout_template_sets_updated_at on public.workout_template_sets;
create trigger trg_workout_template_sets_updated_at
before update on public.workout_template_sets
for each row
execute function public.set_updated_at();

create or replace function public.enforce_premium_template_set()
returns trigger
language plpgsql
as $$
declare
  v_is_premium boolean;
begin
  -- In contesto admin/service (auth.uid null) non blocchiamo.
  if auth.uid() is null then
    return new;
  end if;

  select p.is_premium
  into v_is_premium
  from public.profiles p
  where p.id = auth.uid();

  if coalesce(v_is_premium, false) = false then
    if new.set_type <> 'normal' or coalesce(new.is_premium_feature, false) = true then
      raise exception 'Feature premium: set_type % non consentito per utente free', new.set_type;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_premium_template_set on public.workout_template_sets;
create trigger trg_enforce_premium_template_set
before insert or update on public.workout_template_sets
for each row
execute function public.enforce_premium_template_set();

-- ============================================================================
-- 9) RLS + POLICY
-- ============================================================================

alter table public.workout_templates enable row level security;
alter table public.workout_template_exercises enable row level security;
alter table public.workout_template_sets enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.performed_sets enable row level security;
alter table public.pr_history enable row level security;

-- workout_templates
drop policy if exists workout_templates_select_own on public.workout_templates;
drop policy if exists workout_templates_insert_own on public.workout_templates;
drop policy if exists workout_templates_update_own on public.workout_templates;
drop policy if exists workout_templates_delete_own on public.workout_templates;

create policy workout_templates_select_own on public.workout_templates
for select using (profile_id = auth.uid());

create policy workout_templates_insert_own on public.workout_templates
for insert with check (profile_id = auth.uid());

create policy workout_templates_update_own on public.workout_templates
for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy workout_templates_delete_own on public.workout_templates
for delete using (profile_id = auth.uid());

-- workout_template_exercises
drop policy if exists wte_select_own on public.workout_template_exercises;
drop policy if exists wte_insert_own on public.workout_template_exercises;
drop policy if exists wte_update_own on public.workout_template_exercises;
drop policy if exists wte_delete_own on public.workout_template_exercises;

create policy wte_select_own on public.workout_template_exercises
for select
using (
  exists (
    select 1
    from public.workout_templates wt
    where wt.id = workout_template_exercises.template_id
      and wt.profile_id = auth.uid()
  )
);

create policy wte_insert_own on public.workout_template_exercises
for insert
with check (
  exists (
    select 1
    from public.workout_templates wt
    where wt.id = workout_template_exercises.template_id
      and wt.profile_id = auth.uid()
  )
);

create policy wte_update_own on public.workout_template_exercises
for update
using (
  exists (
    select 1
    from public.workout_templates wt
    where wt.id = workout_template_exercises.template_id
      and wt.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workout_templates wt
    where wt.id = workout_template_exercises.template_id
      and wt.profile_id = auth.uid()
  )
);

create policy wte_delete_own on public.workout_template_exercises
for delete
using (
  exists (
    select 1
    from public.workout_templates wt
    where wt.id = workout_template_exercises.template_id
      and wt.profile_id = auth.uid()
  )
);

-- workout_template_sets
drop policy if exists wts_select_own on public.workout_template_sets;
drop policy if exists wts_insert_own on public.workout_template_sets;
drop policy if exists wts_update_own on public.workout_template_sets;
drop policy if exists wts_delete_own on public.workout_template_sets;

create policy wts_select_own on public.workout_template_sets
for select
using (
  exists (
    select 1
    from public.workout_template_exercises wte
    join public.workout_templates wt on wt.id = wte.template_id
    where wte.id = workout_template_sets.template_exercise_id
      and wt.profile_id = auth.uid()
  )
);

create policy wts_insert_own on public.workout_template_sets
for insert
with check (
  exists (
    select 1
    from public.workout_template_exercises wte
    join public.workout_templates wt on wt.id = wte.template_id
    where wte.id = workout_template_sets.template_exercise_id
      and wt.profile_id = auth.uid()
  )
);

create policy wts_update_own on public.workout_template_sets
for update
using (
  exists (
    select 1
    from public.workout_template_exercises wte
    join public.workout_templates wt on wt.id = wte.template_id
    where wte.id = workout_template_sets.template_exercise_id
      and wt.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workout_template_exercises wte
    join public.workout_templates wt on wt.id = wte.template_id
    where wte.id = workout_template_sets.template_exercise_id
      and wt.profile_id = auth.uid()
  )
);

create policy wts_delete_own on public.workout_template_sets
for delete
using (
  exists (
    select 1
    from public.workout_template_exercises wte
    join public.workout_templates wt on wt.id = wte.template_id
    where wte.id = workout_template_sets.template_exercise_id
      and wt.profile_id = auth.uid()
  )
);

-- workout_sessions
drop policy if exists ws_select_own on public.workout_sessions;
drop policy if exists ws_insert_own on public.workout_sessions;
drop policy if exists ws_update_own on public.workout_sessions;
drop policy if exists ws_delete_own on public.workout_sessions;

create policy ws_select_own on public.workout_sessions
for select using (profile_id = auth.uid());

create policy ws_insert_own on public.workout_sessions
for insert with check (profile_id = auth.uid());

create policy ws_update_own on public.workout_sessions
for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy ws_delete_own on public.workout_sessions
for delete using (profile_id = auth.uid());

-- performed_sets
drop policy if exists ps_select_own on public.performed_sets;
drop policy if exists ps_insert_own on public.performed_sets;
drop policy if exists ps_update_own on public.performed_sets;
drop policy if exists ps_delete_own on public.performed_sets;

create policy ps_select_own on public.performed_sets
for select
using (
  exists (
    select 1
    from public.workout_sessions ws
    where ws.id = performed_sets.session_id
      and ws.profile_id = auth.uid()
  )
);

create policy ps_insert_own on public.performed_sets
for insert
with check (
  exists (
    select 1
    from public.workout_sessions ws
    where ws.id = performed_sets.session_id
      and ws.profile_id = auth.uid()
  )
);

create policy ps_update_own on public.performed_sets
for update
using (
  exists (
    select 1
    from public.workout_sessions ws
    where ws.id = performed_sets.session_id
      and ws.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workout_sessions ws
    where ws.id = performed_sets.session_id
      and ws.profile_id = auth.uid()
  )
);

create policy ps_delete_own on public.performed_sets
for delete
using (
  exists (
    select 1
    from public.workout_sessions ws
    where ws.id = performed_sets.session_id
      and ws.profile_id = auth.uid()
  )
);

-- pr_history
drop policy if exists pr_select_own on public.pr_history;
drop policy if exists pr_insert_own on public.pr_history;
drop policy if exists pr_update_own on public.pr_history;
drop policy if exists pr_delete_own on public.pr_history;

create policy pr_select_own on public.pr_history
for select using (profile_id = auth.uid());

create policy pr_insert_own on public.pr_history
for insert with check (profile_id = auth.uid());

create policy pr_update_own on public.pr_history
for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy pr_delete_own on public.pr_history
for delete using (profile_id = auth.uid());

commit;

-- ============================================================================
-- 10) AUDIT / VERIFICA STATO (RUN DOPO IL COMMIT)
-- ============================================================================

-- 10.1 Tabelle attese
select
  t.table_name,
  case when t.table_name is not null then 'OK' else 'MISSING' end as status
from (
  values
    ('profiles'),
    ('exercises'),
    ('workout_templates'),
    ('workout_template_exercises'),
    ('workout_template_sets'),
    ('workout_sessions'),
    ('performed_sets'),
    ('pr_history')
) as expected(table_name)
left join information_schema.tables t
  on t.table_schema = 'public'
 and t.table_name = expected.table_name
order by expected.table_name;

-- 10.2 Vincoli (PK/FK/UNIQUE/CHECK)
select
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name as foreign_table,
  ccu.column_name as foreign_column
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
left join information_schema.constraint_column_usage ccu
  on tc.constraint_name = ccu.constraint_name
 and tc.table_schema = ccu.table_schema
where tc.table_schema = 'public'
  and tc.table_name in (
    'workout_templates',
    'workout_template_exercises',
    'workout_template_sets',
    'workout_sessions',
    'performed_sets',
    'pr_history'
  )
order by tc.table_name, tc.constraint_type, tc.constraint_name;

-- 10.3 Indici
select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in (
    'exercises',
    'workout_templates',
    'workout_template_exercises',
    'workout_template_sets',
    'workout_sessions',
    'performed_sets',
    'pr_history'
  )
order by tablename, indexname;

-- 10.4 RLS attivo
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'workout_templates',
    'workout_template_exercises',
    'workout_template_sets',
    'workout_sessions',
    'performed_sets',
    'pr_history'
  )
order by tablename;

-- 10.5 Policy presenti
select
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'workout_templates',
    'workout_template_exercises',
    'workout_template_sets',
    'workout_sessions',
    'performed_sets',
    'pr_history'
  )
order by tablename, cmd, policyname;

-- 10.6 Check di coerenza premium (diagnostica)
select
  count(*) as free_users_with_non_normal_sets
from public.workout_template_sets wts
join public.workout_template_exercises wte on wte.id = wts.template_exercise_id
join public.workout_templates wt on wt.id = wte.template_id
join public.profiles p on p.id = wt.profile_id
where coalesce(p.is_premium, false) = false
  and wts.set_type <> 'normal';

-- 10.7 Query performance sample realistiche
-- IMPORTANTE (Supabase "Explain with AI"):
-- seleziona UNA SOLA query EXPLAIN alla volta.
-- Se selezioni piu statement insieme, Supabase mostra:
-- "EXPLAIN only works on a single SQL statement".

-- 10.7.a Test indice (session_id, set_number)
-- Copia e lancia SOLO questo blocco quando usi Explain.
explain analyze
select id, set_number, reps, weight
from public.performed_sets
where session_id = (
  select ps.session_id
  from public.performed_sets ps
  where ps.session_id is not null
  limit 1
)
order by set_number
limit 50;

-- 10.7.b Test indice (exercise_id, performed_at desc)
-- Copia e lancia SOLO questo blocco quando usi Explain.
explain analyze
select id, exercise_id, performed_at, reps, weight
from public.performed_sets
where exercise_id = (
  select ps.exercise_id
  from public.performed_sets ps
  where ps.exercise_id is not null
  limit 1
)
order by performed_at desc
limit 50;
