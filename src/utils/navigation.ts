import type {
  NavigationDirection,
  NavigationScale,
  NavigationInstruction,
  CourseTopologyNode,
} from '@/types/courses.types';

// 각도 변화가 10도 미만이면, 직진으로 간주
const STRAIGHT_THRESHOLD_DEGREE = 10;

// 회전 안내를 위한 임계값 (미터)
const TURN_WARNING_DISTANCE = 5;
const EARTH_RADIUS_IN_METERS = 6371e3;

type RotationInfo = {
  direction: NavigationDirection;
  scale: NavigationScale;
};

/**
 * 베어링 각도를 기반으로 회전 정보 생성
 */
function makeRotationInfo(bearing: number): RotationInfo {
  return {
    direction: bearing > 0 ? '왼쪽' : '오른쪽',
    scale: Math.abs(bearing) > 150 ? '유턴' : '회전',
  };
}

/**
 * 회전 안내 메시지 생성
 */
export function makeTurnInstruction(bearing: number): string {
  if (Math.abs(bearing) < STRAIGHT_THRESHOLD_DEGREE) return '';
  const { direction, scale } = makeRotationInfo(bearing);
  return `잠시후 ${direction}으로 ${scale} 있습니다. 앱을 확인해 주세요`;
}

/**
 * 경로 이탈 경고 메시지 생성
 */
export function makeWarnInstruction(distance: number, bearing: number): string {
  const { direction, scale } = makeRotationInfo(bearing);
  return `경로에서 벗어났습니다. ${direction}으로 ${scale} 후 ${distance}m 이동해주세요!`;
}

/**
 * 두 좌표 간의 거리 계산 (미터 단위)
 */
export function calculateDistance(
  coord1: [number, number],
  coord2: [number, number],
): number {
  const lat1Rad = (coord1[1] * Math.PI) / 180;
  const lat2Rad = (coord2[1] * Math.PI) / 180;
  const deltaLatRad = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const deltaLonRad = ((coord2[0] - coord1[0]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLonRad / 2) *
      Math.sin(deltaLonRad / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_IN_METERS * c;
}

/**
 * 두 좌표 간의 베어링 계산 (도 단위)
 */
export function calculateBearing(
  coord1: [number, number],
  coord2: [number, number],
): number {
  const lat1Rad = (coord1[1] * Math.PI) / 180;
  const lat2Rad = (coord2[1] * Math.PI) / 180;
  const deltaLonRad = ((coord2[0] - coord1[0]) * Math.PI) / 180;

  const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);

  const bearingRad = Math.atan2(y, x);

  return ((bearingRad * 180) / Math.PI + 360) % 360;
}

/**
 * 현재 위치에서 가장 가까운 노드 찾기
 */
export function findNearestNode(
  currentLocation: [number, number],
  nodes: CourseTopologyNode[],
): { nodeIndex: number; distance: number } {
  let minDistance = Infinity;
  let nearestNodeIndex = 0;

  nodes.forEach((node, index) => {
    const distance = calculateDistance(currentLocation, node.location);
    if (distance < minDistance) {
      minDistance = distance;
      nearestNodeIndex = index;
    }
  });

  return { nodeIndex: nearestNodeIndex, distance: minDistance };
}

/**
 * 다음 회전 노드까지의 거리와 방향 계산 (진행 방향 고려)
 */
export function getNextTurnInfo(
  currentLocation: [number, number],
  currentNodeIndex: number,
  nodes: CourseTopologyNode[],
): {
  nextNodeIndex: number | null;
  distance: number;
  instruction: NavigationInstruction | null;
} {
  // 다음 노드가 없으면 null 반환
  if (currentNodeIndex >= nodes.length - 1) {
    return { nextNodeIndex: null, distance: 0, instruction: null };
  }

  // 현재 노드에서 다음 노드로의 진행 방향 계산
  const currentBearing = calculateBearing(
    nodes[currentNodeIndex].location,
    currentLocation,
  );

  // 진행 방향을 고려하여 다음 회전점 찾기
  let nextTurnNodeIndex = currentNodeIndex + 1;
  let nextTurnNode = nodes[nextTurnNodeIndex];

  // 진행 방향에 맞는 회전점을 찾을 때까지 반복
  while (nextTurnNodeIndex < nodes.length - 1) {
    const nodeBearing = calculateBearing(
      currentLocation,
      nextTurnNode.location,
    );

    // 진행 방향과 노드 방향의 차이가 90도 이내인 경우 (앞쪽에 있는 노드)
    const bearingDiff = Math.abs(currentBearing - nodeBearing);
    const isAhead = bearingDiff <= 90 || bearingDiff >= 270;

    if (
      isAhead &&
      Math.abs(nextTurnNode.bearing) >= STRAIGHT_THRESHOLD_DEGREE
    ) {
      break; // 회전이 필요한 노드를 찾음
    }

    nextTurnNodeIndex++;
    nextTurnNode = nodes[nextTurnNodeIndex];
  }

  // 회전점을 찾지 못했으면 null 반환
  if (nextTurnNodeIndex >= nodes.length) {
    return { nextNodeIndex: null, distance: 0, instruction: null };
  }

  const distance = calculateDistance(currentLocation, nextTurnNode.location);

  // 직진이면 안내하지 않음
  if (Math.abs(nextTurnNode.bearing) < STRAIGHT_THRESHOLD_DEGREE) {
    return { nextNodeIndex: nextTurnNodeIndex, distance, instruction: null };
  }

  const { direction, scale } = makeRotationInfo(nextTurnNode.bearing);

  const instruction: NavigationInstruction = {
    direction,
    scale,
    distance: Math.round(distance),
    type: 'turn',
  };

  return {
    nextNodeIndex: nextTurnNodeIndex,
    distance,
    instruction,
  };
}

/**
 * 회전 안내가 필요한지 확인
 */
export function shouldShowTurnWarning(
  distanceToNextNode: number,
  instruction: NavigationInstruction | null,
): boolean {
  return (
    instruction !== null &&
    distanceToNextNode <= TURN_WARNING_DISTANCE &&
    distanceToNextNode > 0
  );
}

/**
 * 네비게이션 안내 메시지 생성
 */
export function generateNavigationMessage(
  instruction: NavigationInstruction,
  distance: number,
): string {
  const { direction, scale } = instruction;

  if (instruction.type === 'warning') {
    return makeWarnInstruction(distance, direction === '왼쪽' ? 90 : -90);
  }

  // 5m 이내에서만 표시되므로 간단한 메시지
  return `${direction}으로 ${scale}하세요`;
}
