import 'dotenv/config';
import postgres from 'postgres';

type QueryExecutor =
  | postgres.Sql<Record<string, unknown>>
  | postgres.TransactionSql<Record<string, unknown>>;

type ExerciseRow = {
  id: string;
  name: string;
  target_muscle: string | null;
};

type SessionPlan = {
  templateName: string;
  dayOffset: number;
  durationSeconds: number;
  performanceStep: number;
};

type TemplateExerciseEntry = {
  exerciseId: string;
  reps: readonly [number, number];
  rest: number;
  base: number;
  inc: number;
};

type TemplateReference = {
  id: string;
  exercises: TemplateExerciseEntry[];
};

const SEED_TAG = '[SEED-DAVE]';

const TEMPLATE_PLANS = [
  {
    name: 'Dave - Push / No Excuses',
    description: `${SEED_TAG} Push focus with progressive overload`,
    exercises: [
      {
        patterns: ['bench', 'chest press', 'panca'],
        targetMuscle: 'chest',
        reps: [6, 8],
        rest: 150,
        base: 50,
        inc: 1.25,
      },
      {
        patterns: ['incline', 'chest'],
        targetMuscle: 'chest',
        reps: [8, 10],
        rest: 120,
        base: 22,
        inc: 1.0,
      },
      {
        patterns: ['shoulder press', 'overhead', 'military'],
        targetMuscle: 'shoulders',
        reps: [6, 8],
        rest: 120,
        base: 32,
        inc: 1.0,
      },
      {
        patterns: ['lateral raise'],
        targetMuscle: 'shoulders',
        reps: [12, 15],
        rest: 75,
        base: 10,
        inc: 0.5,
      },
      {
        patterns: ['triceps', 'pushdown', 'extension'],
        targetMuscle: 'triceps',
        reps: [10, 12],
        rest: 75,
        base: 18,
        inc: 0.75,
      },
    ],
  },
  {
    name: 'Dave - Pull / Keep It Tight',
    description: `${SEED_TAG} Pull focus with back + biceps`,
    exercises: [
      {
        patterns: ['pull up', 'pulldown', 'lat'],
        targetMuscle: 'lats',
        reps: [6, 8],
        rest: 135,
        base: 45,
        inc: 1.25,
      },
      {
        patterns: ['row', 'rematore', 'cable row'],
        targetMuscle: 'middle back',
        reps: [8, 10],
        rest: 120,
        base: 42,
        inc: 1.0,
      },
      {
        patterns: ['barbell row', 'bent over'],
        targetMuscle: 'middle back',
        reps: [6, 8],
        rest: 135,
        base: 48,
        inc: 1.25,
      },
      {
        patterns: ['face pull'],
        targetMuscle: 'traps',
        reps: [12, 15],
        rest: 75,
        base: 20,
        inc: 0.5,
      },
      {
        patterns: ['curl', 'biceps'],
        targetMuscle: 'biceps',
        reps: [10, 12],
        rest: 75,
        base: 14,
        inc: 0.5,
      },
    ],
  },
  {
    name: 'Dave - Legs / Heavy Mood',
    description: `${SEED_TAG} Legs focus with squat pattern`,
    exercises: [
      {
        patterns: ['squat', 'hack squat'],
        targetMuscle: 'quadriceps',
        reps: [5, 7],
        rest: 165,
        base: 80,
        inc: 2.5,
      },
      {
        patterns: ['romanian deadlift', 'rdl', 'deadlift'],
        targetMuscle: 'hamstrings',
        reps: [6, 8],
        rest: 150,
        base: 85,
        inc: 2.0,
      },
      {
        patterns: ['leg press'],
        targetMuscle: 'quadriceps',
        reps: [10, 12],
        rest: 120,
        base: 130,
        inc: 5.0,
      },
      {
        patterns: ['leg curl'],
        targetMuscle: 'hamstrings',
        reps: [10, 12],
        rest: 90,
        base: 36,
        inc: 1.0,
      },
      {
        patterns: ['calf', 'calves'],
        targetMuscle: 'calves',
        reps: [12, 15],
        rest: 75,
        base: 55,
        inc: 1.5,
      },
    ],
  },
] as const;

const SESSION_PLAN: SessionPlan[] = [
  {
    templateName: 'Dave - Push / No Excuses',
    dayOffset: 42,
    durationSeconds: 3600,
    performanceStep: 0,
  },
  {
    templateName: 'Dave - Pull / Keep It Tight',
    dayOffset: 40,
    durationSeconds: 3500,
    performanceStep: 0,
  },
  {
    templateName: 'Dave - Legs / Heavy Mood',
    dayOffset: 38,
    durationSeconds: 3900,
    performanceStep: 0,
  },
  {
    templateName: 'Dave - Push / No Excuses',
    dayOffset: 28,
    durationSeconds: 3550,
    performanceStep: 1,
  },
  {
    templateName: 'Dave - Pull / Keep It Tight',
    dayOffset: 26,
    durationSeconds: 3450,
    performanceStep: 1,
  },
  {
    templateName: 'Dave - Legs / Heavy Mood',
    dayOffset: 24,
    durationSeconds: 3850,
    performanceStep: 1,
  },
  {
    templateName: 'Dave - Push / No Excuses',
    dayOffset: 14,
    durationSeconds: 3500,
    performanceStep: 2,
  },
  {
    templateName: 'Dave - Pull / Keep It Tight',
    dayOffset: 12,
    durationSeconds: 3400,
    performanceStep: 2,
  },
  {
    templateName: 'Dave - Legs / Heavy Mood',
    dayOffset: 10,
    durationSeconds: 3800,
    performanceStep: 2,
  },
  {
    templateName: 'Dave - Push / No Excuses',
    dayOffset: 6,
    durationSeconds: 3450,
    performanceStep: 3,
  },
  {
    templateName: 'Dave - Pull / Keep It Tight',
    dayOffset: 4,
    durationSeconds: 3350,
    performanceStep: 3,
  },
  {
    templateName: 'Dave - Legs / Heavy Mood',
    dayOffset: 2,
    durationSeconds: 3750,
    performanceStep: 3,
  },
];

function addDays(base: Date, daysToSubtract: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() - daysToSubtract);
  return d;
}

function formatLike(value: string): string {
  return `%${value.toLowerCase()}%`;
}

async function findDaveProfileId(sql: QueryExecutor): Promise<string> {
  const rows = await sql<
    { id: string; email: string | null; full_name: string | null; name: string | null }[]
  >`
    select
      p.id,
      u.email,
      u.raw_user_meta_data->>'full_name' as full_name,
      u.raw_user_meta_data->>'name' as name
    from public.profiles p
    left join auth.users u on u.id = p.id
    where
      lower(coalesce(u.email, '')) like ${'%dave%'}
      or lower(coalesce(u.raw_user_meta_data->>'full_name', '')) like ${'%dave%'}
      or lower(coalesce(u.raw_user_meta_data->>'name', '')) like ${'%dave%'}
    order by u.created_at asc nulls last
    limit 1
  `;

  if (!rows[0]?.id) {
    const candidates = await sql<
      { id: string; email: string | null; full_name: string | null; name: string | null }[]
    >`
      select
        p.id,
        u.email,
        u.raw_user_meta_data->>'full_name' as full_name,
        u.raw_user_meta_data->>'name' as name
      from public.profiles p
      left join auth.users u on u.id = p.id
      order by u.created_at desc nulls last
      limit 10
    `;

    const printable = candidates
      .map((c) => `${c.id} | ${c.email ?? 'no-email'} | ${c.full_name ?? c.name ?? 'no-name'}`)
      .join('\n');

    throw new Error(`Nessun profilo Dave trovato. Profili recenti:\n${printable}`);
  }

  return rows[0].id;
}

async function pickExercise(
  sql: QueryExecutor,
  patterns: readonly string[],
  targetMuscle: string,
): Promise<ExerciseRow> {
  for (const p of patterns) {
    const found = await sql<ExerciseRow[]>`
      select id, name, target_muscle
      from public.exercises
      where lower(name) like ${formatLike(p)}
      order by created_at asc
      limit 1
    `;
    if (found[0]) return found[0];
  }

  const byTarget = await sql<ExerciseRow[]>`
    select id, name, target_muscle
    from public.exercises
    where lower(coalesce(target_muscle, '')) like ${formatLike(targetMuscle)}
    order by created_at asc
    limit 1
  `;
  if (byTarget[0]) return byTarget[0];

  const fallback = await sql<ExerciseRow[]>`
    select id, name, target_muscle
    from public.exercises
    order by created_at asc
    limit 1
  `;
  if (!fallback[0]) {
    throw new Error('Tabella exercises vuota: impossibile creare template/workout');
  }
  return fallback[0];
}

async function cleanupPreviousSeed(sql: QueryExecutor, profileId: string): Promise<void> {
  const templates = (await sql<{ id: string }[]>`
    select id
    from public.workout_templates
    where profile_id = ${profileId}
      and coalesce(description, '') like ${`${SEED_TAG}%`}
  `) as Array<{ id: string }>;

  const templateIds = templates.map((t) => t.id);
  if (templateIds.length > 0) {
    const sessions = (await sql<{ id: string }[]>`
      select id
      from public.workout_sessions
      where template_id = any(${sql.array(templateIds)}::uuid[])
    `) as Array<{ id: string }>;

    const sessionIds = sessions.map((s) => s.id);
    if (sessionIds.length > 0) {
      await sql`delete from public.performed_sets where session_id = any(${sql.array(sessionIds)}::uuid[])`;
      await sql`delete from public.workout_sessions where id = any(${sql.array(sessionIds)}::uuid[])`;
    }

    const templateExercises = (await sql<{ id: string }[]>`
      select id
      from public.workout_template_exercises
      where template_id = any(${sql.array(templateIds)}::uuid[])
    `) as Array<{ id: string }>;

    const teIds = templateExercises.map((x) => x.id);
    if (teIds.length > 0) {
      await sql`delete from public.workout_template_sets where template_exercise_id = any(${sql.array(teIds)}::uuid[])`;
      await sql`delete from public.workout_template_exercises where id = any(${sql.array(teIds)}::uuid[])`;
    }

    await sql`delete from public.workout_templates where id = any(${sql.array(templateIds)}::uuid[])`;
  }
}

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL in backend/.env');
  }
  return databaseUrl;
}

async function createTemplateExercise(
  tx: QueryExecutor,
  templateId: string,
  order: number,
  planExercise: (typeof TEMPLATE_PLANS)[number]['exercises'][number],
): Promise<TemplateExerciseEntry> {
  const picked = await pickExercise(tx, planExercise.patterns, planExercise.targetMuscle);

  const templateExerciseRows = await tx<{ id: string }[]>`
    insert into public.workout_template_exercises (template_id, exercise_id, exercise_order, notes)
    values (${templateId}, ${picked.id}, ${order}, null)
    returning id
  `;
  const templateExercise = templateExerciseRows[0];
  if (!templateExercise) {
    throw new Error(`Impossibile creare il template exercise per ${picked.name}`);
  }

  for (let setNum = 1; setNum <= 3; setNum += 1) {
    await tx`
      insert into public.workout_template_sets (
        template_exercise_id,
        set_number,
        set_type,
        target_reps_min,
        target_reps_max,
        target_weight,
        rest_seconds,
        is_premium_feature
      ) values (
        ${templateExercise.id},
        ${setNum},
        'normal',
        ${planExercise.reps[0]},
        ${planExercise.reps[1]},
        ${Number((planExercise.base + (setNum - 1) * planExercise.inc).toFixed(2))},
        ${planExercise.rest},
        false
      )
    `;
  }

  return {
    exerciseId: picked.id,
    reps: planExercise.reps,
    rest: planExercise.rest,
    base: planExercise.base,
    inc: planExercise.inc,
  };
}

async function createTemplate(
  tx: QueryExecutor,
  profileId: string,
  plan: (typeof TEMPLATE_PLANS)[number],
): Promise<TemplateReference> {
  const templateRows = await tx<{ id: string }[]>`
    insert into public.workout_templates (profile_id, name, description)
    values (${profileId}, ${plan.name}, ${plan.description})
    returning id
  `;
  const template = templateRows[0];
  if (!template) {
    throw new Error(`Impossibile creare il template ${plan.name}`);
  }

  const exerciseEntries: TemplateExerciseEntry[] = [];
  let order = 1;
  for (const ex of plan.exercises) {
    const created = await createTemplateExercise(tx, template.id, order, ex);
    exerciseEntries.push(created);
    order += 1;
  }

  return {
    id: template.id,
    exercises: exerciseEntries,
  };
}

async function createSeedTemplates(
  tx: QueryExecutor,
  profileId: string,
): Promise<Map<string, TemplateReference>> {
  const templateByName = new Map<string, TemplateReference>();

  for (const plan of TEMPLATE_PLANS) {
    const created = await createTemplate(tx, profileId, plan);
    templateByName.set(plan.name, created);
  }

  return templateByName;
}

async function createPerformedSetsForSession(
  tx: QueryExecutor,
  sessionId: string,
  startedAt: Date,
  sessionPlan: SessionPlan,
  templateRef: TemplateReference,
): Promise<number> {
  let totalVolume = 0;
  let minuteOffset = 0;

  for (const ex of templateRef.exercises) {
    for (let setNumber = 1; setNumber <= 3; setNumber += 1) {
      const reps = Math.max(ex.reps[0], ex.reps[1] - (setNumber - 1));
      const weight = Number(
        (ex.base + sessionPlan.performanceStep * ex.inc * 2 + (setNumber - 1) * ex.inc).toFixed(2),
      );
      const performedAt = new Date(startedAt.getTime() + minuteOffset * 60 * 1000);
      minuteOffset += 3;

      totalVolume += reps * weight;

      await tx`
        insert into public.performed_sets (
          session_id,
          exercise_id,
          set_number,
          set_type,
          reps,
          weight,
          rpe,
          rir,
          rest_real_seconds,
          is_completed,
          performed_at
        ) values (
          ${sessionId},
          ${ex.exerciseId},
          ${setNumber},
          'normal',
          ${reps},
          ${weight},
          ${Number((7.5 + setNumber * 0.3).toFixed(1))},
          ${Math.max(0, 3 - setNumber)},
          ${ex.rest},
          true,
          ${performedAt.toISOString()}
        )
      `;
    }
  }

  return Number(totalVolume.toFixed(2));
}

async function createSeedSession(
  tx: QueryExecutor,
  profileId: string,
  now: Date,
  sessionPlan: SessionPlan,
  templateRef: TemplateReference,
): Promise<void> {
  const startedAt = addDays(now, sessionPlan.dayOffset);
  const completedAt = new Date(startedAt.getTime() + sessionPlan.durationSeconds * 1000);

  const sessionRows = await tx<{ id: string }[]>`
    insert into public.workout_sessions (
      profile_id,
      template_id,
      status,
      started_at,
      completed_at,
      duration_seconds,
      total_volume,
      notes
    ) values (
      ${profileId},
      ${templateRef.id},
      'completed',
      ${startedAt.toISOString()},
      ${completedAt.toISOString()},
      ${sessionPlan.durationSeconds},
      ${0},
      null
    )
    returning id
  `;
  const session = sessionRows[0];
  if (!session) {
    throw new Error(`Impossibile creare la sessione per ${sessionPlan.templateName}`);
  }

  const totalVolume = await createPerformedSetsForSession(
    tx,
    session.id,
    startedAt,
    sessionPlan,
    templateRef,
  );

  await tx`
    update public.workout_sessions
    set total_volume = ${totalVolume}
    where id = ${session.id}
  `;
}

async function createSeedSessions(
  tx: QueryExecutor,
  profileId: string,
  templateByName: Map<string, TemplateReference>,
): Promise<void> {
  const now = new Date();

  for (const sessionPlan of SESSION_PLAN) {
    const templateRef = templateByName.get(sessionPlan.templateName);
    if (!templateRef) continue;
    await createSeedSession(tx, profileId, now, sessionPlan, templateRef);
  }
}

async function printSeedSummary(sql: QueryExecutor, profileId: string): Promise<void> {
  const [tplCount] = await sql<{ total: number }[]>`
    select count(*)::int as total
    from public.workout_templates
    where profile_id = ${profileId}
      and coalesce(description, '') like ${`${SEED_TAG}%`}
  `;

  const [sessionCount] = await sql<{ total: number }[]>`
    select count(*)::int as total
    from public.workout_sessions
    where profile_id = ${profileId}
      and template_id in (
        select id from public.workout_templates
        where profile_id = ${profileId}
          and coalesce(description, '') like ${`${SEED_TAG}%`}
      )
  `;

  const [setCount] = await sql<{ total: number }[]>`
    select count(*)::int as total
    from public.performed_sets ps
    join public.workout_sessions ws on ws.id = ps.session_id
    where ws.profile_id = ${profileId}
      and ws.template_id in (
        select id from public.workout_templates
        where profile_id = ${profileId}
          and coalesce(description, '') like ${`${SEED_TAG}%`}
      )
  `;

  console.log('Seed completato con successo');
  console.log(`Profile Dave: ${profileId}`);
  console.log(`Templates creati: ${tplCount?.total ?? 0}`);
  console.log(`Sessioni completate create: ${sessionCount?.total ?? 0}`);
  console.log(`Performed sets creati: ${setCount?.total ?? 0}`);
}

async function run() {
  const databaseUrl = requireDatabaseUrl();
  const sql = postgres(databaseUrl, { ssl: 'require' });

  try {
    const profileId = await findDaveProfileId(sql);

    await sql.begin(async (tx) => {
      await cleanupPreviousSeed(tx, profileId);

      const templateByName = await createSeedTemplates(tx, profileId);
      await createSeedSessions(tx, profileId, templateByName);
    });
    await printSeedSummary(sql, profileId);
  } finally {
    await sql.end();
  }
}

run().catch((err) => {
  console.error('Errore seed Dave:', err);
  process.exit(1);
});
