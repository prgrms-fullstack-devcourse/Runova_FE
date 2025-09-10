import type { Feature, LineString } from 'geojson';
import type * as Location from 'expo-location';

export interface RunState {
  isLocked: boolean;
  showExitModal: boolean;
  startTime: Date | null;
}

export interface RunMapProps {
  location: Location.LocationObject;
  routeGeoJSON: Feature<LineString>;
  isLocked?: boolean;
}

export interface StatsContainerProps {
  stats: {
    distance: number;
    calories: number;
    pace: string;
  };
}

export interface ControlContainerProps {
  isLocked: boolean;
  isTracking: boolean;
  onLockPress: () => void;
  onToggleTracking: () => void;
  onExitPress: () => void;
}

export interface RunningRecordRequest {
  path: [number, number][];
  startAt: Date;
  endAt: Date;
  pace: number;
  calories: number;
}

export interface RunningRecordResponse {
  id: number;
  path: [number, number][];
  startAt: string;
  endAt: string;
  pace: number;
  calories: number;
  createdAt: string;
}
