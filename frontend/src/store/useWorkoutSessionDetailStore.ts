import { create } from 'zustand';
import type { RecentWorkoutSession } from '../api/workoutService';

type WorkoutSessionDetailState = {
  isOpen: boolean;
  session: RecentWorkoutSession | null;
  openSessionDetail: (session: RecentWorkoutSession) => void;
  closeSessionDetail: () => void;
};

export const useWorkoutSessionDetailStore = create<WorkoutSessionDetailState>((set) => ({
  isOpen: false,
  session: null,
  openSessionDetail: (session) => set({ isOpen: true, session }),
  closeSessionDetail: () => set({ isOpen: false, session: null }),
}));
