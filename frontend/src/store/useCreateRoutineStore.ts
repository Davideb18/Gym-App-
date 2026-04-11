import { create } from 'zustand';
import { WorkoutTemplate } from '../../../shared/types';

interface CreateRoutineState {
  isOpen: boolean;
  templateToEdit: WorkoutTemplate | null;
  openCreate: () => void;
  openEdit: (template: WorkoutTemplate) => void;
  closeCreate: () => void;
}

export const useCreateRoutineStore = create<CreateRoutineState>((set) => ({
  isOpen: false,
  templateToEdit: null,
  openCreate: () => set({ isOpen: true, templateToEdit: null }),
  openEdit: (template: WorkoutTemplate) => set({ isOpen: true, templateToEdit: template }),
  closeCreate: () => set({ isOpen: false }),
}));
