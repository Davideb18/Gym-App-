-- ======================================================
-- 🛡️ SCRIPT SICUREZZA DEFINITIVO: "ONE-CLICK RLS" 🛡️
-- ======================================================
-- 1. Vai nello SQL EDITOR di Supabase.
-- 2. Incolla TUTTO questo codice.
-- 3. Clicca su RUN.
-- ======================================================

-- 👤 1. TABELLA: PROFILES
-- Ognuno può leggere e modificare SOLO il proprio profilo.
DROP POLICY IF EXISTS "Profiles Owner Access" ON public.profiles;
CREATE POLICY "Profiles Owner Access" ON public.profiles 
FOR ALL USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 🏋️‍♂️ 2. TABELLA: WORKOUTS
-- Ognuno può gestire (leggere/inserire/modificare) SOLO i propri allenamenti.
DROP POLICY IF EXISTS "Workouts Owner Access" ON public.workouts;
CREATE POLICY "Workouts Owner Access" ON public.workouts 
FOR ALL USING (auth.uid() = profile_id) 
WITH CHECK (auth.uid() = profile_id);

-- 🔢 3. TABELLA: SETS
-- Sicurezza avanzata: puoi gestire un set solo se appartiene a un tuo allenamento.
DROP POLICY IF EXISTS "Sets Owner Access" ON public.sets;
CREATE POLICY "Sets Owner Access" ON public.sets 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.workouts 
    WHERE public.workouts.id = workout_id AND public.workouts.profile_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workouts 
    WHERE public.workouts.id = workout_id AND public.workouts.profile_id = auth.uid()
  )
);

-- 📖 4. TABELLA: EXERCISES
-- Tutti possono leggere gli esercizi, ma nessuno (tranne te dal pannello) può modificarli.
DROP POLICY IF EXISTS "Exercises Public Read" ON public.exercises;
CREATE POLICY "Exercises Public Read" ON public.exercises 
FOR SELECT TO authenticated, anon 
USING (true);

-- ======================================================
-- FINE SCRIPT. Ora le tue "blindature" sono attive al 100%.
-- ======================================================
