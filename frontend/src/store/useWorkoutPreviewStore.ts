import { create } from 'zustand';

interface WorkoutPreviewState {
  isOpen: boolean;
  templateId: string | null;
  openPreview: (templateId: string) => void;
  closePreview: () => void;
}

export const useWorkoutPreviewStore = create<WorkoutPreviewState>((set) => ({
  isOpen: false,
  templateId: null,
  openPreview: (templateId: string) => set({ isOpen: true, templateId }),
  closePreview: () => set({ isOpen: false, templateId: null }),
}));
