import React, { RefObject } from 'react';
import styled from '@emotion/native';
import Mapbox from '@rnmapbox/maps';
import type { Position } from 'geojson';
import { INITIAL_ZOOM_LEVEL } from '@/constants/location';

interface MapProps {
  mapRef: RefObject<Mapbox.MapView | null>;
  cameraRef: RefObject<Mapbox.Camera | null>;
  initialLocation: Position | null;
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
  // initialLocation이 없으면 기본 서울 좌표 사용
  const safeInitialLocation = initialLocation || [127.0276, 37.4979];

  return (
    <StyledMapView ref={mapRef} styleURL={Mapbox.StyleURL.Street}>
      <Mapbox.Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: safeInitialLocation,
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
