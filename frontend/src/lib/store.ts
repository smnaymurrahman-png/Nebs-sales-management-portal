import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  full_name: string;
  work_email: string;
  designation?: string;
  role: 'super_admin' | 'admin' | 'user';
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      updateUser: (partial) => set(s => ({ user: s.user ? { ...s.user, ...partial } : null })),
    }),
    { name: 'nebs-seller-auth' }
  )
);
