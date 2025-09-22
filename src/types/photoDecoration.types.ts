import { ViewStyle } from 'react-native';

export interface PhotoDecorationParams {
  photoUri: string;
  recordId: number;
  path?: [number, number][];
  stats: {
    distance: number;
    calories: number;
    pace: number;
    runningTime: string;
  };
}

export interface RunningStats {
  distance: number;
  time: string;
  pace: string;
  calories: number;
  date: string;
}

export interface ColorOption {
  id: string;
  name: string;
  color: string;
}

export interface TemplateOption {
  id: string;
  name: string;
  color: string;
}

// 개선된 상태 구조
export interface PhotoDecorationState {
  // 배경 설정
  backgroundType: 'photo' | 'solid';
  backgroundColor: string;

  // 색상 설정
  colors: {
    route: string;
    stats: string;
    timestamp: string;
  };

  // 표시 요소 설정
  visibility: {
    time: boolean;
    distance: boolean;
    pace: boolean;
    calories: boolean;
    route: boolean;
    timestamp: boolean;
  };

  // 크기 설정
  scales: {
    stats: number;
    route: number;
    timestamp: number;
  };

  // 계산된 데이터
  routePathData: string;

  // UI 상태
  isProcessing: boolean;
}

export interface SizeControlProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
}

export interface PanResponderConfig {
  translateX: any; // Animated.Value
  translateY: any; // Animated.Value
  scale: number;
}

export interface DecorationElement {
  type: 'stats' | 'route' | 'timestamp';
  visible: boolean;
  scale: number;
  color: string;
  position: {
    x: number;
    y: number;
  };
}

// 업데이트 헬퍼 함수들의 타입
export type UpdateColorsFunction = (
  colorUpdates: Partial<PhotoDecorationState['colors']>,
) => void;
export type UpdateVisibilityFunction = (
  visibilityUpdates: Partial<PhotoDecorationState['visibility']>,
) => void;
export type UpdateScalesFunction = (
  scaleUpdates: Partial<PhotoDecorationState['scales']>,
) => void;
