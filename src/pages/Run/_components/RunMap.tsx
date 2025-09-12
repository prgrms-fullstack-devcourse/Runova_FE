import { View } from 'react-native';
import styled from '@emotion/native';
import Mapbox from '@rnmapbox/maps';
import { theme } from '@/styles/theme';
import Map from '@/components/Map';
import { LockOverlay } from '@/components/Overlay';
import { useRunMap } from '@/hooks/useRunMap';
import { useLocationTracking } from '@/hooks/useLocationTracking';

export default function RunMap({
  mapRef: externalMapRef,
  cameraRef: externalCameraRef,
}: {
  mapRef?: React.RefObject<Mapbox.MapView | null>;
  cameraRef?: React.RefObject<Mapbox.Camera | null>;
}) {
  const { routeCoordinates, location: locationObject } = useLocationTracking();

  // 트래킹 중일 때는 routeCoordinates의 마지막 위치를 사용, 그렇지 않으면 현재 위치 사용
  const location =
    routeCoordinates.length > 0
      ? (routeCoordinates[routeCoordinates.length - 1] as [number, number])
      : locationObject
        ? ([
            locationObject.coords.longitude,
            locationObject.coords.latitude,
          ] as [number, number])
        : null;

  const { routeGeoJSON, courseShapeGeoJSON, courseShapePolygons, isLocked } =
    useRunMap(externalCameraRef, location, routeCoordinates);

  if (!location || !externalMapRef || !externalCameraRef) {
    return null;
  }

  return (
    <StyledContainer>
      <Map
        mapRef={externalMapRef}
        cameraRef={externalCameraRef}
        initialLocation={location}
        showUserLocation={false}
      >
        {routeGeoJSON.geometry.coordinates.length > 1 && (
          <Mapbox.ShapeSource id="routeSource" shape={routeGeoJSON}>
            <Mapbox.LineLayer
              id="routeLayer"
              style={{
                lineColor: theme.colors.secondary[500],
                lineWidth: 5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* 선택해서 읽어온 코스 shape 표시 */}
        {courseShapePolygons.length > 0 && (
          <Mapbox.ShapeSource id="courseShapeSource" shape={courseShapeGeoJSON}>
            <Mapbox.FillLayer
              id="courseShapeLayer"
              style={{
                fillColor: theme.colors.primary[200],
                fillOpacity: 0.3,
              }}
            />
            <Mapbox.LineLayer
              id="courseShapeBorderLayer"
              style={{
                lineColor: theme.colors.primary[500],
                lineWidth: 2,
                lineOpacity: 0.8,
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* 현재 위치 마커 - 트래킹 폴리라인과 동일한 위치 사용 */}
        <Mapbox.PointAnnotation id="currentLocation" coordinate={location}>
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: theme.colors.secondary[500],
              borderWidth: 3,
              borderColor: '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          />
        </Mapbox.PointAnnotation>

        {/* 코스 노드 표시 */}
        {/* {courseTopology?.nodes.map((node, index) => (
          <Mapbox.PointAnnotation
            key={`node-${index}`}
            id={`node-${index}`}
            coordinate={node.location}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: theme.colors.primary[500],
                borderWidth: 2,
                borderColor: '#ffffff',
              }}
            />
          </Mapbox.PointAnnotation>
        ))} */}
      </Map>
      {isLocked && <LockOverlay pointerEvents="auto" />}
    </StyledContainer>
  );
}

const StyledContainer = styled.View({
  flex: 1,
  width: '100%',
  position: 'relative',
});
