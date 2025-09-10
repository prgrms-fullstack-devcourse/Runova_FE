import { useRef } from 'react';
import { View } from 'react-native';
import styled from '@emotion/native';
import Mapbox from '@rnmapbox/maps';
import type { Feature, LineString } from 'geojson';
import type * as Location from 'expo-location';
import { theme } from '@/styles/theme';
import Map from '@/components/Map';

interface RunMapProps {
  location: Location.LocationObject;
  routeGeoJSON: Feature<LineString>;
  isLocked?: boolean;
}

export default function RunMap({
  location,
  routeGeoJSON,
  isLocked = false,
}: RunMapProps) {
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);

  return (
    <StyledContainer>
      <Map
        mapRef={mapRef}
        cameraRef={cameraRef}
        initialLocation={[location.coords.longitude, location.coords.latitude]}
      >
        {routeGeoJSON.geometry.coordinates.length > 1 && (
          <Mapbox.ShapeSource id="routeSource" shape={routeGeoJSON}>
            <Mapbox.LineLayer
              id="routeLayer"
              style={{
                lineColor: theme.colors.primary[500],
                lineWidth: 5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </Mapbox.ShapeSource>
        )}
      </Map>
      {isLocked && <LockOverlay pointerEvents="auto" />}
    </StyledContainer>
  );
}

const StyledContainer = styled(View)`
  flex: 1;
  width: 100%;
  position: relative;
`;

const LockOverlay = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  z-index: 1000;
`;
