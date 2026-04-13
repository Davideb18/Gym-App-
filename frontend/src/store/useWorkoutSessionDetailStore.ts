import { create } from 'zustand';

type WorkoutSessionDetailState = {
  isOpen: boolean;
  session: any | null;
  openSessionDetail: (session: any) => void;
  closeSessionDetail: () => void;
};

export const useWorkoutSessionDetailStore = create<WorkoutSessionDetailState>((set) => ({
  isOpen: false,
  session: null,
  openSessionDetail: (session) => set({ isOpen: true, session }),
  closeSessionDetail: () => set({ isOpen: false, session: null }),
}));
