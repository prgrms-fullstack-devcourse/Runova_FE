import { create } from 'zustand';
import type { Position, Feature, LineString } from 'geojson';
import type { DrawMode } from '@/types/draw.types';

interface DrawState {
  drawnCoordinates: Position[];
  completedDrawings: Position[][];
  matchedRoutes: Feature<LineString>[];
  isLoading: boolean;
  drawMode: DrawMode;
  isCapturing: boolean;
  setDrawnCoordinates: (coords: Position[]) => void;
  addDrawnCoordinates: (coord: Position) => void;
  addCompletedDrawing: (drawing: Position[]) => void;
  addMatchedRoute: (route: Feature<LineString>) => void;
  setIsLoading: (loading: boolean) => void;
  setIsCapturing: (capturing: boolean) => void;
  toggleDrawMode: () => void;
  toggleEraseMode: () => void;
  eraseRouteByIndex: (index: number) => void;
  clearAll: () => void;
}

const useDrawStore = create<DrawState>((set) => ({
  drawnCoordinates: [],
  completedDrawings: [],
  matchedRoutes: [],
  isLoading: false,
  drawMode: 'none',
  isCapturing: false,

  setDrawnCoordinates: (coords) => set({ drawnCoordinates: coords }),
  addDrawnCoordinates: (coord) =>
    set((state) => ({ drawnCoordinates: [...state.drawnCoordinates, coord] })),
  addCompletedDrawing: (drawing) =>
    set((state) => ({
      completedDrawings: [...state.completedDrawings, drawing],
      drawnCoordinates: [],
    })),
  addMatchedRoute: (route) =>
    set((state) => ({ matchedRoutes: [...state.matchedRoutes, route] })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsCapturing: (capturing) => set({ isCapturing: capturing }),
  toggleDrawMode: () =>
    set((state) => ({
      drawMode: state.drawMode === 'draw' ? 'none' : 'draw',
      drawnCoordinates: [],
    })),
  toggleEraseMode: () =>
    set((state) => ({
      drawMode: state.drawMode === 'erase' ? 'none' : 'erase',
      drawnCoordinates: [],
    })),
  eraseRouteByIndex: (routeIndex) =>
    set((state) => ({
      matchedRoutes: state.matchedRoutes.filter(
        (_, index) => index !== routeIndex,
      ),
      completedDrawings: state.completedDrawings.filter(
        (_, index) => index !== routeIndex,
      ),
    })),
  clearAll: () =>
    set({
      matchedRoutes: [],
      completedDrawings: [],
      drawnCoordinates: [],
    }),
}));

export default useDrawStore;
