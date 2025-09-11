import styled from '@emotion/native';
import Mapbox from '@rnmapbox/maps';
import { theme } from '@/styles/theme';
import Map from '@/components/Map';
import { LockOverlay } from '@/components/Overlay';
import { useRunMap } from '@/hooks/useRunMap';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useLocationManager } from '@/hooks/useLocationManager';

export default function RunMap({
  cameraRef: externalCameraRef,
}: {
  cameraRef?: React.RefObject<Mapbox.Camera>;
}) {
  const { routeCoordinates } = useLocationTracking();
  const { location: locationObject } = useLocationManager();

  // LocationObject를 Position으로 변환
  const location = locationObject
    ? ([locationObject.coords.longitude, locationObject.coords.latitude] as [
        number,
        number,
      ])
    : null;

  const {
    mapRef,
    cameraRef,
    routeGeoJSON,
    courseShapeGeoJSON,
    courseShapePolygons,
    isLocked,
  } = useRunMap(externalCameraRef, location, routeCoordinates);

  if (!location) {
    return null;
  }

  return (
    <StyledContainer>
      <Map mapRef={mapRef} cameraRef={cameraRef} initialLocation={location}>
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
