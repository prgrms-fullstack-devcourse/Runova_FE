import styled from '@emotion/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell } from 'lucide-react-native';
import Header from '@/components/Header';
import FloatingImageContainer from './_components/FloatingImageContainer';
import CardContainer from './_components/CardContainer';

export default function Home() {
  const handleLocationPress = () => {
    console.log('위치 버튼 클릭');
  };

  const handleNotificationPress = () => {
    console.log('알림 버튼 클릭');
  };

  const handleRecommendationPress = (item: RecommendationData) => {
    console.log('추천 경로 클릭:', item.title);
  };

  return (
    <Screen>
      <GradientBackground
        colors={['#181820', '#242431', '#38384A', '#555571', '#646486']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Header
          isHome
          locationText="서울시 노원구 덕릉로 123"
          onLocationPress={handleLocationPress}
          rightIcon={Bell}
          onRightPress={handleNotificationPress}
        />

        <FloatingImageContainer />

        <ScrollContainer>
          <ContentContainer>
            <CardContainer onRecommendationPress={handleRecommendationPress} />
          </ContentContainer>
        </ScrollContainer>
      </GradientBackground>
    </Screen>
  );
}

import type { RecommendationData } from '@/types/card.types';

const Screen = styled.View({
  flex: 1,
});

const GradientBackground = styled(LinearGradient)({
  flex: 1,
});

const ScrollContainer = styled.View({
  flex: 1,
  padding: 16,
  paddingBottom: 80,
});

const ContentContainer = styled.View({
  paddingTop: 300,
  paddingBottom: 50,
});
