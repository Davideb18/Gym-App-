export interface Exercise {
  id: string;
  name: string;
  target_muscle?: string | null;
  equipment?: string | null;
  instructions?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  musclewiki_id?: string | null;
  is_custom?: boolean;
  profile_id?: string | null;
  created_at?: string;
}

export interface WorkoutTemplate {
  id: string;
  profile_id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export interface PlannedSet {
  set_number: number;
  type: 'warmup' | 'normal' | 'failure' | 'dropset' | 'backoff' | 'cluster' | 'myo_reps' | 'rest_pause'; // Varie Tecniche di intensità
  reps_min?: number;
  reps_max?: number;
  weight_target?: number; // Es: Target di peso preimpostato (opzionale)
  rir?: number; // Reps in Reserve - PREMIUM
  rest_time_seconds?: number; // PREMIUM
  
  // Props extra per le tecniche di intensità
  dropset_reductions?: number; // Es: fai 2 drop (-20%, -20%)
  
  // Riferimento a Superset/Circuiti
  superset_id?: string; // Se due o più esercizi condividono lo stesso ID, sono eseguiti in superserie.
}

export interface WorkoutTemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  exercise_order: number;
  // Invece di un semplice numero (target_sets: 3), salviamo un array con il piano preciso
  planned_sets: PlannedSet[]; 
  notes?: string | null;
  exercise?: Exercise; // Per inserire i dettagli dell'esercizio nella scheda
}

export interface Workout {
  id: string;
  profile_id: string;
  name?: string | null;
  started_at?: string;
  completed_at?: string | null;
  notes?: string | null;
  total_volume?: number | null;
}

export interface WorkoutSet {
  id: string;
  workout_id: string;
  exercise_id: string;
  reps?: number | null;
  weight?: number | null;
  rpe?: number | null;
  rir?: number | null;
  set_type?: string | null;
  set_order: number;
  created_at?: string;
}
