import { create } from 'zustand';

interface DashboardState {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isLoading: false,
  setIsLoading: (value) => set({ isLoading: value }),
}));
