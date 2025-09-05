import { View, StyleSheet, Text } from 'react-native';
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
    <View style={styles.page}>
      <View style={styles.container}>
        {errorMsg ? (
          <Text>{errorMsg}</Text>
        ) : location ? (
          <RunMap location={location} routeGeoJSON={routeGeoJSON} />
        ) : (
          <Text>Getting location...</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
  },
  container: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
    width: '100%',
  },
});
