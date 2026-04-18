import 'dotenv/config';
import postgres from 'postgres';

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL in backend/.env');
  }

  const sql = postgres(databaseUrl, { ssl: 'require' });

  console.log('Aggiunta colonne traduzione su public.exercises...');

  await sql`
    alter table public.exercises
      add column if not exists name_it text,
      add column if not exists name_es text,
      add column if not exists instructions_it text,
      add column if not exists instructions_es text
  `;

  await sql`create index if not exists idx_exercises_name_it on public.exercises (name_it)`;
  await sql`create index if not exists idx_exercises_name_es on public.exercises (name_es)`;

  console.log('✓ Colonne traduzione pronte');
  await sql.end();
}

run().catch((err) => {
  console.error('Errore migrazione colonne traduzione:', err);
  process.exit(1);
});
