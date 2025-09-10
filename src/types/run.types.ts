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
