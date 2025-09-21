import { useState, useEffect, useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';
import type { Position } from 'geojson';
import type {
  CourseTopologyNode,
  NavigationState,
  NavigationInstruction,
} from '@/types/courses.types';
import {
  findNearestNode,
  getNextTurnInfo,
  shouldShowTurnWarning,
  generateNavigationMessage,
} from '@/utils/navigation';

interface UseNavigationProps {
  nodes: CourseTopologyNode[];
  routeCoordinates: Position[];
  isTracking: boolean;
  enabled: boolean;
}

interface UseNavigationReturn {
  navigationState: NavigationState;
  navigationMessage: string | null;
  shouldShowNavigation: boolean;
  resetNavigation: () => void;
}

export function useNavigation({
  nodes,
  routeCoordinates,
  isTracking,
  enabled,
}: UseNavigationProps): UseNavigationReturn {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentNodeIndex: -1,
    nextNode: null,
    distanceToNextNode: 0,
    isApproachingTurn: false,
    instruction: null,
  });

  const [navigationMessage, setNavigationMessage] = useState<string | null>(
    null,
  );

  // 이전 메시지와 시간을 추적하기 위한 ref
  const lastMessageRef = useRef<string | null>(null);
  const lastAnnouncementTime = useRef<number>(0);
  const lastSpeechTime = useRef<number>(0);
  const lastValidatedCoordinateRef = useRef<Position | null>(null);

  const resetNavigation = useCallback(() => {
    setNavigationState({
      currentNodeIndex: -1,
      nextNode: null,
      distanceToNextNode: 0,
      isApproachingTurn: false,
      instruction: null,
    });
    setNavigationMessage(null);
    lastMessageRef.current = null;
    lastAnnouncementTime.current = 0;
    lastSpeechTime.current = 0;
    lastValidatedCoordinateRef.current = null;
  }, []);

  // 실시간 네비게이션 검증 (트래킹 중이고 좌표가 실제로 이동했을 때만)
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

    // 이전에 검증한 좌표와 같은지 확인
    const lastValidated = lastValidatedCoordinateRef.current;
    if (
      lastValidated &&
      Math.abs(lastValidated[0] - currentPosition[0]) < 0.000001 &&
      Math.abs(lastValidated[1] - currentPosition[1]) < 0.000001
    ) {
      // 좌표가 거의 변하지 않았으면 검증하지 않음
      return;
    }

    // 현재 좌표를 저장
    lastValidatedCoordinateRef.current = currentPosition;

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

    // 네비게이션 상태 업데이트
    setNavigationState({
      currentNodeIndex: nearestNodeIndex,
      nextNode,
      distanceToNextNode: distance,
      isApproachingTurn,
      instruction,
    });

    // 메시지 생성 및 표시
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
    } else {
      // 회전점에서 멀어지면 메시지 숨김
      if (navigationMessage) {
        setNavigationMessage(null);
        lastMessageRef.current = null;
      }
    }
  }, [enabled, isTracking, nodes, routeCoordinates, navigationMessage]);

  // routeCoordinates 변경 시에만 네비게이션 검증 실행 (트래킹 중일 때만)
  useEffect(() => {
    if (
      !enabled ||
      !isTracking ||
      nodes.length === 0 ||
      routeCoordinates.length === 0
    ) {
      return;
    }

    // routeCoordinates가 변경될 때만 검증 실행
    validateNavigation();
  }, [enabled, isTracking, nodes, routeCoordinates, validateNavigation]);

  // 코스 변경 시 네비게이션 초기화 및 즉시 검증 실행 (트래킹 중일 때만)
  useEffect(() => {
    if (enabled && nodes.length > 0) {
      // 이전 좌표 ref 초기화
      lastValidatedCoordinateRef.current = null;
      // 코스 토폴로지가 로드된 후 즉시 검증 실행 (트래킹 중이고 좌표가 있을 때만)
      if (isTracking && routeCoordinates.length > 0) {
        validateNavigation();
      }
    }
  }, [enabled, nodes, isTracking, routeCoordinates, validateNavigation]);

  // 트래킹 중단 시 TTS 중단 및 메시지 초기화
  useEffect(() => {
    if (!isTracking) {
      Speech.stop();
      setNavigationMessage(null);
      lastMessageRef.current = null;
    }
  }, [isTracking]);

  // 네비게이션 비활성화 시 TTS 중단 및 메시지 초기화
  useEffect(() => {
    if (!enabled) {
      Speech.stop();
      setNavigationMessage(null);
      lastMessageRef.current = null;
    }
  }, [enabled]);

  // 컴포넌트 언마운트 시 TTS 정리
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const shouldShowNavigation =
    enabled &&
    isTracking &&
    navigationMessage !== null &&
    navigationState.instruction !== null;

  return {
    navigationState,
    navigationMessage,
    shouldShowNavigation,
    resetNavigation,
  };
}
