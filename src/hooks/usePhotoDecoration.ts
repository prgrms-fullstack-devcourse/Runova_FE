import { useState, useRef, useEffect } from 'react';
import { Alert, Animated, PanResponder } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';

import {
  PhotoDecorationState,
  PanResponderConfig,
  RunningStats,
} from '@/types/photoDecoration.types';
import {
  convertPathToSvgData,
  formatRunningStats,
  createShareOptions,
} from '@/utils/photoDecorationUtils';

interface UsePhotoDecorationOptions {
  path?: [number, number][];
  routeStats: any;
  recordId: number;
  onNavigateToRunDetail: (data: any) => void;
}

export function usePhotoDecoration({
  path,
  routeStats,
  recordId,
  onNavigateToRunDetail,
}: UsePhotoDecorationOptions) {
  const viewShotRef = useRef<ViewShot>(null);

  // 기본 상태 - 개선된 구조
  const [state, setState] = useState<PhotoDecorationState>({
    backgroundType: 'photo',
    backgroundColor: '#000000',
    colors: {
      route: '#00FF00',
      stats: '#ffffff',
      timestamp: '#ffffff',
    },
    visibility: {
      time: true,
      distance: true,
      pace: true,
      calories: true,
      route: true,
      timestamp: true,
    },
    scales: {
      stats: 1,
      route: 1,
      timestamp: 1,
    },
    routePathData: '',
    isProcessing: false,
  });

  // 애니메이션 관련 refs
  const statsTranslateX = useRef(new Animated.Value(0)).current;
  const statsTranslateY = useRef(new Animated.Value(0)).current;
  const statsScaleAnimated = useRef(new Animated.Value(1)).current;
  const routeTranslateX = useRef(new Animated.Value(0)).current;
  const routeTranslateY = useRef(new Animated.Value(0)).current;
  const routeScaleAnimated = useRef(new Animated.Value(1)).current;
  const timestampTranslateX = useRef(new Animated.Value(0)).current;
  const timestampTranslateY = useRef(new Animated.Value(0)).current;
  const timestampScaleAnimated = useRef(new Animated.Value(1)).current;

  // 런닝 통계 데이터
  const runningStats: RunningStats = formatRunningStats(routeStats);

  // 상태 업데이트 함수들
  const updateState = (updates: Partial<PhotoDecorationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // 색상 업데이트 헬퍼
  const updateColors = (
    colorUpdates: Partial<PhotoDecorationState['colors']>,
  ) => {
    setState((prev) => ({
      ...prev,
      colors: { ...prev.colors, ...colorUpdates },
    }));
  };

  // 표시 설정 업데이트 헬퍼
  const updateVisibility = (
    visibilityUpdates: Partial<PhotoDecorationState['visibility']>,
  ) => {
    setState((prev) => ({
      ...prev,
      visibility: { ...prev.visibility, ...visibilityUpdates },
    }));
  };

  // 크기 설정 업데이트 헬퍼
  const updateScales = (
    scaleUpdates: Partial<PhotoDecorationState['scales']>,
  ) => {
    setState((prev) => ({
      ...prev,
      scales: { ...prev.scales, ...scaleUpdates },
    }));
  };

  // 스케일 애니메이션 업데이트
  useEffect(() => {
    statsScaleAnimated.setValue(state.scales.stats);
  }, [state.scales.stats, statsScaleAnimated]);

  useEffect(() => {
    routeScaleAnimated.setValue(state.scales.route);
  }, [state.scales.route, routeScaleAnimated]);

  useEffect(() => {
    timestampScaleAnimated.setValue(state.scales.timestamp);
  }, [state.scales.timestamp, timestampScaleAnimated]);

  // 경로 데이터 처리
  useEffect(() => {
    console.log('📊 [usePhotoDecoration] useEffect 실행, path:', path);
    if (path && path.length > 0) {
      const pathData = convertPathToSvgData(path);
      updateState({ routePathData: pathData });
    } else {
      console.log('📊 [usePhotoDecoration] path 데이터가 없음, path:', path);
    }
  }, [path]);

  // PanResponder 생성 함수
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

  // 각 요소별 PanResponder
  const statsPanResponder = createPanResponder(
    statsTranslateX,
    statsTranslateY,
    state.scales.stats,
  );
  const routePanResponder = createPanResponder(
    routeTranslateX,
    routeTranslateY,
    state.scales.route,
  );
  const timestampPanResponder = createPanResponder(
    timestampTranslateX,
    timestampTranslateY,
    state.scales.timestamp,
  );

  // 저장 처리
  const handleSave = async () => {
    try {
      updateState({ isProcessing: true });
      console.log('📷 [usePhotoDecoration] 저장 버튼 클릭');

      if (!viewShotRef.current) {
        Alert.alert('오류', '이미지를 캡처할 수 없습니다.');
        return;
      }

      // ViewShot으로 편집된 이미지 캡처
      const uri = await viewShotRef.current!.capture!();
      console.log('📷 [usePhotoDecoration] 이미지 캡처 완료:', uri);

      // 미디어 라이브러리 권한 요청
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리에 저장하려면 권한이 필요합니다.');
        return;
      }

      // 갤러리에 저장
      const asset = await MediaLibrary.createAssetAsync(uri);
      console.log('📷 [usePhotoDecoration] 갤러리 저장 완료:', asset);

      Alert.alert('저장 완료', '꾸민 인증사진이 갤러리에 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            onNavigateToRunDetail({
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
      console.error('📷 [usePhotoDecoration] 저장 중 오류:', error);
      Alert.alert('오류', '사진 저장 중 오류가 발생했습니다.');
    } finally {
      updateState({ isProcessing: false });
    }
  };

  // 공유 처리
  const handleShare = async () => {
    if (!viewShotRef.current?.capture) {
      Alert.alert('오류', '이미지를 찾을 수 없습니다.');
      return;
    }

    try {
      updateState({ isProcessing: true });

      // ViewShot으로 현재 꾸민 이미지 캡처
      const uri = await viewShotRef.current.capture();

      // react-native-share 라이브러리로 바로 공유 창 띄우기
      const shareOptions = createShareOptions(uri);
      const result = await Share.open(shareOptions);
      console.log('📤 [usePhotoDecoration] 공유 성공:', result);
    } catch (error: unknown) {
      if (error instanceof Error && error.message !== 'User did not share') {
        console.error('📤 [usePhotoDecoration] 공유 오류:', error);
        Alert.alert('오류', '공유 중 오류가 발생했습니다.');
      }
    } finally {
      updateState({ isProcessing: false });
    }
  };

  return {
    // 상태
    state,
    updateState,
    updateColors,
    updateVisibility,
    updateScales,
    runningStats,

    // refs
    viewShotRef,

    // 애니메이션 values
    statsTranslateX,
    statsTranslateY,
    statsScaleAnimated,
    routeTranslateX,
    routeTranslateY,
    routeScaleAnimated,
    timestampTranslateX,
    timestampTranslateY,
    timestampScaleAnimated,

    // PanResponders
    statsPanResponder,
    routePanResponder,
    timestampPanResponder,

    // 핸들러
    handleSave,
    handleShare,
  };
}
