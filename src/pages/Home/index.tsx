import styled from '@emotion/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import Header from '@/components/Header';
import FloatingImageContainer from './_components/FloatingImageContainer';
import StarryBackground from '@/components/StarryBackground';
import { useInitialLocation } from '@/hooks/useInitialLocation';
import { reverseGeocode } from '@/lib/geocoding';

export default function Home() {
  const [address, setAddress] = useState<string>('위치 정보를 가져오는 중...');
  const { location, loading } = useInitialLocation();

  useEffect(() => {
    const getAddressFromLocation = async () => {
      if (location?.coords) {
        try {
          const geocodingResult = await reverseGeocode([
            location.coords.longitude,
            location.coords.latitude,
          ]);
          setAddress(geocodingResult.address);
        } catch (error) {
          console.error('지오코딩 실패:', error);
          setAddress('위치를 찾을 수 없습니다');
        }
      } else if (!loading) {
        setAddress('위치 정보를 사용할 수 없습니다');
      }
    };

    getAddressFromLocation();
  }, [location, loading]);

  const handleLocationPress = () => {
    console.log('위치 버튼 클릭');
  };

  return (
    <Screen>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <GradientBackground
        colors={['#1a1a1a', '#2d2d2d', '#404040', '#6b7280', '#9ca3af']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <StarryBackground />

        <Header
          isHome
          locationText={address}
          onLocationPress={handleLocationPress}
        />

        <FloatingImageContainer />

        <ScrollContainer>
          <ContentContainer></ContentContainer>
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
