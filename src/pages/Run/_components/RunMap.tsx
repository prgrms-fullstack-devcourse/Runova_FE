import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import type { Feature, LineString } from 'geojson';
import type * as Location from 'expo-location';
import { theme } from '@/styles/theme';
import { INITIAL_ZOOM_LEVEL } from '@/constants/location';

interface RunMapProps {
  location: Location.LocationObject;
  routeGeoJSON: Feature<LineString>;
}

export default function RunMap({ location, routeGeoJSON }: RunMapProps) {
  const [isMapReady, setIsMapReady] = useState(false);

  const handleUserLocationUpdate = () => {
    if (!isMapReady) {
      setIsMapReady(true);
    }
  };

  return (
    <Mapbox.MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
      <Mapbox.UserLocation onUpdate={handleUserLocationUpdate} />
      {isMapReady && (
        <>
          <Mapbox.Camera
            defaultSettings={{
              centerCoordinate: [
                location.coords.longitude,
                location.coords.latitude,
              ],
              zoomLevel: INITIAL_ZOOM_LEVEL,
            }}
          />
          {routeGeoJSON.geometry.coordinates.length > 1 && (
            <Mapbox.ShapeSource id="routeSource" shape={routeGeoJSON}>
              <Mapbox.LineLayer
                id="routeLayer"
                style={{
                  lineColor: theme.colors.primary[500],
                  lineWidth: 5,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </Mapbox.ShapeSource>
          )}
        </>
      )}
    </Mapbox.MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
  },
});
