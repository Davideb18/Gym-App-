export type DifficultyLevel = 'novice' | 'intermediate' | 'advanced';

export type SetType =
  | 'warmup'
  | 'normal'
  | 'failure'
  | 'dropset'
  | 'backoff'
  | 'cluster'
  | 'myo_reps'
  | 'rest_pause';

export type SessionStatus = 'in_progress' | 'completed' | 'cancelled';

export type PrType = 'weight_reps' | 'e1rm' | 'volume';

// =====================
// BASE ENTITIES
// =====================

export interface Profile {
  id: string;
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  is_premium?: boolean;
  updated_at?: string;
}

export interface Exercise {
  id: string;
  name: string;
  target_muscle?: string | null;
  equipment?: string | null;
  instructions?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  is_custom?: boolean;
  profile_id?: string | null;
  is_premium_only?: boolean;
  created_at?: string;
  difficulty?: DifficultyLevel | null;
  category?: string | null;
}

// =====================
// TEMPLATE MODEL
// =====================

export interface WorkoutTemplate {
  id: string;
  profile_id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  workout_template_exercises?: WorkoutTemplateExercise[];
}

// Legacy JSON model kept for backward compatibility while migrating.
export interface PlannedSet {
  set_number: number;
  type: SetType;
  reps_min?: number;
  reps_max?: number;
  weight_target?: number;
  rir?: number;
  rest_time_seconds?: number;
  dropset_reductions?: number;
  superset_id?: string;
}

export interface WorkoutTemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  exercise_order: number;
  workout_template_sets?: WorkoutTemplateSet[]; // L'array relazionale (i figli)
  exercises?: Exercise; // L'oggetto unito (la reference per avere il nome dell'esercizio!)
  notes?: string;
  created_at: string;
  planned_sets?: PlannedSet[];
}

export interface WorkoutTemplateSet {
  id: string;
  template_exercise_id: string;
  set_number: number;
  set_type: SetType;
  target_reps_min?: number | null;
  target_reps_max?: number | null;
  target_rpe?: number | null;
  target_rir?: number | null;
  target_weight?: number | null;
  rest_seconds: number;
  intensity_payload?: Record<string, unknown> | null;
  is_premium_feature: boolean;
  created_at?: string;
  updated_at?: string;
}

// =====================
// LIVE SESSION MODEL
// =====================

export interface WorkoutSession {
  id: string;
  profile_id: string;
  template_id?: string | null;
  status: SessionStatus;
  started_at: string;
  completed_at?: string | null;
  duration_seconds?: number | null;
  total_volume?: number | null;
  notes?: string | null;
  created_at?: string;
}

export interface PerformedSet {
  id: string;
  session_id: string;
  exercise_id: string;
  template_set_id?: string | null;
  set_number: number;
  set_type: SetType;
  reps?: number | null;
  weight?: number | null;
  rpe?: number | null;
  rir?: number | null;
  rest_real_seconds?: number | null;
  intensity_payload?: Record<string, unknown> | null;
  is_completed: boolean;
  performed_at: string;
  created_at?: string;
}

export interface PrHistoryRecord {
  id: string;
  profile_id: string;
  exercise_id: string;
  pr_type: PrType;
  weight: number;
  reps: number;
  e1rm?: number | null;
  source_session_id?: string | null;
  achieved_at: string;
  created_at?: string;
}

// =====================
// LEGACY ALIASES
// =====================

// Legacy names used in older app code.
export type Workout = WorkoutSession;

export interface WorkoutSet {
  id: string;
  workout_id: string;
  exercise_id: string;
  reps?: number | null;
  weight?: number | null;
  rpe?: number | null;
  rir?: number | null;
  set_type?: SetType | null;
  set_order: number;
  created_at?: string;
}

// =====================
// POSE COACH MODEL
// =====================

export type PoseCoachMode = 'intro' | 'calibration' | 'tracking' | 'summary' | 'error';

// Gym-focused keypoints only: no face landmarks, no finger landmarks, no foot landmarks.
export type PoseJointName =
  | 'left_shoulder'
  | 'right_shoulder'
  | 'left_elbow'
  | 'right_elbow'
  | 'left_wrist'
  | 'right_wrist'
  | 'left_hip'
  | 'right_hip'
  | 'left_knee'
  | 'right_knee';

export type PoseErrorCode =
  | 'back_rounding'
  | 'back_overextension'
  | 'insufficient_depth'
  | 'knee_valgus'
  | 'uneven_bar_path'
  | 'elbow_flare'
  | 'elbow_drift'
  | 'wrist_collapse'
  | 'hip_shift'
  | 'tempo_too_fast';

export type PoseExerciseCode =
  | 'squat'
  | 'bench_press'
  | 'curl'
  | 'deadlift'
  | 'military_press'
  | 'barbell_row'
  | 'seated_row'
  | 'running';

export type PoseMovementPhase =
  | 'setup'
  | 'descent'
  | 'bottom'
  | 'ascent'
  | 'lockout'
  | 'eccentric'
  | 'concentric';

export interface PoseJointPoint {
  name: PoseJointName;
  x: number;
  y: number;
  z?: number;
  confidence: number;
}

export interface PoseFrame {
  timestampMs: number;
  joints: PoseJointPoint[];
  modelConfidence: number;
}

export interface PoseDetectedError {
  code: PoseErrorCode;
  severity: 'warning' | 'critical';
  message: string;
  phase: PoseMovementPhase;
  timestampMs: number;
}

export interface PoseExerciseProfile {
  code: PoseExerciseCode;
  displayName: string;
  requiredJoints: PoseJointName[];
  primaryAngles: Array<'knee' | 'hip' | 'elbow' | 'shoulder' | 'trunk' | 'wrist'>;
  phases: PoseMovementPhase[];
}

export interface PoseTrackingSummary {
  exerciseCode: PoseExerciseCode;
  repCount: number;
  score: number;
  errors: PoseDetectedError[];
  recommendations: string[];
}
