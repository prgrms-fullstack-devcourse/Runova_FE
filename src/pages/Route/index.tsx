import styled from '@emotion/native';
import { useEffect } from 'react';
import { Settings, PenTool } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';
import FloatingButton from '@/components/FloatingButton';
import RouteGrid from './_components/RouteGrid';
import type { RouteTabId, TabParamList } from '@/types/navigation.types';
import type { RouteStackParamList } from '@/navigation/RouteStackNavigator';
import type {
  BookmarkedCourseItem,
  CourseSearchItem,
} from '@/types/courses.types';
import useRouteStore from '@/store/route';
import {
  useRouteData,
  useBookmarkedCourses,
  useCompletedCourses,
} from '@/hooks/api/useRouteApi';

type Props = CompositeScreenProps<
  NativeStackScreenProps<RouteStackParamList, 'RouteMain'>,
  BottomTabScreenProps<TabParamList>
>;

const tabs: Array<{ id: RouteTabId; title: string }> = [
  { id: 'created', title: '생성한 경로' },
  { id: 'completed', title: '완주한 경로' },
  { id: 'liked', title: '좋아요한 경로' },
];

export default function Route({ navigation }: Props) {
  const {
    activeTab,
    setActiveTab,
    courses,
    bookmarkedCourses,
    completedCourses,
  } = useRouteStore();
  const { loadCourses } = useRouteData();
  const { loadBookmarkedCourses } = useBookmarkedCourses();
  const { loadCompletedCourses } = useCompletedCourses();

  const handleRouteCardPress = (courseId: number) => {
    // 현재 탭의 데이터에서 해당 courseId 찾기
    let courseData: BookmarkedCourseItem | CourseSearchItem | null = null;

    if (activeTab === 'created') {
      courseData = courses.find((course) => course.id === courseId) || null;
    } else if (activeTab === 'liked') {
      courseData =
        bookmarkedCourses.find((course) => course.id === courseId) || null;
    } else if (activeTab === 'completed') {
      // completed 탭의 경우 courseData는 null로 전달
      courseData = null;
    }

    navigation.navigate('Detail', { courseId, courseData });
  };

  useEffect(() => {
    if (activeTab === 'created' && courses.length === 0) {
      loadCourses(true);
    }
  }, [activeTab, courses.length, loadCourses]);

  const handleSettingsPress = () => {};

  const handleCreatePress = () => {
    navigation.navigate('Draw', undefined);
  };

  const handleTabPress = (tabId: RouteTabId) => {
    setActiveTab(tabId);

    // 탭 전환 시 해당 탭의 데이터가 비어있을 때만 로드
    if (tabId === 'created' && courses.length === 0) {
      loadCourses(true);
    } else if (tabId === 'liked' && bookmarkedCourses.length === 0) {
      loadBookmarkedCourses(true);
    } else if (tabId === 'completed' && completedCourses.length === 0) {
      loadCompletedCourses(true);
    }
  };

  return (
    <Screen>
      <Header
        title="Runova"
        rightIcon={Settings}
        onRightPress={handleSettingsPress}
      />
      <TabNavigation<RouteTabId>
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
      <RouteGrid onRouteCardPress={handleRouteCardPress} />
      <FloatingButton icon={PenTool} onPress={handleCreatePress} />
    </Screen>
  );
}

const Screen = styled.View({
  flex: 1,
  backgroundColor: '#ffffff',
});
