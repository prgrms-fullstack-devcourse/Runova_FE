export type RootStackParamList = {
  TabNavigator: Record<string, never>; // 파라미터가 없는 경우 명시적으로 빈 객체 사용
  Details: {
    id: string; // Details.tsx에서 route.params.id로 실제 사용됨
  };
};

/**
 * 탭 네비게이션 파라미터 타입
 *
 * 현재 프로젝트에서 실제 사용되는 탭 화면들:
 * - 모든 탭 화면은 현재 파라미터를 받지 않음
 * - 각 화면은 독립적으로 동작하며 외부에서 전달받는 데이터 없음
 */
export type TabParamList = {
  Home: Record<string, never>; // 홈 화면 - 파라미터 불필요
  Route: Record<string, never>; // 경로 화면 - 파라미터 불필요
  Run: Record<string, never>; // 러닝 화면 - 파라미터 불필요
  Community: Record<string, never>; // 커뮤니티 화면 - 파라미터 불필요
  Settings: Record<string, never>; // 설정 화면 - 파라미터 불필요
};

/**
 * Route 화면에서 사용되는 탭 ID 타입
 * Route.tsx에서 실제 사용되는 탭 ID들
 */
export type RouteTabId = 'created' | 'completed' | 'liked';
