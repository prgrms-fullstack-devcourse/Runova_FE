import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { getRunningDashboard, type RunningDashboardRes } from '@/api/running';
import SectionHeader from '@/components/common/SectionHeader';
import { fmtDuration } from '@/lib/format';

const nf = (n: number) => new Intl.NumberFormat().format(n);

export default function RunningDashboard() {
  const [data, setData] = useState<RunningDashboardRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getRunningDashboard();
        if (mounted) {
          setData(res);
          setErr(null);
        }
      } catch {
        if (mounted) setErr('대시보드를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Wrap>
      <SectionHeader title="나의 통계" to="/mypage/stats" />

      {loading && <Hint>불러오는 중…</Hint>}
      {err && !loading && <ErrorMsg>{err}</ErrorMsg>}
      {!loading && !err && data && (
        <Grid>
          <Card>
            <Label>달린 거리</Label>
            <Value>{nf(data.totalDistance)}</Value>
            <Unit>단위: km</Unit>
          </Card>
          <Card>
            <Label>달린 시간</Label>
            <Value>{fmtDuration(data.totalDuration)}</Value>
          </Card>
          <Card>
            <Label>러닝 횟수</Label>
            <Value>{nf(data.nRecords)}회</Value>
          </Card>
        </Grid>
      )}
    </Wrap>
  );
}

const Wrap = styled.section`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const Hint = styled.div`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 14px;
`;
const ErrorMsg = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
`;
const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
`;
const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
const Label = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtext};
`;
const Value = styled.div`
  font-size: 20px;
  font-weight: 700;
`;
const Unit = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.subtext};
`;
