import React, { RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import type { Position, Feature, LineString } from 'geojson';
import { theme } from '@/styles/theme';
import { INITIAL_ZOOM_LEVEL } from '@/constants/location';

interface DrawMapProps {
  mapRef: RefObject<Mapbox.MapView | null>;
  drawnCoordinates: Position[];
  matchedRoute: Feature<LineString> | null;
}

export default function DrawMap({
  mapRef,
  drawnCoordinates,
  matchedRoute,
}: DrawMapProps) {
  return (
    <View style={styles.container}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
      >
        <Mapbox.Camera
          followUserLocation
          followZoomLevel={INITIAL_ZOOM_LEVEL}
        />
        <Mapbox.UserLocation />

        {drawnCoordinates.length > 1 && (
          <Mapbox.ShapeSource
            id="drawn-source"
            shape={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: drawnCoordinates,
              },
            }}
          >
            <Mapbox.LineLayer
              id="drawn-line"
              style={{
                lineColor: theme.colors.secondary[500],
                lineWidth: 4,
                lineOpacity: 0.8,
                lineDasharray: [2, 2],
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {matchedRoute && (
          <Mapbox.ShapeSource id="matched-source" shape={matchedRoute}>
            <Mapbox.LineLayer
              id="matched-line"
              style={{
                lineColor: theme.colors.primary[600],
                lineWidth: 5,
                lineOpacity: 0.9,
              }}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
