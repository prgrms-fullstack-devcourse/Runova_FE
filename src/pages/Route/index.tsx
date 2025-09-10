import styled from '@emotion/native';
import { useEffect } from 'react';
import { Settings, PenTool } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';
import FloatingButton from '@/components/FloatingButton';
import RouteGrid from './_components/RouteGrid';
import type { RouteTabId } from '@/types/navigation.types';
import type { RouteStackParamList } from '@/navigation/RouteStackNavigator';
import useRouteStore from '@/store/route';
import { useRouteData } from '@/hooks/api/useRouteApi';

type Props = NativeStackScreenProps<RouteStackParamList, 'RouteMain'>;

const tabs: Array<{ id: RouteTabId; title: string }> = [
  { id: 'created', title: '생성한 경로' },
  { id: 'completed', title: '완주한 경로' },
  { id: 'liked', title: '좋아요한 경로' },
];

export default function Route({ navigation }: Props) {
  const { activeTab, setActiveTab, courses } = useRouteStore();
  const { loadCourses } = useRouteData();

  useEffect(() => {
    if (activeTab === 'created' && courses.length === 0) {
      loadCourses(true);
    }
  }, [activeTab, courses.length, loadCourses]);

  const handleSettingsPress = () => {};

  const handleCreatePress = () => {
    navigation.navigate('Draw', {});
  };

  const handleTabPress = (tabId: RouteTabId) => {
    setActiveTab(tabId);
    if (tabId === 'created') {
      loadCourses(true);
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
      <RouteGrid />
      <FloatingButton icon={PenTool} onPress={handleCreatePress} />
    </Screen>
  );
}

const Screen = styled.View({
  flex: 1,
  backgroundColor: '#ffffff',
});
