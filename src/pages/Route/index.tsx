import styled from '@emotion/native';
import { useState } from 'react';
import { Settings, PenTool } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';
import FloatingButton from '@/components/FloatingButton';
import RouteGrid from './_components/RouteGrid';
import type { RouteTabId } from '@/types/navigation.types';
import type { RouteStackParamList } from '@/navigation/RouteStackNavigator';
import type { RouteCardData } from '@/types/card.types';

type Props = NativeStackScreenProps<RouteStackParamList, 'RouteMain'>;

const tabs: Array<{ id: RouteTabId; title: string }> = [
  { id: 'created', title: '생성한 경로' },
  { id: 'completed', title: '완주한 경로' },
  { id: 'liked', title: '좋아요한 경로' },
];

export default function Route({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<RouteTabId>('created');

  const handleSettingsPress = () => {
    console.log('설정');
  };

  const handleCreatePress = () => {
    navigation.navigate('Draw', {});
  };

  const handleTabPress = (tabId: RouteTabId) => {
    setActiveTab(tabId);
  };

  const handleRouteCardPress = (cardData: RouteCardData) => {
    console.log('경로 카드 클릭:', cardData.id);
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
