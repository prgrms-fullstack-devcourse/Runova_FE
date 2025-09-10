import { View, Text } from 'react-native';
import styled from '@emotion/native';
import { theme } from '@/styles/theme';
import type { RunStats } from '@/utils/runStats';

interface StatsContainerProps {
  stats: RunStats;
}

export default function StatsContainer({ stats }: StatsContainerProps) {
  return (
    <StatsContainerWrapper>
      <StatsRow>
        <StatItem>
          <StatValue>{stats.distance}m</StatValue>
          <StatLabel>거리</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{stats.calories}</StatValue>
          <StatLabel>칼로리</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{stats.pace}</StatValue>
          <StatLabel>페이스</StatLabel>
        </StatItem>
      </StatsRow>
    </StatsContainerWrapper>
  );
}

const StatsContainerWrapper = styled(View)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 20px;
  shadow-color: ${theme.colors.gray[900]};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 8px;
  elevation: 8;
  padding-bottom: 48px;
`;

const StatsRow = styled(View)`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const StatItem = styled(View)`
  align-items: center;
  flex: 1;
`;

const StatValue = styled(Text)`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.gray[900]};
  margin-bottom: 4px;
`;

const StatLabel = styled(Text)`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.gray[600]};
`;
