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

const cache = new Map<string, string>();

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

      const translated = Array.isArray(data)
        ? (data?.[0] || []).map((chunk: any) => (Array.isArray(chunk) ? chunk[0] : '')).join('')
        : '';
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

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL in backend/.env');
  }

  const limitEnv = process.env.TRANSLATE_LIMIT;
  const limit = limitEnv ? Number(limitEnv) : null;
  const delayMs = Number(process.env.TRANSLATE_DELAY_MS || DEFAULT_DELAY_MS);

  const sql = postgres(databaseUrl, { ssl: 'require' });

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

  const toTranslate = limit ? rows.slice(0, limit) : rows;
  console.log(`Da tradurre: ${toTranslate.length} esercizi`);

  let done = 0;
  let failed = 0;

  for (const row of toTranslate) {
    try {
      const sourceName = row.name || '';
      const sourceInstructions = row.instructions || '';

      const manualNameIt = getManualNameOverride(sourceName, 'it');
      const manualNameEs = getManualNameOverride(sourceName, 'es');

      const [nameIt, nameEs, instructionsIt, instructionsEs] = await Promise.all([
        row.name_it || manualNameIt || !sourceName
          ? Promise.resolve(row.name_it || manualNameIt || sourceName)
          : translateText(sourceName, 'it'),
        row.name_es || manualNameEs || !sourceName
          ? Promise.resolve(row.name_es || manualNameEs || sourceName)
          : translateText(sourceName, 'es'),
        row.instructions_it || !sourceInstructions
          ? Promise.resolve(row.instructions_it || sourceInstructions)
          : translateText(sourceInstructions, 'it'),
        row.instructions_es || !sourceInstructions
          ? Promise.resolve(row.instructions_es || sourceInstructions)
          : translateText(sourceInstructions, 'es'),
      ]);

      await sql`
        update public.exercises
        set
          name_it = ${nameIt || null},
          name_es = ${nameEs || null},
          instructions_it = ${instructionsIt || null},
          instructions_es = ${instructionsEs || null}
        where id = ${row.id}
      `;

      done += 1;
      if (done % 10 === 0 || done === toTranslate.length) {
        console.log(`✓ Tradotti ${done}/${toTranslate.length}`);
      }

      if (delayMs > 0) {
        await wait(delayMs);
      }
    } catch (error) {
      failed += 1;
      console.error(`✗ Errore traduzione id ${row.id}:`, error);
    }
  }

  console.log('Traduzione completata');
  console.log(`  Successi: ${done}`);
  console.log(`  Errori: ${failed}`);

  await sql.end();
}

run().catch((err) => {
  console.error('Errore script traduzione:', err);
  process.exit(1);
});
