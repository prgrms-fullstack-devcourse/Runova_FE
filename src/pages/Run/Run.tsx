import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { theme } from '@/styles/theme';
import type { Position, Feature, LineString } from 'geojson';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TabParamList } from '@/types/navigation.types';

const haversineDistance = (coords1: Position, coords2: Position): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;

  const lon1 = coords1[0];
  const lat1 = coords1[1];
  const lon2 = coords2[0];
  const lat2 = coords2[1];

  const R = 6371e3; // 지구 반지름 (미터)

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d;
};

type Props = NativeStackScreenProps<TabParamList, 'Run'>;

export default function Run({ navigation }: Props) {
  const [routeCoordinates, setRouteCoordinates] = useState<Position[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [isMapReady, setIsMapReady] = useState(false);

  const handleUserLocationUpdate = (newLocation: Mapbox.Location) => {
    if (!isMapReady) {
      setIsMapReady(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      //TODO: 화면이 포커스될 때의 로직
      return () => {
        // 화면이 포커스를 잃을 때 isMapReady 상태를 초기화
        setIsMapReady(false);
      };
    }, []),
  );

  useEffect(() => {
    let subscriber: { remove: () => void } | undefined;

    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const lastKnownPosition = await Location.getLastKnownPositionAsync();
      if (lastKnownPosition) {
        setLocation(lastKnownPosition);
        const { latitude, longitude } = lastKnownPosition.coords;
        setRouteCoordinates([[longitude, latitude]]);
      }

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 10,
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setLocation(newLocation);

          const newCoordinate: Position = [longitude, latitude];
          setRouteCoordinates((prevCoords) => {
            if (prevCoords.length > 0) {
              const lastCoord = prevCoords[prevCoords.length - 1];
              const distance = haversineDistance(lastCoord, newCoordinate);

              if (distance > 5) {
                return [...prevCoords, newCoordinate];
              }
            } else {
              return [...prevCoords, newCoordinate];
            }
            return prevCoords;
          });
        },
      );
    };

    startWatching();

    return () => {
      subscriber?.remove();
    };
  }, []);

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
          <Mapbox.MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
            <Mapbox.UserLocation onUpdate={handleUserLocationUpdate} />
            {isMapReady && (
              <>
                <Mapbox.Camera
                  defaultSettings={{
                    centerCoordinate: [
                      location.coords.longitude,
                      location.coords.latitude,
                    ],
                    zoomLevel: 14,
                  }}
                />
                {routeCoordinates.length > 1 && (
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
              </>
            )}
          </Mapbox.MapView>
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
