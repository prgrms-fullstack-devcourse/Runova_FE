import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { theme } from '@/styles/theme';
import type { DrawMapProps } from '@/types/draw.types';
import Map from '@/components/Map';
import DrawUI from './DrawUI';
import useDrawStore from '@/store/draw';

export default function DrawMap({
  mapRef,
  cameraRef,
  initialLocation,
  onPanToCurrentUserLocation,
  onUserLocationUpdate,
}: DrawMapProps) {
  const { drawnCoordinates, completedDrawings, matchedRoutes } = useDrawStore();

  return (
    <View style={styles.container}>
      <Map
        mapRef={mapRef}
        cameraRef={cameraRef}
        initialLocation={initialLocation}
        onUserLocationUpdate={onUserLocationUpdate}
      >
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

        {completedDrawings.map((drawing, index) => (
          <Mapbox.ShapeSource
            key={`completed-drawing-source-${index}`}
            id={`completed-drawing-source-${index}`}
            shape={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: drawing,
              },
            }}
          >
            <Mapbox.LineLayer
              id={`completed-drawing-line-${index}`}
              style={{
                lineColor: theme.colors.secondary[500],
                lineWidth: 4,
                lineOpacity: 0.7,
              }}
            />
          </Mapbox.ShapeSource>
        ))}

        {matchedRoutes.map((route, index) => (
          <Mapbox.ShapeSource
            key={`matched-source-${index}`}
            id={`matched-source-${index}`}
            shape={route}
          >
            <Mapbox.LineLayer
              id={`matched-line-${index}`}
              style={{
                lineColor: theme.colors.primary[600],
                lineWidth: 5,
                lineOpacity: 0.9,
              }}
            />
          </Mapbox.ShapeSource>
        ))}
      </Map>
      <DrawUI onPanToCurrentUserLocation={onPanToCurrentUserLocation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
