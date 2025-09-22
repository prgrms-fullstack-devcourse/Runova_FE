# Runova

Runova는 GPS ART 기반 런닝 어플리케이션입니다.

### 배포 링크
Runova는 React Native 기반으로 개발되었으며, 하단 링크에서 .apk 파일을 설치하여 실행할 수 있습니다. 
https://runova-web.vercel.app/

## 🎯 서비스 개요

Runova는 GPS Art를 활용한 혁신적인 런닝 앱입니다. 사용자가 손가락으로 그린 경로를 실제 도로에 맞게 보정하고, 그 경로를 따라 달리며 GPS Art를 완성할 수 있습니다.

### 주요 기능
- **경로 그리기**: 손가락으로 맵에 경로를 그려 GPS Art 설계
- **맵 매칭**: Mapbox API를 활용한 실시간 경로 보정
- **실시간 런닝**: 경로 이탈 감지 및 네비게이션 안내
- **커뮤니티**: GPS Art 공유 및 런닝 메이트 찾기
- **통계**: 런닝 기록 및 성과 분석

## 🏗️ 기술 스택

### Frontend
- **React Native** + **Expo**: 크로스 플랫폼 모바일 앱 개발
- **TypeScript**: 타입 안전성 보장
- **Emotion**: CSS-in-JS 스타일링
- **React Navigation**: 네이티브 네비게이션
- **Zustand**: 상태 관리
- **React Query**: 서버 상태 관리

### 지도 및 위치 서비스
- **Mapbox**: 지도 렌더링 및 맵 매칭
- **@turf/turf**: 지리공간 데이터 처리
- **Expo Location**: GPS 위치 추적

### 백엔드 연동
- **NestJS**: RESTful API
- **Valkey**: 캐싱
- **AWS**: 클라우드 인프라


## 🚀 핵심 기능 구현
### 주요 화면

| 화면          | 설명                                                                                | 이미지                                                                                       |
| ------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Home**      | 별자리 컨셉의 메인 화면<br/>사용자가 달린 경로가 별자리로 변환되어 우주 배경에 표시 | ![Home Screen](https://github.com/user-attachments/assets/79746eaf-6067-4918-8f32-f67cf21429cf) |
| **Draw**      | 경로 그리기 및 맵 매칭<br/>손가락으로 맵에 경로를 그려 GPS Art 설계                 | ![Draw Screen](https://github.com/user-attachments/assets/f1c8fb29-0bdc-4cad-8adf-972c2001ce52)    |
| **Run**       | 실시간 런닝 및 네비게이션<br/>경로 이탈 감지 및 TTS 음성 안내                       | ![Run Screen](https://github.com/user-attachments/assets/2439dcbd-cbe4-490b-8a95-9dc53d1832d7)   |
| **Records**   | 런닝 기록 조회<br/>달린 경로와 통계를 별자리 이미지로 확인                          | ![Records Screen](https://github.com/user-attachments/assets/63b7b41c-ee4b-4589-8e72-ed4d3c364e36)     |
| **Community** | GPS Art 공유 커뮤니티 (웹뷰)<br/>경로 공유, 인증샷, 런닝메이트 찾기                 | ![Community Screen](https://github.com/user-attachments/assets/701a163e-0222-4eff-abe0-110103e4246d) |
| **Photo**    | 인증 사진 촬영, 꾸미기, SNS 공유              | ![MyPage Screen](https://github.com/user-attachments/assets/4b60a8ed-b9bf-4170-a3db-c9ed0c7c63e4)       |


### 1. 경로 그리기 - 맵 매칭

사용자가 손가락으로 그린 경로를 실제 도로에 맞게 보정하는 핵심 기능입니다.

#### 구현 방식
```typescript
// src/hooks/useMapGestures.ts
const panGesture = Gesture.Pan()
  .enabled(drawMode === 'draw')
  .onBegin(() => {
    // 그리기 시작 시 초기화
    runOnJS(initializeGesture)();
  })
  .onUpdate((event) => {
    if (drawMode !== 'draw') return;
    // 실시간으로 터치 좌표를 맵 좌표로 변환
    runOnJS(handleCoordinateUpdate)(event.x, event.y);
  })
  .onEnd(() => {
    // 그리기 완료 시 맵 매칭 실행
    runOnJS(finalizeGesture)();
  });
```

**설명**: 사용자가 손가락으로 그리는 동안 실시간으로 좌표를 수집하고, 그리기가 끝나면 자동으로 맵 매칭을 실행합니다.

#### Mapbox Map Matching API 호출
```typescript
// src/lib/mapMatching.ts
export async function getMatchedRoute(
  coordinates: Position[],
): Promise<Feature<LineString>> {
  if (coordinates.length < 2) {
    throw new Error('Not enough coordinates for map matching.');
  }

  // 좌표가 너무 많으면 샘플링 (최대 100개)
  const coordsForApi =
    coordinates.length > MAP_MATCHING_MAX_COORDS
      ? coordinates.filter(
          (_, i) =>
            i % Math.ceil(coordinates.length / MAP_MATCHING_MAX_COORDS) === 0,
        )
      : coordinates;

  // 각 좌표에 스냅 반경 적용 (50미터)
  const radiuses = coordsForApi.map(() => MAP_MATCHING_RADIUS);

  const data = await callMapboxMapMatching(
    coordsForApi,
    MAP_MATCHING_API_PROFILE,
    radiuses,
  );

  return {
    type: 'Feature',
    properties: {},
    geometry: data.matchings[0].geometry,
  };
}
```

**설명**: 사용자가 그린 좌표를 Mapbox Map Matching API에 전송하여 실제 도로에 맞는 정확한 경로를 생성합니다. 좌표가 많을 경우 샘플링하여 API 효율성을 높입니다.

### 2. 경로 이탈 처리 (Turf.js 활용)

실시간으로 사용자의 위치가 설정된 경로에서 벗어났는지 감지하고 처리합니다.

#### 핵심 검증 로직
```typescript
// src/utils/courseValidation.ts
export function validateLocationOnCourse(
  currentLocation: Position,
  coursePolygon: CoursePolygon,
  options: CourseValidationOptions = {},
): CourseValidationResult {
  const {
    tolerance = 50, // 기본 50미터 허용 오차
    enableDistanceCalculation = true,
  } = options;

  // 현재 위치를 Turf Point로 변환
  const currentPoint = turf.point([currentLocation[0], currentLocation[1]]);

  // 코스 폴리곤을 Turf MultiPolygon으로 변환
  const multiPolygon = turf.multiPolygon(coursePolygon.coordinates as any);

  // 점이 폴리곤 내부에 있는지 확인
  const isInside = turf.booleanPointInPolygon(currentPoint, multiPolygon);

  // 거리 계산
  let distanceFromCourse = 0;
  let nearestPointOnCourse: [number, number] | undefined;

  if (enableDistanceCalculation) {
    // 모든 폴리곤의 모든 링에 대해 최단 거리 계산
    let minDistance = Infinity;
    let nearestPoint: any = null;

    coursePolygon.coordinates.forEach((polygon) => {
      polygon.forEach((ring) => {
        const lineString = turf.lineString(ring as any);
        const nearest = turf.nearestPointOnLine(lineString, currentPoint);
        const distance = turf.distance(currentPoint, nearest, {
          units: 'meters',
        });

        if (distance < minDistance) {
          minDistance = distance;
          nearestPoint = nearest;
        }
      });
    });

    distanceFromCourse = minDistance;
  }

  // tolerance를 고려한 최종 판정
  const isOnCourse = isInside || distanceFromCourse <= tolerance;

  return {
    isOnCourse,
    distanceFromCourse,
    nearestPointOnCourse,
  };
}
```

**설명**: Turf.js의 `booleanPointInPolygon`과 `nearestPointOnLine` 함수를 사용하여 사용자 위치가 코스 내부에 있는지, 아니면 코스로부터 얼마나 떨어져 있는지 정확히 계산합니다.

#### 이탈 감지 및 심각도 분류
```typescript
export function detectCourseDeviation(
  currentLocation: Position,
  previousLocation: Position | null,
  topology: CourseTopologyResponse,
  options: CourseValidationOptions = {},
): {
  isDeviating: boolean;
  validationResult: CourseValidationResult;
  deviationSeverity: 'low' | 'medium' | 'high';
} {
  const validationResult = validateLocationWithTopology(
    currentLocation,
    topology,
    options,
  );

  let isDeviating = false;
  let deviationSeverity: 'low' | 'medium' | 'high' = 'low';

  if (!validationResult.isOnCourse) {
    isDeviating = true;

    // 이전 위치와의 거리를 고려하여 이탈 심각도 결정
    if (previousLocation && validationResult.distanceFromCourse) {
      if (validationResult.distanceFromCourse > 100) {
        deviationSeverity = 'high';
      } else if (validationResult.distanceFromCourse > 50) {
        deviationSeverity = 'medium';
      } else {
        deviationSeverity = 'low';
      }
    }
  }

  return {
    isDeviating,
    validationResult,
    deviationSeverity,
  };
}
```

**설명**: 경로 이탈 시 거리에 따라 심각도를 분류하여 사용자에게 적절한 피드백을 제공합니다.

### 3. 네비게이션 기능 구현

실시간으로 회전 안내와 경로 이탈 경고를 제공하는 네비게이션 시스템입니다.

#### 베어링 계산 및 회전 방향 결정
```typescript
// src/utils/navigation.ts
export function calculateBearing(
  coord1: [number, number],
  coord2: [number, number],
): number {
  const φ1 = (coord1[1] * Math.PI) / 180;
  const φ2 = (coord2[1] * Math.PI) / 180;
  const Δλ = ((coord2[0] - coord1[0]) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);

  return ((θ * 180) / Math.PI + 360) % 360;
}

function makeRotationInfo(bearing: number): RotationInfo {
  return {
    direction: bearing > 0 ? '왼쪽' : '오른쪽',
    scale: Math.abs(bearing) > 150 ? '유턴' : '회전',
  };
}
```

**설명**: 두 좌표 간의 베어링(방위각)을 계산하여 회전 방향과 각도를 결정합니다. 하버사인 공식을 사용한 정확한 지리적 계산을 수행합니다.

#### 실시간 네비게이션 검증
```typescript
// src/hooks/useNavigation.ts
const validateNavigation = useCallback(() => {
  if (
    !enabled ||
    !isTracking ||
    nodes.length === 0 ||
    routeCoordinates.length === 0
  ) {
    return;
  }

  // routeCoordinates의 마지막 위치를 사용 (실제 이동한 위치)
  const lastCoordinate = routeCoordinates[routeCoordinates.length - 1];
  const currentPosition: Position = [lastCoordinate[0], lastCoordinate[1]];

  // 현재 위치에서 가장 가까운 노드 찾기
  const { nodeIndex: nearestNodeIndex } = findNearestNode(
    [currentPosition[0], currentPosition[1]],
    nodes,
  );

  // 다음 회전 정보 가져오기
  const { nextNodeIndex, distance, instruction } = getNextTurnInfo(
    [currentPosition[0], currentPosition[1]],
    nearestNodeIndex,
    nodes,
  );

  const nextNode = nextNodeIndex !== null ? nodes[nextNodeIndex] : null;
  const isApproachingTurn =
    instruction !== null && shouldShowTurnWarning(distance, instruction);

  // 메시지 생성 및 TTS 음성 안내
  if (isApproachingTurn && instruction) {
    const message = generateNavigationMessage(instruction, distance);

    // 같은 메시지가 아니거나 5초가 지났을 때만 업데이트
    const now = Date.now();
    if (
      lastMessageRef.current !== message ||
      now - lastAnnouncementTime.current > 5000
    ) {
      setNavigationMessage(message);
      lastMessageRef.current = message;
      lastAnnouncementTime.current = now;

      // TTS 음성 안내 (3초에 한 번만)
      if (now - lastSpeechTime.current > 3000) {
        Speech.speak(message, {
          language: 'ko-KR',
          pitch: 1.0,
          rate: 0.8,
        });
        lastSpeechTime.current = now;
      }
    }
  }
}, [enabled, isTracking, nodes, routeCoordinates, navigationMessage]);
```

**설명**: 실시간으로 사용자 위치를 추적하여 다음 회전점까지의 거리와 방향을 계산하고, 5미터 이내 접근 시 TTS 음성 안내를 제공합니다.

## 📱 앱 구조

### 네이티브 앱 + 웹뷰 하이브리드 구조
```
src/
├── components/          # 공통 컴포넌트
├── hooks/              # 커스텀 훅
├── lib/                # 유틸리티 라이브러리
├── navigation/         # 네비게이션 설정
├── pages/              # 화면 컴포넌트
├── services/           # API 서비스
├── store/              # Zustand 상태 관리
├── types/              # TypeScript 타입 정의
└── utils/              # 유틸리티 함수

apps/web/               # 웹뷰용 React 앱
├── src/
│   ├── api/            # API 클라이언트
│   ├── components/     # 웹 컴포넌트
│   ├── pages/          # 웹 페이지
│   └── stores/         # 웹 상태 관리
```

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js
- Expo CLI
- Android Studio (Android 개발용)

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm expo start --dev-client

# Android 빌드
npm run android

# iOS 빌드
npm run ios
```

### 환경 변수 설정
`.env.example` 참고

## 🎨 주요 기술적 특징

### 1. 성능 최적화
- **좌표 샘플링**: 맵 매칭 API 호출 시 좌표 수를 100개로 제한
- **실시간 업데이트 최적화**: `requestAnimationFrame`을 활용한 부드러운 UI 업데이트
- **메모리 관리**: 좌표 배열의 불변성 보장 및 가비지 컬렉션 최적화

### 2. 타입 안전성
- **TypeScript**: 모든 코드에 엄격한 타입 검사 적용
- **GeoJSON 타입**: 지리적 데이터의 정확한 타입 정의
- **API 응답 타입**: 서버 응답에 대한 완전한 타입 보장

### 3. 사용자 경험
- **실시간 피드백**: 그리기 중 즉시 시각적 피드백 제공
- **음성 안내**: TTS를 활용한 핸즈프리 네비게이션
- **오류 처리**: 사용자 친화적인 오류 메시지 및 복구 방안 제시

## 🚀 배포 및 운영

### 빌드 프로세스
1. **개발 빌드**: `expo build:android` 또는 `expo build:ios`
2. **프로덕션 빌드**: EAS Build를 통한 자동화된 빌드

## 📈 향후 계획

### 단기 계획
- [ ] 경로 공유 기능 개선
- [ ] 런닝 통계 시각화 강화
- [ ] 소셜 기능 확장
- [ ] 코드 리팩토링

### 장기 계획
- [ ] AI 기반 경로 추천
- [ ] AR을 활용한 실시간 네비게이션
