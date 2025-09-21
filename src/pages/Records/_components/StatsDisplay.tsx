import styled from '@emotion/native';
import {
  formatDistance,
  formatTime,
  formatPace,
  formatNumber,
} from '@/utils/formatters';
import type { RunningDashboard } from '@/types/records.types';

interface StatsDisplayProps {
  dashboard: RunningDashboard;
}

export default function StatsDisplay({ dashboard }: StatsDisplayProps) {
  return (
    <Container>
      <MainStatsContainer>
        <TotalDistanceContainer>
          <TotalDistanceText>
            {formatDistance(dashboard.totalDistance)}
          </TotalDistanceText>
        </TotalDistanceContainer>
      </MainStatsContainer>

      <StatsGrid>
        <StatBox>
          <StatValue>{dashboard.nRecords}회</StatValue>
          <StatLabel>총 횟수</StatLabel>
        </StatBox>

        <StatBox>
          <StatValue>{formatTime(dashboard.totalDuration)}</StatValue>
          <StatLabel>총 시간</StatLabel>
        </StatBox>

        <StatBox>
          <StatValue>{formatNumber(dashboard.totalCalories)}kcal</StatValue>
          <StatLabel>총 칼로리</StatLabel>
        </StatBox>

        <StatBox>
          <StatValue>{formatPace(dashboard.meanPace)}</StatValue>
          <StatLabel>평균 페이스</StatLabel>
        </StatBox>
      </StatsGrid>
    </Container>
  );
}

const Container = styled.View({
  paddingHorizontal: 16,
  paddingVertical: 12,
});

const MainStatsContainer = styled.View({
  marginBottom: 20,
});

const TotalDistanceContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'baseline',
  gap: 8,
});

const TotalDistanceText = styled.Text({
  fontSize: 32,
  fontWeight: '700',
  color: '#2d2d2d',
});

const StatsGrid = styled.View({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12,
});

const StatBox = styled.View({
  flex: 1,
  minWidth: '45%',
  backgroundColor: '#f8f9fa',
  padding: 16,
  borderRadius: 12,
  alignItems: 'center',
});

const StatValue = styled.Text({
  fontSize: 18,
  fontWeight: '600',
  color: '#2d2d2d',
  marginBottom: 4,
});

const StatLabel = styled.Text({
  fontSize: 12,
  fontWeight: '400',
  color: '#666666',
});
