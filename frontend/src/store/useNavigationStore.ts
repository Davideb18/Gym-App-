import { create } from 'zustand';

interface NavigationState {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentTab: 'Home',
  setTab: (tab) => set({ currentTab: tab }),
}));
