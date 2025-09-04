import { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import {
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { theme } from '@/styles/theme';
import { useMapDrawing } from '@/hooks/useMapDrawing';
import DrawMap from './_components/DrawMap';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

export default function Draw() {
  const mapRef = useRef<Mapbox.MapView>(null);
  const { drawnCoordinates, matchedRoute, isLoading, panGesture } =
    useMapDrawing(mapRef);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.container}>
          <DrawMap
            mapRef={mapRef}
            drawnCoordinates={drawnCoordinates}
            matchedRoute={matchedRoute}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator
                size="large"
                color={theme.colors.primary[500]}
              />
            </View>
          )}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
