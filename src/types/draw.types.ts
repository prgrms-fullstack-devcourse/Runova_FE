import type { RefObject } from 'react';
import type Mapbox from '@rnmapbox/maps';
import type { Position, Feature, LineString } from 'geojson';

export type DrawMode = 'none' | 'draw' | 'erase';

export interface DrawUIProps {
  drawMode: DrawMode;
  onDrawModeToggle: () => void;
  onEraseModeToggle: () => void;
  onPanToCurrentUserLocation: () => void;
}

export interface DrawMapProps extends DrawUIProps {
  mapRef: RefObject<Mapbox.MapView | null>;
  cameraRef: RefObject<Mapbox.Camera | null>;
  initialLocation: Position;
  drawnCoordinates: Position[];
  completedDrawings: Position[][];
  matchedRoutes: Feature<LineString>[];
  onUserLocationUpdate: (location: Mapbox.Location) => void;
}
