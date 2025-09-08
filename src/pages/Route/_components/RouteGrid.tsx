import styled from '@emotion/native';
import { ScrollView } from 'react-native';
import Card from '@/components/Card';
import type { RouteCardData } from '@/types/card.types';
import { routeData } from '@/__mocks__/routeInfo.mock';

interface RouteGridProps {
  onRouteCardPress: (cardData: RouteCardData) => void;
}

export default function RouteGrid({ onRouteCardPress }: RouteGridProps) {
  const renderRouteCards = () => {
    const cards = [];
    for (let i = 0; i < routeData.length; i += 2) {
      const leftCard = routeData[i];
      const rightCard = routeData[i + 1];

      cards.push(
        <RouteRow key={i}>
          <Card
            imageSource={require('@/assets/gps art sample1.png')}
            content={{ hasStar: leftCard.hasStar }}
            mode="only-image"
            onPress={() => onRouteCardPress(leftCard)}
          />

          {rightCard && (
            <Card
              imageSource={require('@/assets/gps art sample1.png')}
              content={{ hasStar: rightCard.hasStar }}
              mode="only-image"
              onPress={() => onRouteCardPress(rightCard)}
              style={{ marginRight: 0 }}
            />
          )}
        </RouteRow>,
      );
    }
    return cards;
  };

  return (
    <ScrollView>
      <RouteGridContainer>{renderRouteCards()}</RouteGridContainer>
    </ScrollView>
  );
}
const RouteGridContainer = styled.View({
  flex: 1,
  padding: 16,
});

const RouteRow = styled.View({
  flexDirection: 'row',
  marginBottom: 16,
});
