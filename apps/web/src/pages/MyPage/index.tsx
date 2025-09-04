import styled from '@emotion/styled';
import Header from '@/components/layout/Header';
import ProfileSection from './_components/ProfileSection';
import Section from '@/components/common/Section';
import SectionHeader from '@/components/common/SectionHeader';
import StatCard from '@/components/common/StatCard';
import RouteItem from '@/components/common/RouteItem';
import PostCard from '@/components/common/PostCard';
import CertItem from '@/components/common/CertItem';
import type { RoutePreview, PostPreview, CertPreview } from '@/types/mypage';

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

const mockRoutes: RoutePreview[] = [
  {
    id: 'r1',
    title: '한강공원 코스',
    meta: `5.2km • 평균 페이스 5'30"`,
    savedAt: '2024.01.15 저장',
    thumbnail: 'https://picsum.photos/160/160',
  },
  {
    id: 'r2',
    title: '올림픽공원 둘레길',
    meta: `3.8km • 평균 페이스 6'10"`,
    savedAt: '2024.01.12 저장',
    thumbnail: 'https://picsum.photos/160/160',
  },
];

const mockPosts: PostPreview[] = [
  {
    id: 'p1',
    title: '첫 10km 완주 후기!',
    excerpt: '드디어 목표했던 10km를 완주했습니다. 처음엔 힘들었지만...',
    date: '2024.01.14',
    like: 24,
    comments: 8,
  },
  {
    id: 'p2',
    title: '겨울 러닝 준비물 추천',
    excerpt: '추운 날씨에도 꾸준히 달리기 위한 필수 아이템들을 정리해봤어요...',
    date: '2024.01.10',
    like: 18,
    comments: 12,
  },
];

const mockCerts: CertPreview[] = [
  {
    id: 'c1',
    title: '오늘의 아침 러닝 완료!',
    place: '한강공원 • 5.2km',
    datetime: '2024.01.15 오전 7:30',
    thumbnail: 'https://picsum.photos/160/160',
  },
  {
    id: 'c2',
    title: '저녁 러닝 목표 달성!',
    place: '올림픽공원 • 3.8km',
    datetime: '2024.01.12 오후 6:45',
    thumbnail: 'https://picsum.photos/160/160',
  },
];

export default function MyPage() {
  return (
    <Wrap>
      <Header title="마이페이지" />
      <Main>
        <ProfileSection />

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
          <VStack12>
            {mockRoutes.map((r) => (
              <RouteItem key={r.id} data={r} />
            ))}
          </VStack12>
        </Section>

        <Section>
          <SectionHeader title="내가 쓴 글" to="/mypage/posts" />
          <VStack12>
            {mockPosts.map((p) => (
              <PostCard key={p.id} data={p} />
            ))}
          </VStack12>
        </Section>

        <Section>
          <SectionHeader title="나의 인증 사진" to="/mypage/certs" />
          <VStack12>
            {mockCerts.map((c) => (
              <CertItem key={c.id} data={c} />
            ))}
          </VStack12>
        </Section>
      </Main>
    </Wrap>
  );
}
