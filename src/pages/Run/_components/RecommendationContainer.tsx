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

  return (
    <RecommendationOverlay
      style={{ opacity: recommendations.length > 0 ? 1 : 0 }}
    >
      {recommendations.length > 0 && (
        <FlatList
          data={recommendations}
          renderItem={({ item }) => {
            const address = geocodedAddresses[item.id] || '로딩 중...';
            return (
              <Card
                imageSource={{ uri: item.imageUrl }}
                content={{
                  title: item.title,
                  subtitle: `${address} • ${Math.floor(item.length)}m • ${Math.floor(item.time)}분`,
                }}
                mode="image-with-text"
                variant="light"
                onPress={() => onRecommendationPress(item)}
                fullWidth={true}
                style={{ width: screenWidth - 32, marginRight: 32 }}
              />
            );
          }}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          snapToInterval={screenWidth}
          decelerationRate="fast"
        />
      )}
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
