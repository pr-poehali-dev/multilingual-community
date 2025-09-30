import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from './api';

interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),
    }),
    {
      name: 'language-connect-storage',
    }
  )
);