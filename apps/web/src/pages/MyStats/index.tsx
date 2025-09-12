import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from '@emotion/styled';

import AppLayout from '@/components/layout/AppLayout';
import { getRunningDashboard, type RunningDashboardRes } from '@/api/running';
import { useBack } from '@/hooks/useBack';

const nf = (n: number) => new Intl.NumberFormat().format(n);
const toISO = (d: Date) => d.toISOString().split('T')[0];

function usePresetRanges() {
  const today = new Date();
  const d7 = new Date();
  d7.setDate(today.getDate() - 6);
  const d30 = new Date();
  d30.setDate(today.getDate() - 29);
  const yStart = new Date(today.getFullYear(), 0, 1);
  return {
    주: { since: toISO(d7), until: toISO(today) },
    월: { since: toISO(d30), until: toISO(today) },
    년: { since: toISO(yStart), until: toISO(today) },
    전체: { since: undefined, until: undefined },
  };
}

export default function MyStats() {
  const presets = usePresetRanges();
  const [sp, setSp] = useSearchParams();

  const [data, setData] = useState<RunningDashboardRes | null>(null);
  const [loading, setLoading] = useState(true);

  const goBack = useBack('/mypage');

  const since = sp.get('since') || undefined;
  const until = sp.get('until') || undefined;

  const applyRange = (since?: string, until?: string) => {
    const next = new URLSearchParams();
    if (since) next.set('since', since);
    if (until) next.set('until', until);
    setSp(next, { replace: true });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getRunningDashboard({ since, until });
        if (mounted) setData(res);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [since, until]);

  return (
    <AppLayout title="러닝 통계" onBack={goBack} topOffset={48}>
      <Wrap>
        <Filters>
          <SegmentGroup>
            {Object.entries(presets).map(([label, r]) => (
              <SegBtn
                key={label}
                onClick={() => applyRange(r.since, r.until)}
                data-active={
                  (r.since || '') === (since || '') &&
                  (r.until || '') === (until || '')
                }
              >
                {label}
              </SegBtn>
            ))}
          </SegmentGroup>

          <Inputs>
            <input
              type="date"
              value={since ?? ''}
              onChange={(e) => applyRange(e.target.value || undefined, until)}
            />
            <span>~</span>
            <input
              type="date"
              value={until ?? ''}
              onChange={(e) => applyRange(since, e.target.value || undefined)}
            />
          </Inputs>
        </Filters>

        {loading && <Hint>불러오는 중…</Hint>}
        {!loading && data && (
          <Summary>
            <StatBox>
              <Label>달린 거리</Label>
              <Value>{nf(data.totalDistance)}</Value>
              <Unit>단위: km</Unit>
            </StatBox>
            <StatBox>
              <Label>달린 시간</Label>
              <Value>{nf(data.totalDuration)}s</Value>
            </StatBox>
            <StatBox>
              <Label>완주 횟수</Label>
              <Value>{nf(data.nRecords)}회</Value>
            </StatBox>
            <StatBox>
              <Label>평균 페이스</Label>
              <Value>{nf(data.meanPace)}</Value>
              <Unit>단위: km/h</Unit>
            </StatBox>
          </Summary>
        )}
      </Wrap>
    </AppLayout>
  );
}

const Wrap = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const Filters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
`;
const SegmentGroup = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 주/월/년/전체 4등분 */
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  overflow: hidden; /* 둥근 모서리 안에서 버튼들이 이어져 보이도록 */
  background: ${({ theme }) => theme.colors.surface};
`;
const SegBtn = styled.button`
  appearance: none;
  height: 36px;
  width: 100%;
  padding: 0 8px;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 600;

  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }

  &[data-active='true'] {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
  }
`;

const Inputs = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
`;
const Hint = styled.div`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 14px;
`;
const Summary = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;
const StatBox = styled.div`
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
