# Supabase Semplice (Step By Step)

Obiettivo: avere un database pulito, scalabile e facile da usare senza confusione.

## 1) Cosa usare e cosa ignorare

### Usa queste tabelle (modello nuovo)
1. `profiles`
2. `exercises`
3. `workout_templates`
4. `workout_template_exercises`
5. `workout_template_sets`
6. `workout_sessions`
7. `performed_sets`
8. `pr_history`

### Legacy (non usare per nuove feature)
1. `workouts`
2. `sets`
3. `workout_template_exercises.planned_sets` (solo compatibilita temporanea)

## 2) Cosa hai gia fatto

Hai gia uno script completo pronto:
`docs/sql/WORKOUT_SCHEMA_SETUP_AND_AUDIT.sql`

Serve per:
1. creare/allineare schema
2. applicare vincoli/indici
3. attivare RLS/policy
4. verificare tutto

## 3) Procedura in 3 run (semplice)

### Run A: setup
1. Apri Supabase -> SQL Editor.
2. Apri `WORKOUT_SCHEMA_SETUP_AND_AUDIT.sql`.
3. Esegui lo script completo con `Run`.
4. Se non vedi errori rossi: setup OK.

### Run B: verifica base
Esegui queste query una alla volta (Run normale, NON Explain):

```sql
-- Tabelle presenti
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
```

```sql
-- RLS attivo
select
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
```

```sql
-- Policy presenti
select
  tablename,
  policyname,
  cmd
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
```

```sql
-- Controllo premium
select
  count(*) as free_users_with_non_normal_sets
from public.workout_template_sets wts
join public.workout_template_exercises wte on wte.id = wts.template_exercise_id
join public.workout_templates wt on wt.id = wte.template_id
join public.profiles p on p.id = wt.profile_id
where coalesce(p.is_premium, false) = false
  and wts.set_type <> 'normal';
```

Risultato atteso:
1. tutte le tabelle = `OK`
2. `rowsecurity = true` per tutte
3. policy presenti
4. `free_users_with_non_normal_sets = 0`

### Run C: performance (opzionale)
Quando usi Explain in Supabase, seleziona UNA query alla volta.

```sql
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
```

```sql
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
```

## 4) Come pensare il flusso dati (semplice)

1. Crei scheda -> `workout_templates`
2. Aggiungi esercizi -> `workout_template_exercises`
3. Definisci set -> `workout_template_sets`
4. Parti con allenamento -> `workout_sessions`
5. Salvi ogni set fatto -> `performed_sets`
6. Aggiorni PR -> `pr_history`

## 5) Regola Free vs Premium

1. Free puo salvare solo `set_type = 'normal'`
2. Premium puo salvare tecniche avanzate
3. Questa regola e bloccata anche a livello DB (trigger), non solo UI

## 6) Cosa fare dopo (in codice app)

1. usare `workout_template_sets` come fonte vera dei set
2. smettere di usare `planned_sets` per nuove feature
3. usare `workout_sessions` + `performed_sets` per tracking live
