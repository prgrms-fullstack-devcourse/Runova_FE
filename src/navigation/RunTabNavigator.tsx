import { useState, useRef, useCallback, useEffect } from 'react';
import { View, Animated } from 'react-native';
import styled from '@emotion/native';
import { Play } from 'lucide-react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Mapbox from '@rnmapbox/maps';
import TabNavigation from '@/components/TabNavigation';
import Header from '@/components/Header';
import { useLocationManager } from '@/hooks/useLocationManager';
import { useLongPress } from '@/hooks/useLongPress';
import { useAdjacentCourses } from '@/hooks/api/useRouteApi';
import type { CourseSearchItem } from '@/types/courses.types';

import Route from '@/pages/Route';
import Draw from '@/pages/Draw';
import RouteSave from '@/pages/RouteSave';
import Detail from '@/pages/Detail';
import Run from '@/pages/Run';
import RecommendationContainer from '@/pages/Run/_components/RecommendationContainer';

const Stack = createNativeStackNavigator();

type RunTabId = 'quickstart' | 'courseselection';

const tabs: Array<{ id: RunTabId; title: string }> = [
  { id: 'quickstart', title: '바로가기' },
  { id: 'courseselection', title: '코스 선택하기' },
];

// 바로가기 메인 컴포넌트
function QuickStartMain({ navigation }: { navigation: any }) {
  const [activeTab, setActiveTab] = useState<RunTabId>('quickstart');
  const [recommendations, setRecommendations] = useState<CourseSearchItem[]>(
    [],
  );
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);

  const {
    initialLocation,
    locationLoading,
    flyToCurrentUserLocation,
    handleUserLocationUpdate,
    refreshLocation,
  } = useLocationManager();

  const { searchAdjacent } = useAdjacentCourses();

  // 추천 경로 로드 함수
  const loadRecommendations = useCallback(async () => {
    if (initialLocation) {
      try {
        const results = await searchAdjacent(initialLocation, 1000);
        setRecommendations(results);
      } catch (error) {
        console.error('추천 경로 로드 실패:', error);
      }
    }
  }, [initialLocation, searchAdjacent]);

  // 탭이 포커스될 때마다 위치 새로고침 및 추천 경로 로드
  useFocusEffect(
    useCallback(() => {
      if (!initialLocation && !locationLoading) {
        refreshLocation();
      }
      if (initialLocation) {
        loadRecommendations();
      }
    }, [
      initialLocation,
      locationLoading,
      refreshLocation,
      loadRecommendations,
    ]),
  );

  const handleStartPress = () => {
    navigation.navigate('Run', {});
  };

  const handleRecommendationPress = (item: CourseSearchItem) => {
    navigation.navigate('Run', { courseId: item.id });
  };

  const { isPressing, animatedValue, startPress, stopPress } = useLongPress({
    onComplete: handleStartPress,
  });

  const handleTabPress = (tabId: RunTabId) => {
    setActiveTab(tabId);
  };

  const renderContent = () => {
    if (activeTab === 'quickstart') {
      return (
        <QuickStartContainer>
          {initialLocation && (
            <MapView
              ref={mapRef}
              styleURL={Mapbox.StyleURL.Street}
              style={{ flex: 1 }}
            >
              <Mapbox.Camera
                ref={cameraRef}
                defaultSettings={{
                  centerCoordinate: initialLocation,
                  zoomLevel: 15,
                }}
              />
              <Mapbox.UserLocation onUpdate={handleUserLocationUpdate} />
            </MapView>
          )}
          <RecommendationContainer
            onRecommendationPress={handleRecommendationPress}
            recommendations={recommendations}
          />
          <StartButtonContainer>
            <StartButton
              onPressIn={startPress}
              onPressOut={stopPress}
              activeOpacity={0.8}
            >
              <StartButtonGradient
                colors={['#1a1a1a', '#2d2d2d', '#404040']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <StartButtonProgress
                style={{
                  width: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }}
              />
              <StartButtonContent>
                <PlayIcon size={24} color="#ffffff" />
                <StartButtonText>
                  {isPressing ? '러닝 시작 중...' : '러닝 시작'}
                </StartButtonText>
              </StartButtonContent>
            </StartButton>
          </StartButtonContainer>
        </QuickStartContainer>
      );
    } else {
      return <Route navigation={navigation} />;
    }
  };

  return (
    <Container>
      <Header title="러닝" />
      <TabNavigation<RunTabId>
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
      {renderContent()}
    </Container>
  );
}

export default function RunTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuickStartMain" component={QuickStartMain} />
      <Stack.Screen name="Draw" component={Draw} />
      <Stack.Screen name="RouteSave" component={RouteSave} />
      <Stack.Screen name="Detail" component={Detail} />
      <Stack.Screen name="Run" component={Run} />
    </Stack.Navigator>
  );
}

const Container = styled.View({
  flex: 1,
  backgroundColor: '#ffffff',
});

const QuickStartContainer = styled.View({
  flex: 1,
  position: 'relative',
});

const MapView = styled(Mapbox.MapView)({
  flex: 1,
});

const StartButtonContainer = styled.View({
  position: 'absolute',
  bottom: 100,
  left: 20,
  right: 20,
});

const StartButton = styled.TouchableOpacity({
  height: 56,
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
});

const StartButtonGradient = styled(LinearGradient)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 8,
});

const StartButtonProgress = styled(Animated.View)({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  backgroundColor: '#4ECDC4',
  borderRadius: 8,
});

const StartButtonContent = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  zIndex: 1,
});

const PlayIcon = styled(Play)({
  // styled component for Play icon
});

const StartButtonText = styled.Text({
  color: '#ffffff',
  fontSize: 16,
  fontWeight: '600',
});
