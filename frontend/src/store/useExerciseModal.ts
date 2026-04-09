import { create } from 'zustand';

interface ExerciseModalState {
  isOpen: boolean;
  selectedExerciseId: string | null;
  // Azioni
  openExercise: (exerciseId: string) => void;
  closeModal: () => void;
}

export const useExerciseModal = create<ExerciseModalState>((set) => ({
  isOpen: false,
  selectedExerciseId: null,
  openExercise: (exerciseId) => set({ isOpen: true, selectedExerciseId: exerciseId }),
  closeModal: () => set({ isOpen: false, selectedExerciseId: null }),
}));
