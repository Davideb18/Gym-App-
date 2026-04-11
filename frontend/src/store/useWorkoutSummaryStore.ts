import { create } from 'zustand';

interface WorkoutSummaryData {
  timeString: string;
  totalVolume: number;
  completedSets: number;
  exercises: { name: string; setsCompleted: number; record?: string }[];
  routineName: string;
}

interface WorkoutSummaryState {
  isOpen: boolean;
  summaryData: WorkoutSummaryData | null;
  openSummary: (data: WorkoutSummaryData) => void;
  closeSummary: () => void;
}

export const useWorkoutSummaryStore = create<WorkoutSummaryState>((set) => ({
  isOpen: false,
  summaryData: null,
  openSummary: (data) => set({ isOpen: true, summaryData: data }),
  closeSummary: () => set({ isOpen: false, summaryData: null }),
}));
