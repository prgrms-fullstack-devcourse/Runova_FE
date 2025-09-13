import { useState } from 'react';
import { View } from 'react-native';
import styled from '@emotion/native';
import { Play } from 'lucide-react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigation from '@/components/TabNavigation';
import Header from '@/components/Header';

import Route from '@/pages/Route';
import Draw from '@/pages/Draw';
import RouteSave from '@/pages/RouteSave';
import Detail from '@/pages/Detail';
import Run from '@/pages/Run';

const Stack = createNativeStackNavigator();

type RunTabId = 'quickstart' | 'courseselection';

const tabs: Array<{ id: RunTabId; title: string }> = [
  { id: 'quickstart', title: '바로가기' },
  { id: 'courseselection', title: '코스 선택하기' },
];

// 바로가기 메인 컴포넌트
function QuickStartMain({ navigation }: { navigation: any }) {
  const [activeTab, setActiveTab] = useState<RunTabId>('quickstart');

  const handleStartPress = () => {
    navigation.navigate('Run', {});
  };

  const handleTabPress = (tabId: RunTabId) => {
    setActiveTab(tabId);
  };

  const handleCourseStart = (courseId: number) => {
    navigation.navigate('Run', { courseId });
  };

  const renderContent = () => {
    if (activeTab === 'quickstart') {
      return (
        <QuickStartContainer>
          <StartButton onPress={handleStartPress}>
            <PlayIcon size={32} color="#ffffff" />
            <StartButtonText>러닝 시작</StartButtonText>
          </StartButton>
        </QuickStartContainer>
      );
    } else {
      return <Route navigation={navigation} onStartRun={handleCourseStart} />;
    }
  };

  return (
    <Container>
      <Header title="러닝" />
      <TabNavigation<RunTabId>
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
      {renderContent()}
    </Container>
  );
}

export default function RunTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuickStartMain" component={QuickStartMain} />
      <Stack.Screen name="Draw" component={Draw} />
      <Stack.Screen name="RouteSave" component={RouteSave} />
      <Stack.Screen name="Detail" component={Detail} />
      <Stack.Screen name="Run" component={Run} />
    </Stack.Navigator>
  );
}

const Container = styled.View({
  flex: 1,
  backgroundColor: '#ffffff',
});

const QuickStartContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f8f9fa',
});

const StartButton = styled.TouchableOpacity({
  backgroundColor: '#ff6b35',
  paddingHorizontal: 48,
  paddingVertical: 24,
  borderRadius: 16,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
});

const PlayIcon = styled(Play)({
  // styled component for Play icon
});

const StartButtonText = styled.Text({
  color: '#ffffff',
  fontSize: 18,
  fontWeight: 'bold',
});
