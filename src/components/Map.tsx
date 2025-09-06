import React, { RefObject } from 'react';
import styled from '@emotion/native';
import Mapbox from '@rnmapbox/maps';
import type { Position } from 'geojson';
import { INITIAL_ZOOM_LEVEL } from '@/constants/location';

interface MapProps {
  mapRef: RefObject<Mapbox.MapView | null>;
  cameraRef: RefObject<Mapbox.Camera | null>;
  initialLocation: Position;
  onUserLocationUpdate?: (location: Mapbox.Location) => void;
  children?: React.ReactNode;
  showUserLocation?: boolean;
}

export default function Map({
  mapRef,
  cameraRef,
  initialLocation,
  onUserLocationUpdate,
  children,
  showUserLocation = true,
}: MapProps) {
  return (
    <StyledMapView ref={mapRef} styleURL={Mapbox.StyleURL.Street}>
      <Mapbox.Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: initialLocation,
          zoomLevel: INITIAL_ZOOM_LEVEL,
        }}
      />
      {showUserLocation && (
        <Mapbox.UserLocation onUpdate={onUserLocationUpdate} />
      )}
      {children}
    </StyledMapView>
  );
}

const StyledMapView = styled(Mapbox.MapView)`
  flex: 1;
`;
