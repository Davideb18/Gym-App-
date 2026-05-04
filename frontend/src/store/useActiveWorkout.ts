// frontend/src/store/useActiveWorkout.ts
import { create } from 'zustand';
import {
  WorkoutTemplate,
  SetType,
  WorkoutTemplateExercise,
  WorkoutTemplateSet,
  Exercise,
} from '../../../shared/types';
import 'react-native-get-random-values'; // Serve per generare ID unici (uuid) in React Native
import { v4 as uuidv4 } from 'uuid';
import { useRestTimer } from './useRestTimer';

// 1. Tipi di Supporto: Modelli di Lavoro In Gara (Live)
export interface LiveSet {
  id: string;
  template_set_id?: string;
  set_number: number;
  set_type: SetType;
  target_reps?: number | null;
  target_weight?: number | null;
  rest_seconds: number;

  // Dati reali inseriti durante il workout
  real_reps?: number;
  real_weight?: number;
  last_reps?: number;
  last_weight?: number;
  is_completed: boolean;
}

export interface LiveExercise {
  id: string; // ID generato al volo
  template_exercise_id?: string;
  exercise_id: string;
  exercise_name: string;
  sets: LiveSet[];
}

// 2. Definizione dell'Interfaccia del nostro "Cervello"
interface ActiveWorkoutState {
  isActive: boolean;
  isExpanded: boolean;
  templateId?: string;
  routineName: string;
  exercises: LiveExercise[];
  startTime: number | null;

  // Azioni Universali
  startWorkout: (template: WorkoutTemplate) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    field: 'real_reps' | 'real_weight',
    value?: number,
  ) => void;
  applyLastPerformance: (
    payload: Record<string, Record<number, { reps?: number; weight?: number }>>,
  ) => void;
  toggleSetComplete: (exerciseId: string, setId: string) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  setIsExpanded: (val: boolean) => void;
}

// 3. Creazione e Inizializzazione di Zustand
export const useActiveWorkout = create<ActiveWorkoutState>((set, get) => ({
  isActive: false,
  isExpanded: false,
  templateId: undefined,
  routineName: '',
  exercises: [],
  startTime: null,

  // FUNZIONE 1: L'utente preme "AVVIA ALLENAMENTO"
  startWorkout: (template) => {
    useRestTimer.getState().stopTimer();

    // Convert the stored template into a live session snapshot so edits do not mutate the original plan.
    // Trasformiamo la "Scheda" (Morta) in una "Sessione Live" (Viva)
    const liveExercises: LiveExercise[] = (template.workout_template_exercises || []).map(
      (te: WorkoutTemplateExercise) => {
        const liveSets: LiveSet[] = (te.workout_template_sets || []).map(
          (ts: WorkoutTemplateSet) => ({
            id: uuidv4(),
            template_set_id: ts.id,
            set_number: ts.set_number,
            set_type: ts.set_type,
            target_reps: ts.target_reps_max, // Suggerimento da mostrare
            target_weight: ts.target_weight, // Suggerimento da mostrare
            rest_seconds: ts.rest_seconds,
            is_completed: false,
            // Pre-compiliamo quelli reali col target così l'utente fa prima!
            real_reps: ts.target_reps_max || undefined,
            real_weight: ts.target_weight || undefined,
          }),
        );

        return {
          id: uuidv4(),
          template_exercise_id: te.id,
          exercise_id: te.exercise_id,
          exercise_name: (te.exercises as Exercise | null)?.name || 'Esercizio Sconosciuto',
          sets: liveSets,
        };
      },
    );

    // Inietta i dati nello Store Globale e avviamo il tempo
    set({
      isActive: true,
      isExpanded: true,
      templateId: template.id,
      routineName: template.name,
      exercises: liveExercises,
      startTime: Date.now(),
    });
  },

  // FUNZIONE 2: L'utente cambia i KG o le Reps nella casella
  updateSet: (exerciseId, setId, field, value) => {
    set((state) => ({
      exercises: state.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id !== setId) return s;
            // Reject invalid numeric input early so the session state never stores NaN or Infinity.
            if (value === undefined || Number.isNaN(value) || !Number.isFinite(value)) {
              return { ...s, [field]: undefined };
            }
            return { ...s, [field]: value };
          }),
        };
      }),
    }));
  },

  applyLastPerformance: (payload) => {
    set((state) => ({
      exercises: state.exercises.map((ex) => {
        const exerciseHistory = payload[ex.exercise_id] || {};
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            const last = exerciseHistory[s.set_number];
            if (!last) return s;

            return {
              ...s,
              last_weight: last.weight,
              last_reps: last.reps,
            };
          }),
        };
      }),
    }));
  },

  // FUNZIONE 3: L'utente preme la Spunta Verde (✓)
  toggleSetComplete: (exerciseId, setId) => {
    const state = get();
    let isCompleting = false;
    let restSeconds = 90;

    // Flip the local set status first, then drive the rest timer from the actual set configuration.
    const updatedExercises = state.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s) => {
          if (s.id === setId) {
            isCompleting = !s.is_completed;
            // Se c'è un tempo di recupero impostato lo prendiamo
            if (s.rest_seconds) restSeconds = s.rest_seconds;
            return { ...s, is_completed: isCompleting };
          }
          return s;
        }),
      };
    });

    set({ exercises: updatedExercises });

    // Se l'abbiamo appena completato, facciamo partire il timer
    if (isCompleting) {
      useRestTimer.getState().startTimer(restSeconds);
    }
  },

  finishWorkout: () => {
    // Ending the workout must clear both the session snapshot and the rest timer.
    useRestTimer.getState().stopTimer();
    set({
      isActive: false,
      isExpanded: false,
      templateId: undefined,
      routineName: '',
      exercises: [],
      startTime: null,
    });
  },

  // FUNZIONE 5: Annullamento
  cancelWorkout: () => {
    // Cancel uses the same cleanup path as finish to leave the store in a neutral state.
    useRestTimer.getState().stopTimer();
    set({
      isActive: false,
      isExpanded: false,
      templateId: undefined,
      routineName: '',
      exercises: [],
      startTime: null,
    });
  },

  // FUNZIONE 6: UI Modal Toggle
  setIsExpanded: (val) => set({ isExpanded: val }),
}));
