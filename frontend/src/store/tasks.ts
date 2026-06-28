import { create } from 'zustand';

interface TasksState {
  selectedTaskId: string | null;
  setSelectedTaskId: (value: string | null) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  selectedTaskId: null,
  setSelectedTaskId: (value) => set({ selectedTaskId: value }),
}));
