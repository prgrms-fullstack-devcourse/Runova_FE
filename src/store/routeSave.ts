import { create } from 'zustand';
import { RouteCoordinate } from '@/types/courses.types';

export interface RouteSaveData {
  startLocation: [number, number];
  imageURL: string;
  path: RouteCoordinate[];
}

interface RouteSaveState {
  routeData: RouteSaveData | null;
  setRouteData: (data: RouteSaveData) => void;
  clearRouteData: () => void;
}

export const useRouteSaveStore = create<RouteSaveState>((set) => ({
  routeData: null,
  setRouteData: (data) => set({ routeData: data }),
  clearRouteData: () => set({ routeData: null }),
}));
