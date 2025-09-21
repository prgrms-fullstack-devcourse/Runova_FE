import { create } from 'zustand';
import type { Category, NavKey } from '@/types/community';

type ActiveState = {
  activeNav: NavKey;
  filter: Category;
};

type Actions = {
  setActiveNav: (k: NavKey) => void;
  setFilter: (c: Category) => void;
};

export const useCommunityStore = create<ActiveState & Actions>()((set) => ({
  activeNav: undefined,
  filter: 'ALL',
  setActiveNav: (k) => set({ activeNav: k }),
  setFilter: (c) => set({ filter: c }),
}));
