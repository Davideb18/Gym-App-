-- Esegui questo nel pannello SQL Editor di Supabase

-- 1. SVUOTA LA TABELLA ESERCIZI VECCHI (e a cascata rimuove le referenze nelle schede vecchie)
TRUNCATE TABLE public.exercises CASCADE;

-- 2. Aggiunge le colonne mancanti per catturare tutti i dettagli di MuscleWiki
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS force text,
ADD COLUMN IF NOT EXISTS mechanic text,
ADD COLUMN IF NOT EXISTS videos_data jsonb,
ADD COLUMN IF NOT EXISTS secondary_muscles text;

-- (Opzionale: permettiamo valori null a difficulty che magari MuscleWiki ha scritti in modo diverso)
-- Se avevi un CHECK su difficulty ('novice','intermediate','advanced'), aggiungiamo 'beginner' che usa MuscleWiki
ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_difficulty_chk;

ALTER TABLE public.exercises ADD CONSTRAINT exercises_difficulty_chk 
CHECK (difficulty IS NULL OR LOWER(difficulty) IN ('novice','beginner','intermediate','advanced'));
