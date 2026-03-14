export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
  description: string | null;
}

export interface Set {
  id: string;
  reps: number;
  weight: number;
  rpe?: number; // Optional: Rate of Perceived Exertion
}

export interface Workout {
  id: string;
  name?: string;
  date: string; // ISO string
  notes?: string;
  sets: Set[];
}
