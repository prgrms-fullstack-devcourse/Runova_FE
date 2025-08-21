import styled from '@emotion/native';
import { useState } from 'react';
import { ArrowLeft, Settings, PenTool } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';
import FloatingButton from '@/components/FloatingButton';
import RouteGrid from './_components/RouteGrid';
import type { RouteTabId, TabParamList } from '@/types/navigation.types';
import type { RouteCardData } from '@/types/card.types';

type Props = NativeStackScreenProps<TabParamList, 'Route'>;

const tabs: Array<{ id: RouteTabId; title: string }> = [
  { id: 'created', title: '생성한 경로' },
  { id: 'completed', title: '완주한 경로' },
  { id: 'liked', title: '좋아요한 경로' },
];

export default function Route({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<RouteTabId>('created');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSettingsPress = () => {
    console.log('설정');
  };

  const handleCreatePress = () => {
    console.log('경로 생성');
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
        leftIcon={ArrowLeft}
        rightIcon={Settings}
        onLeftPress={handleBackPress}
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
