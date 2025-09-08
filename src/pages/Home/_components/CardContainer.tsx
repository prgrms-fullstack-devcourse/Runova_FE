import styled from '@emotion/native';
import { FlatList, Dimensions } from 'react-native';
import Card from '@/components/Card';
import type { RecommendationData } from '@/types/card.types';
import { recommendationData } from '@/__mocks__/routeInfo.mock';
const { width: screenWidth } = Dimensions.get('window');

interface CardContainerProps {
  onRecommendationPress: (item: RecommendationData) => void;
}

export default function CardContainer({
  onRecommendationPress,
}: CardContainerProps) {
  return (
    <>
      <CardRow>
        <Card>
          <CardTitle>지금까지 달린 거리</CardTitle>
          <CardValue>00.000Km</CardValue>
        </Card>
        <Card style={{ marginRight: 0 }}>
          <CardTitle>완주한 ART</CardTitle>
          <CardValue>5개</CardValue>
        </Card>
      </CardRow>
      <FlatList
        data={recommendationData}
        renderItem={({ item }) => (
          <Card
            imageSource={require('@/assets/gps art sample1.png')}
            content={{
              cardTitle: '추천 경로',
              title: item.title,
              subtitle: item.subtitle,
              stats: [
                { label: '거리', value: item.distance },
                { label: '시간', value: item.time },
              ],
            }}
            mode="image-with-text"
            onPress={() => onRecommendationPress(item)}
            fullWidth={true}
            style={{ width: screenWidth - 32, marginRight: 32 }}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={true}
        snapToInterval={screenWidth}
        decelerationRate="fast"
      />
    </>
  );
}

const CardTitle = styled.Text({
  color: '#ffffff',
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 8,
});

const CardValue = styled.Text({
  color: '#ffffff',
  fontSize: 24,
  fontWeight: 'bold',
});

const CardRow = styled.View({
  flexDirection: 'row',
  marginBottom: 16,
});
