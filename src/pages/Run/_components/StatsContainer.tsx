import styled from '@emotion/native';
import useRunStore from '@/store/run';

const formatPace = (paceSeconds: number): string => {
  if (paceSeconds === 0) return '0\'00"';

  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.floor(paceSeconds % 60);
  return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
};

export default function StatsContainer() {
  const { stats } = useRunStore();
  return (
    <StatsContainerWrapper>
      <RunningTimeContainer>
        <RunningTimeLabel>달린 시간</RunningTimeLabel>
        <RunningTimeValue>{stats.runningTime}</RunningTimeValue>
      </RunningTimeContainer>
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
          <StatValue>{formatPace(stats.pace)}</StatValue>
          <StatLabel>페이스</StatLabel>
        </StatItem>
      </StatsRow>
    </StatsContainerWrapper>
  );
}

const StatsContainerWrapper = styled.View(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: 20,
  shadowColor: theme.colors.gray[900],
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 8,
  paddingBottom: 48,
}));

const StatsRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
});

const StatItem = styled.View({
  alignItems: 'center',
  flex: 1,
});

const StatValue = styled.Text(({ theme }) => ({
  fontSize: 20,
  fontWeight: '700',
  color: theme.colors.gray[900],
  marginBottom: 4,
}));

const StatLabel = styled.Text(({ theme }) => ({
  fontSize: 12,
  fontWeight: '500',
  color: theme.colors.gray[600],
}));

const RunningTimeContainer = styled.View(({ theme }) => ({
  backgroundColor: theme.colors.primary[500],
  borderRadius: 12,
  paddingVertical: 16,
  paddingHorizontal: 20,
  marginBottom: 16,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const RunningTimeLabel = styled.Text({
  fontSize: 16,
  fontWeight: '600',
  color: '#ffffff',
});

const RunningTimeValue = styled.Text({
  fontSize: 24,
  fontWeight: '700',
  color: '#ffffff',
});
