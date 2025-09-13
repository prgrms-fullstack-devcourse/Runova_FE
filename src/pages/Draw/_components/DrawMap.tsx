import { View } from 'react-native';
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

  return (
    <StyledContainer>
      <Map
        mapRef={mapRef}
        cameraRef={cameraRef}
        initialLocation={initialLocation}
        onUserLocationUpdate={onUserLocationUpdate}
        showUserLocation={!isCapturing}
      >
        {!isCapturing &&
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
                  lineColor: theme.colors.secondary[500],
                  lineWidth: 4,
                  lineOpacity: 0.8,
                  lineDasharray: [2, 2],
                }}
              />
            </Mapbox.ShapeSource>
          )}

        {!isCapturing &&
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
                    lineColor: theme.colors.secondary[500],
                    lineWidth: 4,
                    lineOpacity: 0.7,
                  }}
                />
              </Mapbox.ShapeSource>
            ))}

        {matchedRoutes
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
                  lineColor: theme.colors.primary[600],
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
