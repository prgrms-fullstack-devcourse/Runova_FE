import { useRef, useCallback } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import styled from '@emotion/native';
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
import { useMapCapture } from '@/hooks/useMapCapture';
import { useRouteValidation } from '@/hooks/useRouteValidation';
import Header from '@/components/Header';
import DrawMap from './_components/DrawMap';
import type { RouteStackParamList } from '@/navigation/RouteStackNavigator';
import useDrawStore from '@/store/draw';
import useAuthStore from '@/store/auth';
import { useRouteSaveStore } from '@/store/routeSave';
import {
  showImageProcessingError,
  showCourseSaveError,
} from './_components/Toasts';

const LoadingIndicator = () => (
  <StyledLoadingOverlay>
    <ActivityIndicator size="large" color={theme.colors.primary[500]} />
  </StyledLoadingOverlay>
);

export default function Draw() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RouteStackParamList>>();
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);

  const clearAll = useDrawStore((s) => s.clearAll);
  const isLoading = useDrawStore((s) => s.isLoading);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setRouteData = useRouteSaveStore((s) => s.setRouteData);

  const {
    initialLocation,
    locationLoading,
    flyToCurrentUserLocation,
    handleUserLocationUpdate,
  } = useLocationManager();
  const { composedGesture } = useMapGestures(mapRef);
  const { processImage } = useMapCapture(mapRef);
  const { validateRoute } = useRouteValidation();

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
      if (imageResult.captureError) {
        showImageProcessingError(imageResult.captureError);
        return;
      }

      const firstCoordinate = validation.data.path[0];
      const startLocation: [number, number] = [
        firstCoordinate.lon,
        firstCoordinate.lat,
      ];

      setRouteData({
        startLocation: startLocation,
        imageURL: imageResult.imageURL || '',
        path: validation.data.path,
      });

      navigation.navigate('RouteSave', {});
    } catch (error: unknown) {
      let errorMessage = '경로 저장에 실패했습니다.';
      showCourseSaveError(errorMessage);
    }
  };

  if (locationLoading || !initialLocation) {
    return <LoadingIndicator />;
  }

  return (
    <StyledGestureHandlerRootView>
      <Header
        title="경로 그리기"
        leftIcon={ArrowLeft}
        rightIcon={Save}
        onLeftPress={handleBackPress}
        onRightPress={handleSavePress}
      />
      <StyledContainer>
        <GestureDetector gesture={composedGesture}>
          <StyledContainer collapsable={false}>
            <DrawMap
              mapRef={mapRef}
              cameraRef={cameraRef}
              initialLocation={initialLocation}
              onPanToCurrentUserLocation={() =>
                flyToCurrentUserLocation(cameraRef)
              }
              onUserLocationUpdate={handleUserLocationUpdate}
            />
          </StyledContainer>
        </GestureDetector>
        {isLoading && <LoadingIndicator />}
      </StyledContainer>
    </StyledGestureHandlerRootView>
  );
}

const StyledGestureHandlerRootView = styled(GestureHandlerRootView)`
  flex: 1;
  background-color: #ffffff;
`;

const StyledContainer = styled(View)`
  flex: 1;
`;

const StyledLoadingOverlay = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: center;
  align-items: center;
  z-index: 10;
`;
