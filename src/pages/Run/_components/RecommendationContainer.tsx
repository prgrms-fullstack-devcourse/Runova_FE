import styled from '@emotion/native';
import { FlatList, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import type { CourseSearchItem } from '@/types/courses.types';
import { reverseGeocode } from '@/lib/geocoding';

const { width: screenWidth } = Dimensions.get('window');

interface RecommendationContainerProps {
  onRecommendationPress: (item: CourseSearchItem) => void;
  recommendations: CourseSearchItem[];
}

export default function RecommendationContainer({
  onRecommendationPress,
  recommendations,
}: RecommendationContainerProps) {
  const [geocodedAddresses, setGeocodedAddresses] = useState<
    Record<number, string>
  >({});

  // 추천 경로가 변경될 때마다 지오코딩 수행
  useEffect(() => {
    const geocodeRecommendations = async () => {
      const newAddresses: Record<number, string> = {};

      for (const item of recommendations) {
        if (!geocodedAddresses[item.id]) {
          try {
            const result = await reverseGeocode([
              item.departure[0],
              item.departure[1],
            ]);
            newAddresses[item.id] = result.placeName;
          } catch (error) {
            console.error('지오코딩 실패:', error);
            newAddresses[item.id] = '알 수 없는 위치';
          }
        }
      }

      if (Object.keys(newAddresses).length > 0) {
        setGeocodedAddresses((prev) => ({ ...prev, ...newAddresses }));
      }
    };

    if (recommendations.length > 0) {
      geocodeRecommendations();
    }
  }, [recommendations, geocodedAddresses]);

  // 안내 카드 데이터
  const guideCard = {
    id: 'guide',
    title: '🏃‍♂️ 런닝을 시작해보세요!',
    subtitle:
      '바로 달리기 또는 추천 경로를 선택하여 런닝을 시작할 수 있습니다.',
  };

  // 데이터 배열 생성 (안내 카드 + 추천 경로)
  const data = [guideCard, ...recommendations];

  return (
    <RecommendationOverlay>
      <FlatList
        data={data}
        renderItem={({ item, index }) => {
          // 첫 번째 카드는 안내 문구
          if (index === 0) {
            const guideItem = item as typeof guideCard;
            return (
              <GuideCard style={{ width: screenWidth - 32, marginRight: 32 }}>
                <GuideTitle>{guideItem.title}</GuideTitle>
                <GuideSubtitle>{guideItem.subtitle}</GuideSubtitle>
              </GuideCard>
            );
          }

          // 추천 경로 카드
          const courseItem = item as CourseSearchItem;
          const address = geocodedAddresses[courseItem.id] || '로딩 중...';
          return (
            <Card
              imageSource={{ uri: courseItem.imageUrl }}
              content={{
                title: courseItem.title,
                subtitle: `${address} • ${Math.floor(courseItem.length)}m • ${Math.floor(courseItem.time)}분`,
              }}
              mode="image-with-text"
              variant="light"
              onPress={() => onRecommendationPress(courseItem)}
              fullWidth={true}
              style={{ width: screenWidth - 32, marginRight: 32 }}
            />
          );
        }}
        keyExtractor={(item, index) =>
          index === 0 ? 'guide' : item.id.toString()
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={true}
        snapToInterval={screenWidth}
        decelerationRate="fast"
      />
    </RecommendationOverlay>
  );
}

const RecommendationOverlay = styled.View({
  position: 'absolute',
  top: 20,
  left: 0,
  right: 0,
  zIndex: 1000,
  paddingHorizontal: 16,
});

const GuideCard = styled.View({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 16,
  padding: 24,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 100,
});

const GuideTitle = styled.Text({
  fontSize: 20,
  fontWeight: '700',
  color: '#2d2d2d',
  textAlign: 'center',
  marginBottom: 12,
});

const GuideSubtitle = styled.Text({
  fontSize: 14,
  fontWeight: '400',
  color: '#666666',
  textAlign: 'center',
  lineHeight: 20,
});
