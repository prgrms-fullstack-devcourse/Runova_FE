import { useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import {
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Save } from 'lucide-react-native';
import { theme } from '@/styles/theme';
import { useMapGestures } from '@/hooks/useMapGestures';
import { useLocationManager } from '@/hooks/useLocationManager';
import { useRouteValidation } from '@/hooks/useRouteValidation';
import { useMapCapture } from '@/hooks/useMapCapture';
import { createCourse } from '@/lib/coursesApi';
import Header from '@/components/Header';
import DrawMap from './_components/DrawMap';
import type { RouteStackParamList } from '@/navigation/RouteStackNavigator';
import useDrawStore from '@/store/draw';
import useAuthStore from '@/store/auth';
import {
  showMapCaptureSuccess,
  showImageUploadSuccess,
  showImageProcessingError,
  showCourseSaveSuccess,
  showCourseSaveError,
} from './_components/Toasts';

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

  const clearAll = useDrawStore((s) => s.clearAll);
  const isLoading = useDrawStore((s) => s.isLoading);
  const accessToken = useAuthStore((s) => s.accessToken);

  const {
    initialLocation,
    locationLoading,
    flyToCurrentUserLocation,
    handleUserLocationUpdate,
  } = useLocationManager();
  const { composedGesture } = useMapGestures(mapRef);
  const { validateRoute } = useRouteValidation();
  const { processImage } = useMapCapture(mapRef);

  useFocusEffect(
    useCallback(() => {
      clearAll();
    }, [clearAll]),
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSavePress = async () => {
    try {
      const validation = validateRoute(accessToken || '');
      if (!validation.isValid || !validation.data) {
        showCourseSaveError(validation.error || '경로 검증에 실패했습니다.');
        return;
      }

      const imageResult = await processImage(accessToken || '');

      if (imageResult.captureSuccess) {
        showMapCaptureSuccess();
      }
      if (imageResult.uploadSuccess) {
        showImageUploadSuccess();
      }
      if (imageResult.captureError) {
        showImageProcessingError(imageResult.captureError);
      }
      if (imageResult.uploadError) {
        showImageProcessingError(imageResult.uploadError);
      }

      await createCourse(
        {
          title: validation.data.title,
          imageURL: imageResult.imageURL || '',
          path: validation.data.path,
        },
        accessToken || '',
      );

      showCourseSaveSuccess();
      clearAll();
      navigation.goBack();
    } catch (error: unknown) {
      let errorMessage = '경로 저장에 실패했습니다.';
      showCourseSaveError(errorMessage);
    }
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
          <View style={styles.container} collapsable={false}>
            <DrawMap
              mapRef={mapRef}
              cameraRef={cameraRef}
              initialLocation={initialLocation}
              onPanToCurrentUserLocation={() =>
                flyToCurrentUserLocation(cameraRef)
              }
              onUserLocationUpdate={handleUserLocationUpdate}
            />
          </View>
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
