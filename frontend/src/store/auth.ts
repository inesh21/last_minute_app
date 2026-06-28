import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  setUserId: (value: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  setUserId: (value) => set({ userId: value }),
}));
