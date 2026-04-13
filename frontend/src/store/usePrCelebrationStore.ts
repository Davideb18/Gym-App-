import { create } from 'zustand';

type PrItem = {
  exerciseName: string;
  weight: number;
  reps: number;
  e1rm: number;
};

type PrCelebrationState = {
  isOpen: boolean;
  items: PrItem[];
  openCelebration: (items: PrItem[]) => void;
  closeCelebration: () => void;
};

export const usePrCelebrationStore = create<PrCelebrationState>((set) => ({
  isOpen: false,
  items: [],
  openCelebration: (items) => set({ isOpen: true, items }),
  closeCelebration: () => set({ isOpen: false, items: [] }),
}));
