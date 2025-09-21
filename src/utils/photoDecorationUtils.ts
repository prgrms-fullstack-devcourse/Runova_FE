import {
  RunningStats,
  ColorOption,
  TemplateOption,
} from '@/types/photoDecoration.types';

/**
 * path 배열을 SVG path 데이터로 변환
 */
export function convertPathToSvgData(path: [number, number][]): string {
  if (!path || path.length === 0) {
    return '';
  }

  console.log(
    '📊 [PhotoDecorationUtils] convertPathToSvgData 실행, path:',
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

  console.log('📊 [PhotoDecorationUtils] SVG 경로 데이터 생성 완료:', pathData);

  return pathData;
}

/**
 * 런닝 통계 데이터를 포맷팅
 */
export function formatRunningStats(routeStats: any): RunningStats {
  return routeStats
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
}

/**
 * 템플릿 옵션 데이터
 */
export function getTemplateOptions(): TemplateOption[] {
  return [
    { id: 'minimal', name: '미니멀', color: '#000000' },
    { id: 'vibrant', name: '바이브런트', color: '#FF6B6B' },
    { id: 'nature', name: '네이처', color: '#4ECDC4' },
    { id: 'dark', name: '다크', color: '#2C3E50' },
  ];
}

/**
 * 배경색 옵션 데이터
 */
export function getBackgroundColorOptions(): ColorOption[] {
  return [
    { id: 'black', name: '검정', color: '#000000' },
    { id: 'white', name: '흰색', color: '#FFFFFF' },
    { id: 'blue', name: '파랑', color: '#2196F3' },
    { id: 'green', name: '초록', color: '#4CAF50' },
    { id: 'red', name: '빨강', color: '#F44336' },
    { id: 'purple', name: '보라', color: '#9C27B0' },
    { id: 'orange', name: '주황', color: '#FF9800' },
    { id: 'pink', name: '분홍', color: '#E91E63' },
  ];
}

/**
 * 경로 색상 옵션 데이터
 */
export function getRouteColorOptions(): ColorOption[] {
  return [
    { id: 'white', name: '흰색', color: '#FFFFFF' },
    { id: 'black', name: '검정', color: '#000000' },
    { id: 'yellow', name: '노랑', color: '#FFEB3B' },
    { id: 'purple', name: '보라', color: '#9C27B0' },
    { id: 'red', name: '빨강', color: '#F44336' },
    { id: 'blue', name: '파랑', color: '#2196F3' },
    { id: 'green', name: '초록', color: '#4CAF50' },
  ];
}

/**
 * 공유 옵션 생성
 */
export function createShareOptions(uri: string) {
  return {
    title: 'Runova 런닝 기록',
    message: '런닝 완주 인증! 🏃‍♂️💪\n#Runova #러닝 #운동기록',
    url: `file://${uri}`,
    type: 'image/*',
  };
}

/**
 * 기본 SVG 경로 데이터 (테스트용)
 */
export function getDefaultPathData(): string {
  return 'M20,20 L80,20 L80,60 L20,60 Z';
}
