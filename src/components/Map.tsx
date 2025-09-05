import React, { RefObject } from 'react';
import { StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import type { Position } from 'geojson';
import { INITIAL_ZOOM_LEVEL } from '@/constants/location';

interface MapProps {
  mapRef: RefObject<Mapbox.MapView | null>;
  cameraRef: RefObject<Mapbox.Camera | null>;
  initialLocation: Position;
  onUserLocationUpdate?: (location: Mapbox.Location) => void;
  children?: React.ReactNode;
}

export default function Map({
  mapRef,
  cameraRef,
  initialLocation,
  onUserLocationUpdate,
  children,
}: MapProps) {
  return (
    <Mapbox.MapView
      ref={mapRef}
      style={styles.map}
      styleURL={Mapbox.StyleURL.Street}
    >
      <Mapbox.Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: initialLocation,
          zoomLevel: INITIAL_ZOOM_LEVEL,
        }}
      />
      <Mapbox.UserLocation onUpdate={onUserLocationUpdate} />
      {children}
    </Mapbox.MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
