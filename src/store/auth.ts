import { create } from 'zustand';

import type { AuthState } from '@/types/auth.types';
import type { User } from '@/types/user.types';

export interface AuthStore extends AuthState {
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setAuth: (accessToken, user) =>
    set({ accessToken, user, isAuthenticated: true }),
  clearAuth: () =>
    set({ accessToken: null, user: null, isAuthenticated: false }),
}));

export default useAuthStore;
