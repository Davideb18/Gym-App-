// frontend/src/store/useActiveWorkout.ts
import { create } from 'zustand';
import { WorkoutTemplate, SetType, WorkoutTemplateExercise, WorkoutTemplateSet } from '../../../shared/types';
import 'react-native-get-random-values'; // Serve per generare ID unici (uuid) in React Native
import { v4 as uuidv4 } from 'uuid';

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
  updateSet: (exerciseId: string, setId: string, field: 'real_reps' | 'real_weight', value: number) => void;
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
    // Trasformiamo la "Scheda" (Morta) in una "Sessione Live" (Viva)
    const liveExercises: LiveExercise[] = (template.workout_template_exercises || []).map((te: WorkoutTemplateExercise) => {
      
      const liveSets: LiveSet[] = (te.workout_template_sets || []).map((ts: WorkoutTemplateSet) => ({
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
      }));

      return {
        id: uuidv4(),
        template_exercise_id: te.id,
        exercise_id: te.exercise_id,
        // !! Attenzione: qui assumiamo che il join restituisca 'exercises' come singola entità o array
        // A seconda di come l'hai gestito in Supabase, assicurati di prendere il name.
        exercise_name: (te.exercises as any)?.name || 'Esercizio Sconosciuto',
        sets: liveSets,
      };
    });

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
      exercises: state.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      })
    }));
  },

  // FUNZIONE 3: L'utente preme la Spunta Verde (✓)
  toggleSetComplete: (exerciseId, setId) => {
    set((state) => ({
      exercises: state.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, is_completed: !s.is_completed } : s)
        };
      })
    }));
  },

  finishWorkout: () => {
    set({ isActive: false, isExpanded: false, templateId: undefined, routineName: '', exercises: [], startTime: null });
  },

  // FUNZIONE 5: Annullamento
  cancelWorkout: () => {
    set({ isActive: false, isExpanded: false, templateId: undefined, routineName: '', exercises: [], startTime: null });
  },

  // FUNZIONE 6: UI Modal Toggle
  setIsExpanded: (val) => set({ isExpanded: val })
}));
