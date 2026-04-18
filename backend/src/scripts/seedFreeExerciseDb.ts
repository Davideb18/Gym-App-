import 'dotenv/config';
import axios from 'axios';
import postgres from 'postgres';

interface FreeExerciseDbExercise {
  id: string;
  name: string;
  force?: string | null;
  level?: string | null;
  mechanic?: string | null;
  equipment?: string | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  category?: string | null;
  images?: string[];
}

const DATASET_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const RAW_IMAGE_PREFIX =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL in backend/.env');
  }

  const sql = postgres(databaseUrl, { ssl: 'require' });

  console.log('1/4 Pulizia tabella exercises...');
  await sql`delete from public.exercises`;
  console.log('✓ Tabella exercises pulita');

  console.log('2/4 Download dataset free-exercise-db...');
  const response = await axios.get<FreeExerciseDbExercise[]>(DATASET_URL, {
    timeout: 60000,
  });
  const source = response.data;
  console.log(`✓ Scaricati ${source.length} esercizi`);

  console.log('3/4 Mapping dataset -> schema DB attuale...');
  const rows = source.map((ex) => {
    const images = Array.isArray(ex.images) ? ex.images : [];
    const preferredImagePath = images[1] ?? images[0] ?? null;
    const imageUrl = preferredImagePath ? `${RAW_IMAGE_PREFIX}${preferredImagePath}` : null;

    const primary = ex.primaryMuscles?.[0] ?? null;
    const secondary = ex.secondaryMuscles?.length ? ex.secondaryMuscles.join(', ') : null;
    const instructions = ex.instructions?.length ? ex.instructions.join('\n') : null;

    let difficulty: string | null = null;
    if (ex.level === 'beginner') difficulty = 'novice';
    if (ex.level === 'intermediate') difficulty = 'intermediate';
    if (ex.level === 'expert') difficulty = 'advanced';

    return {
      name: ex.name,
      target_muscle: primary,
      equipment: ex.equipment ?? null,
      instructions,
      image_url: imageUrl,
      musclewiki_id: ex.id,
      is_custom: false,
      profile_id: null,
      is_premium_only: false,
      video_url: null,
      difficulty,
      force: ex.force ?? null,
      mechanic: ex.mechanic ?? null,
      videos_data: images.length
        ? JSON.stringify(images.map((p) => `${RAW_IMAGE_PREFIX}${p}`))
        : null,
      secondary_muscles: secondary,
    };
  });

  console.log('4/4 Insert batch nel DB...');
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    for (const row of batch) {
      await sql`
        insert into public.exercises (
          name,
          target_muscle,
          equipment,
          instructions,
          image_url,
          musclewiki_id,
          is_custom,
          profile_id,
          is_premium_only,
          video_url,
          difficulty,
          force,
          mechanic,
          videos_data,
          secondary_muscles
        ) values (
          ${row.name},
          ${row.target_muscle},
          ${row.equipment},
          ${row.instructions},
          ${row.image_url},
          ${row.musclewiki_id},
          ${row.is_custom},
          ${row.profile_id},
          ${row.is_premium_only},
          ${row.video_url},
          ${row.difficulty},
          ${row.force},
          ${row.mechanic},
          ${row.videos_data ? JSON.parse(row.videos_data) : null},
          ${row.secondary_muscles}
        )
      `;
    }

    inserted += batch.length;
    console.log(`   • ${inserted}/${rows.length}`);
  }

  const totalResult = await sql<
    { total: number }[]
  >`select count(*)::int as total from public.exercises`;
  const withImagesResult = await sql<{ with_images: number }[]>`
    select count(*)::int as with_images from public.exercises where image_url is not null
  `;
  const total = totalResult[0]?.total ?? 0;
  const withImages = withImagesResult[0]?.with_images ?? 0;

  console.log('✓ Import completato');
  console.log(`  Totale exercises: ${total}`);
  console.log(`  Con immagine: ${withImages}`);

  await sql.end();
}

run().catch((err) => {
  console.error('Errore seed:', err);
  process.exit(1);
});
