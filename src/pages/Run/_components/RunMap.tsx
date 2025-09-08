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
}

export default function RunMap({ location, routeGeoJSON }: RunMapProps) {
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
    </StyledContainer>
  );
}

// Styled Components
const StyledContainer = styled(View)`
  flex: 1;
  width: 100%;
`;
