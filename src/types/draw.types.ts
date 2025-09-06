import type { RefObject } from 'react';
import type Mapbox from '@rnmapbox/maps';
import type { Position } from 'geojson';

export type DrawMode = 'none' | 'draw' | 'erase';

export interface DrawUIProps {
  onPanToCurrentUserLocation: () => void;
}

export interface DrawMapProps extends DrawUIProps {
  mapRef: RefObject<Mapbox.MapView | null>;
  cameraRef: RefObject<Mapbox.Camera | null>;
  initialLocation: Position;
  onUserLocationUpdate: (location: Mapbox.Location) => void;
}
