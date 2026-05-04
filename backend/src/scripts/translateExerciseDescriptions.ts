import 'dotenv/config';
import axios from 'axios';
import postgres from 'postgres';

type ExerciseRow = {
  id: string;
  name: string | null;
  instructions: string | null;
  name_it: string | null;
  name_es: string | null;
  instructions_it: string | null;
  instructions_es: string | null;
};

const DEFAULT_DELAY_MS = 250;
const DEFAULT_RETRIES = 3;
const MAX_TRANSLATE_QUERY_LENGTH = 450;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory cache to avoid translating the same text twice during large translation batches.
const cache = new Map<string, string>();

type QueryExecutor =
  | postgres.Sql<Record<string, unknown>>
  | postgres.TransactionSql<Record<string, unknown>>;

const EXERCISE_NAME_OVERRIDES: Record<string, { it: string; es: string }> = {
  'hammer curl': {
    it: 'Curl a martello',
    es: 'Curl martillo',
  },
};

function getManualNameOverride(name?: string | null, target?: 'it' | 'es'): string | null {
  if (!name || !target) return null;

  const normalized = name.trim().toLowerCase();
  const override = EXERCISE_NAME_OVERRIDES[normalized];
  return override?.[target] || null;
}

function splitTextForTranslate(text: string, maxLen = MAX_TRANSLATE_QUERY_LENGTH): string[] {
  // Break long descriptions into safe chunks so the translation endpoint is not overloaded.
  const normalized = text.trim();
  if (!normalized) return [];
  if (normalized.length <= maxLen) return [normalized];

  const sentenceChunks = normalized
    .split(/(?<=[.!?])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (sentenceChunks.length === 0) return [normalized];

  const result: string[] = [];
  let current = '';

  const flushCurrent = () => {
    if (current.trim()) {
      result.push(current.trim());
      current = '';
    }
  };

  for (const sentence of sentenceChunks) {
    if (sentence.length > maxLen) {
      flushCurrent();

      for (let i = 0; i < sentence.length; i += maxLen) {
        result.push(sentence.slice(i, i + maxLen).trim());
      }

      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > maxLen) {
      flushCurrent();
      current = sentence;
    } else {
      current = candidate;
    }
  }

  flushCurrent();
  return result.length > 0 ? result : [normalized];
}

async function translateText(
  text: string,
  target: 'it' | 'es',
  retries = DEFAULT_RETRIES,
): Promise<string> {
  const normalized = text.trim();
  if (!normalized) {
    return '';
  }

  const chunks = splitTextForTranslate(normalized);
  if (chunks.length > 1) {
    const translatedChunks: string[] = [];
    for (const chunk of chunks) {
      translatedChunks.push(await translateText(chunk, target, retries));
    }
    return translatedChunks.join('\n');
  }

  const key = `${target}:${normalized}`;
  const fromCache = cache.get(key);
  if (fromCache) {
    // Reuse the cached translation when the same sentence appears multiple times in the dataset.
    return fromCache;
  }

  const url = 'https://translate.googleapis.com/translate_a/single';

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const { data } = await axios.get(url, {
        params: {
          client: 'gtx',
          sl: 'en',
          tl: target,
          dt: 't',
          q: normalized,
        },
        timeout: 15000,
      });

      const translatedParts = Array.isArray(data?.[0]) ? data[0] : [];
      const translated = translatedParts
        .map((chunk) => (Array.isArray(chunk) && typeof chunk[0] === 'string' ? chunk[0] : ''))
        .join('');
      if (typeof translated === 'string' && translated.trim()) {
        cache.set(key, translated);
        return translated;
      }
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
    }

    await wait(300 * attempt);
  }

  return normalized;
}

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL in backend/.env');
  }
  return databaseUrl;
}

function resolveTranslationTargetRows(rows: ExerciseRow[]): ExerciseRow[] {
  const limitEnv = process.env.TRANSLATE_LIMIT;
  const limit = limitEnv ? Number(limitEnv) : null;
  return limit ? rows.slice(0, limit) : rows;
}

async function buildTranslatedFields(row: ExerciseRow): Promise<{
  nameIt: string;
  nameEs: string;
  instructionsIt: string;
  instructionsEs: string;
}> {
  const resolveLocalizedValue = async (
    existingValue: string | null,
    sourceValue: string,
    target: 'it' | 'es',
    manualOverride?: string | null,
  ): Promise<string> => {
    if (existingValue) return existingValue;
    if (manualOverride) return manualOverride;
    if (!sourceValue) return sourceValue;
    return translateText(sourceValue, target);
  };

  const sourceName = row.name || '';
  const sourceInstructions = row.instructions || '';

  const manualNameIt = getManualNameOverride(sourceName, 'it');
  const manualNameEs = getManualNameOverride(sourceName, 'es');

  const [nameIt, nameEs, instructionsIt, instructionsEs] = await Promise.all([
    resolveLocalizedValue(row.name_it, sourceName, 'it', manualNameIt),
    resolveLocalizedValue(row.name_es, sourceName, 'es', manualNameEs),
    resolveLocalizedValue(row.instructions_it, sourceInstructions, 'it'),
    resolveLocalizedValue(row.instructions_es, sourceInstructions, 'es'),
  ]);

  return {
    nameIt,
    nameEs,
    instructionsIt,
    instructionsEs,
  };
}

async function updateExerciseTranslation(sql: QueryExecutor, row: ExerciseRow): Promise<void> {
  const translated = await buildTranslatedFields(row);

  await sql`
    update public.exercises
    set
      name_it = ${translated.nameIt || null},
      name_es = ${translated.nameEs || null},
      instructions_it = ${translated.instructionsIt || null},
      instructions_es = ${translated.instructionsEs || null}
    where id = ${row.id}
  `;
}

async function fetchRowsToTranslate(sql: QueryExecutor): Promise<ExerciseRow[]> {
  const rows = await sql<ExerciseRow[]>`
    select id, name, instructions, name_it, name_es, instructions_it, instructions_es
    from public.exercises
    where (name is not null or instructions is not null)
      and (
        name_it is null
        or name_es is null
        or instructions_it is null
        or instructions_es is null
      )
    order by created_at asc nulls last
  `;

  return resolveTranslationTargetRows(rows);
}

async function processTranslations(
  sql: QueryExecutor,
  rows: ExerciseRow[],
  delayMs: number,
): Promise<{ done: number; failed: number }> {
  let done = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      await updateExerciseTranslation(sql, row);
      done += 1;

      if (done % 10 === 0 || done === rows.length) {
        console.log(`✓ Tradotti ${done}/${rows.length}`);
      }

      if (delayMs > 0) {
        await wait(delayMs);
      }
    } catch (error) {
      failed += 1;
      console.error(`✗ Errore traduzione id ${row.id}:`, error);
    }
  }

  return { done, failed };
}

async function run() {
  const databaseUrl = requireDatabaseUrl();
  const delayMs = Number(process.env.TRANSLATE_DELAY_MS || DEFAULT_DELAY_MS);

  const sql = postgres(databaseUrl, { ssl: 'require' });

  const toTranslate = await fetchRowsToTranslate(sql);
  console.log(`Da tradurre: ${toTranslate.length} esercizi`);

  const { done, failed } = await processTranslations(sql, toTranslate, delayMs);

  console.log('Traduzione completata');
  console.log(`  Successi: ${done}`);
  console.log(`  Errori: ${failed}`);

  await sql.end();
}

run().catch((err) => {
  console.error('Errore script traduzione:', err);
  process.exit(1);
});
