import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Download,
  Share,
  Palette,
  Map,
  Clock,
  Zap,
  Move,
  RotateCcw,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from '@emotion/native';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import Svg, { Path } from 'react-native-svg';

import Header from '@/components/Header';
import type { RunTabStackParamList } from '@/types/navigation.types';
import { convertRoutesToPathData } from '@/utils/svgExport';

type Props = NativeStackScreenProps<RunTabStackParamList, 'PhotoDecoration'>;

const { width: screenWidth } = Dimensions.get('window');

export default function PhotoDecoration({ route, navigation }: Props) {
  const { photoUri, recordId, path, stats: routeStats } = route.params;
  const insets = useSafeAreaInsets();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('minimal');
  const [backgroundType, setBackgroundType] = useState<'photo' | 'solid'>(
    'photo',
  );
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [routeColor, setRouteColor] = useState('#00FF00');
  const [statsColor, setStatsColor] = useState('#ffffff');
  const [timestampColor, setTimestampColor] = useState('#ffffff');

  const [routePathData, setRoutePathData] = useState('');

  const [showTime, setShowTime] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [showPace, setShowPace] = useState(true);
  const [showCalories, setShowCalories] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [showTimestamp, setShowTimestamp] = useState(true);

  const [statsScale, setStatsScale] = useState(1);
  const [routeScale, setRouteScale] = useState(1);
  const [timestampScale, setTimestampScale] = useState(1);

  const viewShotRef = useRef<ViewShot>(null);

  const statsTranslateX = useRef(new Animated.Value(0)).current;
  const statsTranslateY = useRef(new Animated.Value(0)).current;
  const statsScaleAnimated = useRef(new Animated.Value(1)).current;
  const routeTranslateX = useRef(new Animated.Value(0)).current;
  const routeTranslateY = useRef(new Animated.Value(0)).current;
  const routeScaleAnimated = useRef(new Animated.Value(1)).current;
  const timestampTranslateX = useRef(new Animated.Value(0)).current;
  const timestampTranslateY = useRef(new Animated.Value(0)).current;
  const timestampScaleAnimated = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    statsScaleAnimated.setValue(statsScale);
  }, [statsScale, statsScaleAnimated]);

  useEffect(() => {
    routeScaleAnimated.setValue(routeScale);
  }, [routeScale, routeScaleAnimated]);

  useEffect(() => {
    timestampScaleAnimated.setValue(timestampScale);
  }, [timestampScale, timestampScaleAnimated]);

  useEffect(() => {
    console.log('📊 [PhotoDecoration] useEffect 실행, path:', path);
    if (path && path.length > 0) {
      console.log(
        '📊 [PhotoDecoration] 전달받은 path 데이터 사용:',
        path.length,
        '개 좌표',
        '첫 번째 좌표:',
        path[0],
        '마지막 좌표:',
        path[path.length - 1],
      );

      const minLng = Math.min(...path.map((p) => p[0]));
      const maxLng = Math.max(...path.map((p) => p[0]));
      const minLat = Math.min(...path.map((p) => p[1]));
      const maxLat = Math.max(...path.map((p) => p[1]));

      const normalizedPath = path.map(([lng, lat]) => {
        const x = ((lng - minLng) / (maxLng - minLng)) * 80 + 10;
        const y = ((lat - minLat) / (maxLat - minLat)) * 60 + 10;
        return [x, y];
      });

      const pathData = normalizedPath
        .map(([x, y], index) => (index === 0 ? `M${x},${y}` : `L${x},${y}`))
        .join(' ');

      console.log(
        '📊 [PhotoDecoration] 간단한 SVG 경로 데이터 생성 완료:',
        pathData,
      );
      setRoutePathData(pathData);
    } else {
      console.log('📊 [PhotoDecoration] path 데이터가 없음, path:', path);
    }
  }, [path]);

  const runningStats = routeStats
    ? {
        distance: routeStats.distance / 1000,
        time: routeStats.runningTime,
        pace: routeStats.pace
          ? `${Math.floor(routeStats.pace / 60)}:${(routeStats.pace % 60).toString().padStart(2, '0')}`
          : '00:00',
        calories: routeStats.calories,
        date: new Date().toLocaleDateString('ko-KR'),
      }
    : {
        distance: 0,
        time: '00:00:00',
        pace: '00:00',
        calories: 0,
        date: new Date().toLocaleDateString('ko-KR'),
      };

  const templates = [
    { id: 'minimal', name: '미니멀', color: '#000000' },
    { id: 'vibrant', name: '바이브런트', color: '#FF6B6B' },
    { id: 'nature', name: '네이처', color: '#4ECDC4' },
    { id: 'dark', name: '다크', color: '#2C3E50' },
  ];

  const backgroundColors = [
    { id: 'black', name: '검정', color: '#000000' },
    { id: 'white', name: '흰색', color: '#FFFFFF' },
    { id: 'blue', name: '파랑', color: '#2196F3' },
    { id: 'green', name: '초록', color: '#4CAF50' },
    { id: 'red', name: '빨강', color: '#F44336' },
    { id: 'purple', name: '보라', color: '#9C27B0' },
    { id: 'orange', name: '주황', color: '#FF9800' },
    { id: 'pink', name: '분홍', color: '#E91E63' },
  ];

  const routeColors = [
    { id: 'white', name: '흰색', color: '#FFFFFF' },
    { id: 'black', name: '검정', color: '#000000' },
    { id: 'yellow', name: '노랑', color: '#FFEB3B' },
    { id: 'purple', name: '보라', color: '#9C27B0' },
    { id: 'red', name: '빨강', color: '#F44336' },
    { id: 'blue', name: '파랑', color: '#2196F3' },
    { id: 'green', name: '초록', color: '#4CAF50' },
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSavePress = async () => {
    try {
      setIsProcessing(true);
      console.log('📷 [PhotoDecoration] 저장 버튼 클릭');

      if (!viewShotRef.current) {
        Alert.alert('오류', '이미지를 캡처할 수 없습니다.');
        return;
      }

      // ViewShot으로 편집된 이미지 캡처
      const uri = await viewShotRef.current!.capture!();
      console.log('📷 [PhotoDecoration] 이미지 캡처 완료:', uri);

      // 미디어 라이브러리 권한 요청
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리에 저장하려면 권한이 필요합니다.');
        return;
      }

      // 갤러리에 저장
      const asset = await MediaLibrary.createAssetAsync(uri);
      console.log('📷 [PhotoDecoration] 갤러리 저장 완료:', asset);

      Alert.alert('저장 완료', '꾸민 인증사진이 갤러리에 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            navigation.navigate('RunDetail', {
              recordId,
              imageUrl: uri,
              stats: {
                distance: runningStats.distance,
                calories: runningStats.calories,
                pace: parseFloat(runningStats.pace.replace(':', '.')),
                runningTime: runningStats.time,
              },
            });
          },
        },
      ]);
    } catch (error) {
      console.error('📷 [PhotoDecoration] 저장 중 오류:', error);
      Alert.alert('오류', '사진 저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSharePress = () => {
    Alert.alert('공유', '꾸민 인증사진을 공유합니다.');
  };

  const SizeControlButtons = ({
    value,
    onValueChange,
    minimumValue = 0.5,
    maximumValue = 2,
    step = 0.1,
  }: {
    value: number;
    onValueChange: (value: number) => void;
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
  }) => {
    const handleDecrease = () => {
      const newValue = Math.max(minimumValue, value - step);
      onValueChange(newValue);
    };

    const handleIncrease = () => {
      const newValue = Math.min(maximumValue, value + step);
      onValueChange(newValue);
    };

    return (
      <SizeButtonContainer>
        <SizeButton onPress={handleDecrease} disabled={value <= minimumValue}>
          <SizeButtonText>-</SizeButtonText>
        </SizeButton>
        <SizeValue>{Math.round(value * 100)}%</SizeValue>
        <SizeButton onPress={handleIncrease} disabled={value >= maximumValue}>
          <SizeButtonText>+</SizeButtonText>
        </SizeButton>
      </SizeButtonContainer>
    );
  };

  const createPanResponder = (
    translateX: Animated.Value,
    translateY: Animated.Value,
    scale: number,
  ) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        translateX.extractOffset();
        translateY.extractOffset();
      },
      onPanResponderMove: (evt, gestureState) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: () => {
        translateX.flattenOffset();
        translateY.flattenOffset();
      },
    });
  };

  const statsPanResponder = createPanResponder(
    statsTranslateX,
    statsTranslateY,
    statsScale,
  );
  const routePanResponder = createPanResponder(
    routeTranslateX,
    routeTranslateY,
    routeScale,
  );
  const timestampPanResponder = createPanResponder(
    timestampTranslateX,
    timestampTranslateY,
    timestampScale,
  );

  const renderStats = () => {
    const visibleStats = [];

    if (showTime) {
      visibleStats.push(
        <StatItem key="time">
          <StatIcon>
            <Clock size={16} color={statsColor} />
          </StatIcon>
          <StatValue textColor={statsColor}>{runningStats.time}</StatValue>
          <StatLabel textColor={statsColor}>시간</StatLabel>
        </StatItem>,
      );
    }

    if (showDistance) {
      visibleStats.push(
        <StatItem key="distance">
          <StatIcon>
            <Map size={16} color={statsColor} />
          </StatIcon>
          <StatValue textColor={statsColor}>
            {runningStats.distance}km
          </StatValue>
          <StatLabel textColor={statsColor}>거리</StatLabel>
        </StatItem>,
      );
    }

    if (showPace) {
      visibleStats.push(
        <StatItem key="pace">
          <StatIcon>
            <Zap size={16} color={statsColor} />
          </StatIcon>
          <StatValue textColor={statsColor}>{runningStats.pace}</StatValue>
          <StatLabel textColor={statsColor}>페이스</StatLabel>
        </StatItem>,
      );
    }

    if (showCalories) {
      visibleStats.push(
        <StatItem key="calories">
          <StatIcon>
            <Zap size={16} color={statsColor} />
          </StatIcon>
          <StatValue textColor={statsColor}>{runningStats.calories}</StatValue>
          <StatLabel textColor={statsColor}>칼로리</StatLabel>
        </StatItem>,
      );
    }

    if (visibleStats.length === 0) return null;

    return (
      <Animated.View
        style={[
          {
            transform: [
              { translateX: statsTranslateX },
              { translateY: statsTranslateY },
              { scale: statsScaleAnimated },
            ],
          },
        ]}
        {...statsPanResponder.panHandlers}
      >
        <StatsContainer template={selectedTemplate} textColor={statsColor}>
          {visibleStats}
        </StatsContainer>
      </Animated.View>
    );
  };

  const renderRouteImage = () => {
    console.log('📊 [PhotoDecoration] renderRouteImage 호출:', {
      showRoute,
      routePathData: routePathData ? '있음' : '없음',
      routePathDataLength: routePathData?.length,
      routePathDataPreview: routePathData?.substring(0, 50) + '...',
    });

    if (!showRoute) {
      console.log('📊 [PhotoDecoration] showRoute가 false');
      return null;
    }

    const finalPathData = routePathData || 'M20,20 L80,20 L80,60 L20,60 Z';

    if (!routePathData) {
      console.log(
        '📊 [PhotoDecoration] routePathData가 없음, 테스트 경로 사용',
      );
    }

    console.log(
      '📊 [PhotoDecoration] SVG 렌더링 시작, routeColor:',
      routeColor,
      'finalPathData:',
      finalPathData.substring(0, 30),
    );

    return (
      <Animated.View
        style={[
          {
            transform: [
              { translateX: routeTranslateX },
              { translateY: routeTranslateY },
              { scale: routeScaleAnimated },
            ],
          },
        ]}
        {...routePanResponder.panHandlers}
      >
        <RouteImageContainer>
          <Svg width={120} height={100} viewBox="0 0 100 80">
            <Path
              d={finalPathData}
              stroke={routeColor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </RouteImageContainer>
      </Animated.View>
    );
  };

  const renderTimestamp = () => {
    console.log('📊 [PhotoDecoration] renderTimestamp 호출:', {
      showTimestamp,
      runningStatsDate: runningStats.date,
    });

    if (!showTimestamp) {
      console.log('📊 [PhotoDecoration] showTimestamp가 false');
      return null;
    }

    return (
      <Animated.View
        style={[
          {
            transform: [
              { translateX: timestampTranslateX },
              { translateY: timestampTranslateY },
              { scale: timestampScaleAnimated },
            ],
          },
        ]}
        {...timestampPanResponder.panHandlers}
      >
        <TimestampContainer
          template={selectedTemplate}
          textColor={timestampColor}
        >
          <TimestampText textColor={timestampColor}>
            {runningStats.date}
          </TimestampText>
        </TimestampContainer>
      </Animated.View>
    );
  };

  return (
    <Container>
      <Header
        leftIcon={ArrowLeft}
        onLeftPress={handleBackPress}
        title="사진 꾸미기"
      />

      <Content>
        <PreviewContainer>
          <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
            <PhotoContainer>
              {backgroundType === 'photo' ? (
                <OriginalPhoto source={{ uri: photoUri }} />
              ) : (
                <SolidBackground color={backgroundColor} />
              )}

              {renderStats()}
              {renderRouteImage()}
              {renderTimestamp()}
            </PhotoContainer>
          </ViewShot>
        </PreviewContainer>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 200 }}
          showsVerticalScrollIndicator={true}
        >
          <OptionsContainer>
            <OptionsTitle>편집 옵션</OptionsTitle>

            <OptionSection>
              <OptionLabel>배경</OptionLabel>
              <ToggleContainer>
                <ToggleButton
                  active={backgroundType === 'photo'}
                  onPress={() => setBackgroundType('photo')}
                >
                  <ToggleText>사진</ToggleText>
                </ToggleButton>
                <ToggleButton
                  active={backgroundType === 'solid'}
                  onPress={() => setBackgroundType('solid')}
                >
                  <ToggleText>단색</ToggleText>
                </ToggleButton>
              </ToggleContainer>
            </OptionSection>

            {backgroundType === 'solid' && (
              <OptionSection>
                <OptionLabel>배경색</OptionLabel>
                <ColorContainer>
                  {backgroundColors.map((color) => (
                    <ColorButton
                      key={color.id}
                      selected={backgroundColor === color.color}
                      onPress={() => setBackgroundColor(color.color)}
                    >
                      <ColorCircle color={color.color} />
                    </ColorButton>
                  ))}
                </ColorContainer>
              </OptionSection>
            )}

            <OptionSection>
              <OptionLabel>경로 색상</OptionLabel>
              <ColorContainer>
                {routeColors.map((color) => (
                  <ColorButton
                    key={color.id}
                    selected={routeColor === color.color}
                    onPress={() => setRouteColor(color.color)}
                  >
                    <ColorCircle color={color.color} />
                  </ColorButton>
                ))}
              </ColorContainer>
            </OptionSection>

            <OptionSection>
              <OptionLabel>통계 색상</OptionLabel>
              <ColorContainer>
                {routeColors.map((color) => (
                  <ColorButton
                    key={color.id}
                    selected={statsColor === color.color}
                    onPress={() => setStatsColor(color.color)}
                  >
                    <ColorCircle color={color.color} />
                  </ColorButton>
                ))}
              </ColorContainer>
            </OptionSection>

            <OptionSection>
              <OptionLabel>타임스탬프 색상</OptionLabel>
              <ColorContainer>
                {routeColors.map((color) => (
                  <ColorButton
                    key={color.id}
                    selected={timestampColor === color.color}
                    onPress={() => setTimestampColor(color.color)}
                  >
                    <ColorCircle color={color.color} />
                  </ColorButton>
                ))}
              </ColorContainer>
            </OptionSection>

            <OptionSection>
              <OptionLabel>런닝 통계</OptionLabel>
              <ToggleContainer>
                <ToggleButton
                  active={showTime}
                  onPress={() => setShowTime(!showTime)}
                >
                  <ToggleText>시간</ToggleText>
                </ToggleButton>
                <ToggleButton
                  active={showDistance}
                  onPress={() => setShowDistance(!showDistance)}
                >
                  <ToggleText>거리</ToggleText>
                </ToggleButton>
                <ToggleButton
                  active={showPace}
                  onPress={() => setShowPace(!showPace)}
                >
                  <ToggleText>페이스</ToggleText>
                </ToggleButton>
                <ToggleButton
                  active={showCalories}
                  onPress={() => setShowCalories(!showCalories)}
                >
                  <ToggleText>칼로리</ToggleText>
                </ToggleButton>
              </ToggleContainer>
            </OptionSection>

            <OptionSection>
              <OptionLabel>기타 요소</OptionLabel>
              <ToggleContainer>
                <ToggleButton
                  active={showRoute}
                  onPress={() => setShowRoute(!showRoute)}
                >
                  <ToggleText>경로 이미지</ToggleText>
                </ToggleButton>
                <ToggleButton
                  active={showTimestamp}
                  onPress={() => setShowTimestamp(!showTimestamp)}
                >
                  <ToggleText>타임스탬프</ToggleText>
                </ToggleButton>
              </ToggleContainer>
            </OptionSection>

            <OptionSection>
              <OptionLabel>크기 조절</OptionLabel>

              {showRoute && (
                <SizeControlContainer>
                  <SizeLabel>경로 이미지 크기</SizeLabel>
                  <SizeSliderContainer>
                    <SizeControlButtons
                      minimumValue={0.5}
                      maximumValue={2}
                      value={routeScale}
                      onValueChange={setRouteScale}
                    />
                  </SizeSliderContainer>
                </SizeControlContainer>
              )}

              <SizeControlContainer>
                <SizeLabel>통계 크기</SizeLabel>
                <SizeSliderContainer>
                  <SizeControlButtons
                    minimumValue={0.5}
                    maximumValue={2}
                    value={statsScale}
                    onValueChange={setStatsScale}
                  />
                </SizeSliderContainer>
              </SizeControlContainer>

              {showTimestamp && (
                <SizeControlContainer>
                  <SizeLabel>타임스탬프 크기</SizeLabel>
                  <SizeSliderContainer>
                    <SizeControlButtons
                      minimumValue={0.5}
                      maximumValue={2}
                      value={timestampScale}
                      onValueChange={setTimestampScale}
                    />
                  </SizeSliderContainer>
                </SizeControlContainer>
              )}
            </OptionSection>
          </OptionsContainer>
        </ScrollView>
      </Content>

      <BottomContainer safeAreaBottom={insets.bottom}>
        <ShareButton onPress={handleSharePress}>
          <Share size={24} color="#666666" />
        </ShareButton>

        <SaveButton onPress={handleSavePress} disabled={isProcessing}>
          {isProcessing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Download size={24} color="#ffffff" />
          )}
          <SaveText>저장하기</SaveText>
        </SaveButton>
      </BottomContainer>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
  backgroundColor: '#ffffff',
});

const Content = styled.View({
  flex: 1,
});

const PreviewContainer = styled.View({
  padding: 20,
  alignItems: 'center',
});

const PhotoContainer = styled.View({
  width: screenWidth - 40,
  height: screenWidth - 40, // 정사각형 1:1 비율
  borderRadius: 16,
  overflow: 'hidden',
  position: 'relative',
});

const OriginalPhoto = styled(Image)({
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
});

const SolidBackground = styled.View<{ color: string }>(({ color }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: color,
}));

const StatsContainer = styled.View<{ template: string; textColor: string }>(
  ({ template, textColor }) => ({
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    backgroundColor:
      template === 'minimal'
        ? 'rgba(0, 0, 0, 0.8)'
        : 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  }),
);

const StatItem = styled.View({
  alignItems: 'center',
});

const StatIcon = styled.View({
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 4,
});

const StatValue = styled.Text<{ textColor: string }>(({ textColor }) => ({
  fontSize: 14,
  fontWeight: 'bold',
  color: textColor,
  marginBottom: 2,
}));

const StatLabel = styled.Text<{ textColor: string }>(({ textColor }) => ({
  fontSize: 10,
  color:
    textColor === '#FFFFFF' ? 'rgba(255, 255, 255, 0.8)' : `${textColor}CC`,
}));

const RouteImageContainer = styled.View({
  position: 'absolute',
  bottom: 20,
  right: 20,
  width: 120,
  height: 100,

  justifyContent: 'center',
  alignItems: 'center',
});

const TimestampContainer = styled.View<{ template: string; textColor: string }>(
  ({ template, textColor }) => ({
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
  }),
);

const TimestampText = styled.Text<{ textColor: string }>(({ textColor }) => ({
  fontSize: 18,
  fontWeight: 'bold',
  color: textColor,
}));

const OptionsContainer = styled.View({
  paddingHorizontal: 20,
  paddingTop: 20,
});

const OptionsTitle = styled.Text({
  fontSize: 18,
  fontWeight: 'bold',
  color: '#000000',
  marginBottom: 20,
});

const OptionSection = styled.View({
  marginBottom: 24,
});

const OptionLabel = styled.Text({
  fontSize: 16,
  fontWeight: '600',
  color: '#333333',
  marginBottom: 12,
});

const TemplateContainer = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const TemplateButton = styled(TouchableOpacity)<{ selected: boolean }>(
  ({ selected }) => ({
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: selected ? '#f0f0f0' : '#ffffff',
    borderWidth: selected ? 2 : 1,
    borderColor: selected ? '#2d2d2d' : '#e0e0e0',
  }),
);

const TemplateColor = styled.View<{ color: string }>(({ color }) => ({
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: color,
  marginBottom: 4,
}));

const TemplateName = styled.Text({
  fontSize: 12,
  color: '#333333',
});

const ToggleContainer = styled.View({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
});

const ToggleButton = styled(TouchableOpacity)<{ active: boolean }>(
  ({ active }) => ({
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: active ? '#2d2d2d' : '#f0f0f0',
    borderWidth: 1,
    borderColor: active ? '#2d2d2d' : '#e0e0e0',
  }),
);

const ToggleText = styled.Text<{ active?: boolean }>(({ active }) => ({
  fontSize: 14,
  color: active ? '#ffffff' : '#333333',
  fontWeight: '500',
}));

const ColorContainer = styled.View({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
});

const ColorButton = styled(TouchableOpacity)<{ selected: boolean }>(
  ({ selected }) => ({
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: selected ? 3 : 1,
    borderColor: selected ? '#2d2d2d' : '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  }),
);

const ColorCircle = styled.View<{ color: string }>(({ color }) => ({
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: color,
  borderWidth: 1,
  borderColor: color === '#FFFFFF' ? '#e0e0e0' : 'transparent',
}));

const BottomContainer = styled.View<{ safeAreaBottom: number }>(
  ({ safeAreaBottom }) => ({
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: safeAreaBottom + 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  }),
);

const ShareButton = styled(TouchableOpacity)({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#f8f9fa',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
});

const SaveButton = styled(TouchableOpacity)({
  flex: 1,
  height: 48,
  borderRadius: 8,
  backgroundColor: '#2d2d2d',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

const SaveText = styled.Text({
  fontSize: 16,
  color: '#ffffff',
  marginLeft: 8,
  fontWeight: '600',
});

const SizeControlContainer = styled.View({
  marginBottom: 16,
});

const SizeLabel = styled.Text({
  fontSize: 14,
  color: '#333333',
  marginBottom: 8,
  fontWeight: '500',
});

const SizeSliderContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
});

const SliderContainer = styled.View({
  flex: 1,
  height: 40,
  justifyContent: 'center',
});

const SliderTrack = styled.View({
  height: 4,
  backgroundColor: '#e0e0e0',
  borderRadius: 2,
  position: 'relative',
});

const SliderFill = styled.View<{ width: string }>(({ width }) => ({
  height: 4,
  backgroundColor: '#2d2d2d',
  borderRadius: 2,
  width: width as any,
  position: 'absolute',
  left: 0,
  top: 0,
}));

const SliderThumb = styled.View<{ left: number }>(({ left }) => ({
  position: 'absolute',
  top: -8,
  left,
  width: 20,
  height: 20,
  backgroundColor: '#2d2d2d',
  borderRadius: 10,
  borderWidth: 2,
  borderColor: '#ffffff',
}));

const SizeButtonContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
});

const SizeButton = styled.TouchableOpacity<{ disabled?: boolean }>(
  ({ disabled }) => ({
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: disabled ? '#e0e0e0' : '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
  }),
);

const SizeButtonText = styled.Text({
  fontSize: 18,
  color: '#ffffff',
  fontWeight: 'bold',
});

const SizeValue = styled.Text({
  fontSize: 14,
  color: '#666666',
  fontWeight: '500',
  minWidth: 40,
  textAlign: 'center',
});
