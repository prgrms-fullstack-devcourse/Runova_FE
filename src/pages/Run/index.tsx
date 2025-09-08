import { View, Text } from 'react-native';
import styled from '@emotion/native';
import { theme } from '@/styles/theme';
import type { Feature, LineString } from 'geojson';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TabParamList } from '@/types/navigation.types';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import RunMap from './_components/RunMap';

type Props = NativeStackScreenProps<TabParamList, 'Run'>;

export default function Run() {
  const { routeCoordinates, location, errorMsg } = useLocationTracking();

  const routeGeoJSON: Feature<LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: routeCoordinates,
    },
  };

  return (
    <StyledPage>
      <StyledContainer>
        {errorMsg ? (
          <Text>{errorMsg}</Text>
        ) : location ? (
          <RunMap location={location} routeGeoJSON={routeGeoJSON} />
        ) : (
          <Text>Getting location...</Text>
        )}
      </StyledContainer>
    </StyledPage>
  );
}

const StyledPage = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${theme.colors.gray[100]};
`;

const StyledContainer = styled(View)`
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
`;
