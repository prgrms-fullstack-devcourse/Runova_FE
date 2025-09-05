import { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import type { Position } from 'geojson';
import {
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Save } from 'lucide-react-native';
import { theme } from '@/styles/theme';
import { useMapGestures } from '@/hooks/useMapGestures';
import { useInitialLocation } from '@/hooks/useInitialLocation';
import Header from '@/components/Header';
import DrawMap from './_components/DrawMap';
import type { RouteStackParamList } from '@/navigation/RouteStackNavigator';
import useDrawStore from '@/store/draw';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

const LoadingIndicator = () => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color={theme.colors.primary[500]} />
  </View>
);

export default function Draw() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RouteStackParamList>>();
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const { location: initialLocation, loading: locationLoading } =
    useInitialLocation();

  const currentUserLocation = useRef<Position | null>(null);

  useEffect(() => {
    if (initialLocation) {
      currentUserLocation.current = initialLocation;
    }
  }, [initialLocation]);

  const isLoading = useDrawStore((s) => s.isLoading);
  const { composedGesture } = useMapGestures(mapRef);

  const flyToCurrentUserLocation = () => {
    if (currentUserLocation.current) {
      cameraRef.current?.flyTo(currentUserLocation.current, 1000);
    }
  };

  const handleUserLocationUpdate = (location: Mapbox.Location) => {
    currentUserLocation.current = [
      location.coords.longitude,
      location.coords.latitude,
    ];
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSavePress = () => {
    console.log('Save pressed');
    // TODO: 저장 로직 구현
  };

  if (locationLoading || !initialLocation) {
    return <LoadingIndicator />;
  }

  return (
    <GestureHandlerRootView style={styles.screen}>
      <Header
        title="경로 그리기"
        leftIcon={ArrowLeft}
        rightIcon={Save}
        onLeftPress={handleBackPress}
        onRightPress={handleSavePress}
      />
      <View style={styles.container}>
        <GestureDetector gesture={composedGesture}>
          <DrawMap
            mapRef={mapRef}
            cameraRef={cameraRef}
            initialLocation={initialLocation}
            onPanToCurrentUserLocation={flyToCurrentUserLocation}
            onUserLocationUpdate={handleUserLocationUpdate}
          />
        </GestureDetector>
        {isLoading && <LoadingIndicator />}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
