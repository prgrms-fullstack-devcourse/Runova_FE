import styled from '@emotion/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell } from 'lucide-react-native';
import Header from '@/components/Header';
import FloatingImageContainer from './_components/FloatingImageContainer';

export default function Home() {
  const handleLocationPress = () => {
    console.log('위치 버튼 클릭');
  };

  const handleNotificationPress = () => {
    console.log('알림 버튼 클릭');
  };

  return (
    <Screen>
      <GradientBackground
        colors={['#1a1a1a', '#2d2d2d', '#404040', '#6b7280', '#9ca3af']}
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
            {/* 추천 경로는 바로가기 화면으로 이동됨 */}
          </ContentContainer>
        </ScrollContainer>
      </GradientBackground>
    </Screen>
  );
}

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
