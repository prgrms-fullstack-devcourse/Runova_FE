import { View } from 'react-native';
import { useState, useEffect } from 'react';
import styled from '@emotion/native';
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
  const { drawnCoordinates, completedDrawings, matchedRoutes, isCapturing } =
    useDrawStore();
  const [isMapReady, setIsMapReady] = useState(false);
  const [showDrawingSources, setShowDrawingSources] = useState(true);

  // 캡처 시작 시 그리기 중인 소스들만 안전하게 숨김 (매칭된 경로는 유지)
  useEffect(() => {
    if (isCapturing) {
      // 캡처 시작 시 그리기 중인 소스들만 즉시 숨김
      setShowDrawingSources(false);
    } else {
      // 캡처 완료 후 약간의 지연을 두고 그리기 소스들을 다시 표시
      const timer = setTimeout(() => {
        setShowDrawingSources(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isCapturing]);

  return (
    <StyledContainer>
      <Map
        mapRef={mapRef}
        cameraRef={cameraRef}
        initialLocation={initialLocation}
        onUserLocationUpdate={onUserLocationUpdate}
        onMapReady={() => setIsMapReady(true)}
        showUserLocation={!isCapturing}
      >
        {isMapReady &&
          showDrawingSources &&
          drawnCoordinates.length > 1 &&
          drawnCoordinates.every(
            (coord) => Array.isArray(coord) && coord.length === 2,
          ) && (
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
                  lineColor: '#ff0000',
                  lineWidth: 4,
                  lineOpacity: 0.8,
                  lineDasharray: [2, 2],
                }}
              />
            </Mapbox.ShapeSource>
          )}

        {isMapReady &&
          showDrawingSources &&
          completedDrawings
            .filter(
              (drawing) =>
                Array.isArray(drawing) &&
                drawing.length > 0 &&
                drawing.every(
                  (coord) => Array.isArray(coord) && coord.length === 2,
                ),
            )
            .map((drawing, index) => (
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
                    lineColor: '#ff0000',
                    lineWidth: 4,
                    lineOpacity: 0.7,
                  }}
                />
              </Mapbox.ShapeSource>
            ))}

        {isMapReady &&
          matchedRoutes
            .filter(
              (route) =>
                route &&
                route.geometry &&
                route.geometry.coordinates &&
                Array.isArray(route.geometry.coordinates) &&
                route.geometry.coordinates.every(
                  (coord) => Array.isArray(coord) && coord.length === 2,
                ),
            )
            .map((route, index) => (
              <Mapbox.ShapeSource
                key={`matched-source-${index}`}
                id={`matched-source-${index}`}
                shape={route}
              >
                <Mapbox.LineLayer
                  id={`matched-line-${index}`}
                  style={{
                    lineColor: '#000000',
                    lineWidth: 5,
                    lineOpacity: 0.9,
                  }}
                />
              </Mapbox.ShapeSource>
            ))}
      </Map>
      {!isCapturing && (
        <DrawUI onPanToCurrentUserLocation={onPanToCurrentUserLocation} />
      )}
    </StyledContainer>
  );
}

const StyledContainer = styled(View)`
  flex: 1;
`;
