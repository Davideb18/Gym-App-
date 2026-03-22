-- ESERCIZI BASE MUSCLEWIKI (DA INSERIRE MANUALMENTE NEL SITO PER TESTARE L'APP)
-- Copia e Incolla tutto questo blocco nel tab "SQL Editor" su Supabase e clicca RUN.
-- IMPORTANTE: Questo script prima SVUOTA la tabella attuale per rimuovere i 62+ esercizi sporchi
-- e inserisce SOLO quelli puliti e completi di video.

DELETE FROM public.exercises;

INSERT INTO public.exercises (name, target_muscle, equipment, instructions, musclewiki_id, image_url, video_url, is_premium_only, difficulty)
VALUES 
-- CHEST / PETTO
('Barbell Bench Press', 'Chest', 'Barbell', 
'1. Lie flat on the bench. 2. Grip the bar shoulder-width apart. 3. Lower the bar to your mid-chest. 4. Press upwards.', 
'mw_1001', 
'https://musclewiki.com/media/uploads/barbell-bench-press-front.png',
'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
false,
'intermediate'),

('Incline Dumbbell Press', 'Chest', 'Dumbbell', 
'1. Set bench to 30-45 degrees. 2. Press dumbbells up and together. 3. Lower with control.', 
'mw_1002', 
'https://musclewiki.com/media/uploads/dumbbell-incline-press-front.png',
'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
false,
'novice'),

-- BACK / SCHIENA
('Pull-ups', 'Lats', 'Bodyweight', 
'1. Grab the pull-up bar with an overhand grip. 2. Pull yourself up until your chin clears the bar. 3. Lower down under control.', 
'mw_1003', 
'https://musclewiki.com/media/uploads/pullap-front.png',
'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
false,
'intermediate'),

('Barbell Deadlift', 'Lower Back', 'Barbell', 
'1. Stand with feet hip-width. 2. Grip bar outside knees. 3. Keep back straight, lift by pushing through floor.', 
'mw_1004', 
'https://musclewiki.com/media/uploads/deadlift-front.png',
'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
false,
'advanced'),

-- LEGS / GAMBE
('Barbell Squat', 'Quads', 'Barbell', 
'1. Unrack bar across upper back. 2. Squat down until thighs are parallel to floor. 3. Drive back up.', 
'mw_1005', 
'https://musclewiki.com/media/uploads/barbell-squat-front.png',
'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
false,
'intermediate'),

('Leg Press', 'Quads', 'Machine', 
'1. Sit on machine, feet shoulder-width on platform. 2. Lower platform until knees are 90 degrees. 3. Push back up.', 
'mw_1006', 
'https://musclewiki.com/media/uploads/leg-press-front.png',
'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
false,
'novice'),

-- SHOULDERS / SPALLE
('Overhead Dumbbell Press', 'Shoulders', 'Dumbbell', 
'1. Sit on a bench with back support. 2. Press dumbbells overhead until arms are straight. 3. Lower to shoulder level.', 
'mw_1007', 
'https://musclewiki.com/media/uploads/dumbbell-shoulder-press-front.png',
'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
false,
'intermediate'),

('Lateral Raises', 'Shoulders', 'Dumbbell', 
'1. Stand holding dumbbells. 2. Raise arms out to sides until parallel with floor. 3. Lower slowly.', 
'mw_1008', 
'https://musclewiki.com/media/uploads/dumbbell-lateral-raise-front.png',
'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
false,
'novice'),

-- ARMS / BRACCIA
('Dumbbell Bicep Curl', 'Biceps', 'Dumbbell', 
'1. Stand holding dumbbells. 2. Curl weights up towards shoulders, keeping elbows pinned to sides.', 
'mw_1009', 
'https://musclewiki.com/media/uploads/dumbbell-curl-front.png',
'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
false,
'novice'),

('Tricep Cable Pushdown', 'Triceps', 'Cable', 
'1. Use a rope or straight bar attachment. 2. Keep elbows tucked. 3. Push down until arms are fully extended.', 
'mw_1010', 
'https://musclewiki.com/media/uploads/cable-pushdown-front.png',
'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
false,
'novice'),

-- CORE / ADDOME
('Cable Crunch', 'Abs', 'Cable', 
'1. Kneel below a high pulley. 2. Hold rope behind your neck. 3. Crunch torso downwards.', 
'mw_1011', 
'https://musclewiki.com/media/uploads/cable-crunch-front.png',
'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
false,
'novice'),

('Plank', 'Abs', 'Bodyweight', 
'1. Rest on forearms and toes. 2. Keep body in a perfectly straight line. 3. Hold position.', 
'mw_1012', 
'https://musclewiki.com/media/uploads/plank-front.png',
'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
false,
'novice')

ON CONFLICT (name) DO UPDATE SET 
  target_muscle = EXCLUDED.target_muscle,
  equipment = EXCLUDED.equipment,
  image_url = EXCLUDED.image_url,
  video_url = EXCLUDED.video_url,
  instructions = EXCLUDED.instructions,
  difficulty = EXCLUDED.difficulty;
