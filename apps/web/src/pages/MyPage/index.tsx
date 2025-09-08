// pages/mypage/index.tsx
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import ProfileSection from './_components/ProfileSection';
import Section from '@/components/common/Section';
import SectionHeader from '@/components/common/SectionHeader';
import StatCard from '@/components/common/StatCard';
import RouteItem from '@/components/common/RouteItem';
import PostCard from '@/components/common/PostCard';
import CertItem from '@/components/common/CertItem';
import type { RoutePreview, PostPreview, CertPreview } from '@/types/mypage';
import { getMyOverview, getReadableMyPageError } from '@/api/mypage';
import type { ProfileRes } from '@/api/mypage';

export default function MyPage() {
  const [profile, setProfile] = useState<ProfileRes | null>(null);
  const [routes, setRoutes] = useState<RoutePreview[]>([]);
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [certs, setCerts] = useState<CertPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { profile, routes, posts, certs } = await getMyOverview();
        if (!mounted) return;
        setProfile(profile);
        setRoutes(routes);
        setPosts(posts);
        setCerts(certs);
      } catch (e) {
        setErr(getReadableMyPageError(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Wrap>
      <Header title="마이페이지" />
      <Main>
        <ProfileSection
          profile={
            profile
              ? {
                  nickname: profile.nickname,
                  avatarUrl: profile.avatarUrl,
                  createdAt: profile.createdAt,
                }
              : undefined
          }
          onEdit={() => alert('프로필 편집은 준비 중입니다.')}
        />

        <Section>
          <SectionHeader title="러닝 통계" />
          <HScroll>
            <StatCard
              iconClass="ri-map-pin-range-line"
              iconBg="#dbeafe"
              iconColor="#2563eb"
              value="247.5"
              label="총 거리 (km)"
            />
            <StatCard
              iconClass="ri-time-line"
              iconBg="#dcfce7"
              iconColor="#16a34a"
              value="42h"
              label="총 시간"
            />
            <StatCard
              iconClass="ri-trophy-line"
              iconBg="#f3e8ff"
              iconColor="#7c3aed"
              value="89"
              label="완주 횟수"
            />
            <StatCard
              iconClass="ri-fire-line"
              iconBg="#ffedd5"
              iconColor="#f97316"
              value="12,450"
              label="칼로리 (kcal)"
            />
          </HScroll>
        </Section>

        <Section>
          <SectionHeader title="나의 경로" to="/mypage/routes" />
          {loading && <Hint>불러오는 중…</Hint>}
          {err && <ErrorText>{err}</ErrorText>}
          <VStack12>
            {routes.length === 0 && !loading ? (
              <Empty>저장된 경로가 없습니다.</Empty>
            ) : (
              routes.map((r) => <RouteItem key={r.id} data={r} />)
            )}
          </VStack12>
        </Section>

        <Section>
          <SectionHeader title="내가 쓴 글" to="/mypage/posts" />
          {loading && <Hint>불러오는 중…</Hint>}
          {err && <ErrorText>{err}</ErrorText>}
          <VStack12>
            {posts.length === 0 && !loading ? (
              <Empty>작성한 글이 없습니다.</Empty>
            ) : (
              posts.map((p) => <PostCard key={p.id} data={p} />)
            )}
          </VStack12>
        </Section>

        <Section>
          <SectionHeader title="나의 인증 사진" to="/mypage/certs" />
          {loading && <Hint>불러오는 중…</Hint>}
          {err && <ErrorText>{err}</ErrorText>}
          <VStack12>
            {certs.length === 0 && !loading ? (
              <Empty>등록된 인증 사진이 없습니다.</Empty>
            ) : (
              certs.map((c) => <CertItem key={c.id} data={c} />)
            )}
          </VStack12>
        </Section>
      </Main>
    </Wrap>
  );
}

const Wrap = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  min-height: 100vh;
`;
const Main = styled.main`
  padding-top: 48px;
  padding-bottom: 80px;
`;
const HScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
`;
const VStack12 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const Hint = styled.div`
  ${({ theme }) => theme.typography.small};
  color: ${({ theme }) => theme.colors.subtext};
  padding: 6px 0 0 0;
`;
const ErrorText = styled.div`
  ${({ theme }) => theme.typography.small};
  color: #ef4444;
  padding: 6px 0 0 0;
`;
const Empty = styled.div`
  ${({ theme }) => theme.typography.small};
  color: ${({ theme }) => theme.colors.subtext};
  padding: 6px 0;
`;
