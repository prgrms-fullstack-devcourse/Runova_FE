import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import DataSection from './_components/DataSection';
import ProfileSection from './_components/ProfileSection';
import RouteItem from '@/components/common/RouteItem';
import PostCard from '@/components/common/PostCard';
import CertItem from '@/components/common/CertItem';
import type { RoutePreview, PostPreview, CertPreview } from '@/types/mypage';
import { getMeOverview, getReadableUserError } from '@/api/mypage';
import type { UserProfileRes } from '@/api/mypage';

export default function MyPage() {
  const [profile, setProfile] = useState<UserProfileRes | null>(null);
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
        const { profile, routes, posts, certs } = await getMeOverview();
        if (!mounted) return;
        setProfile(profile);
        setRoutes(routes);
        setPosts(posts);
        setCerts(certs);
      } catch (e) {
        setErr(getReadableUserError(e));
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
                  avatarUrl: profile.imageUrl,
                  createdAt: profile.createdAt,
                }
              : undefined
          }
          onAvatarUpdated={(newUrl) =>
            setProfile((prev) => (prev ? { ...prev, imageUrl: newUrl } : prev))
          }
        />
        <DataSection
          title="나의 경로"
          to="/mypage/routes"
          loading={loading}
          error={err}
          items={routes}
          emptyText="저장된 경로가 없습니다."
          renderItem={(r) => <RouteItem key={r.id} data={r} />}
        />

        <DataSection
          title="내가 쓴 글"
          to="/mypage/posts"
          loading={loading}
          error={err}
          items={posts}
          emptyText="작성한 글이 없습니다."
          renderItem={(p) => <PostCard key={p.id} data={p} />}
        />

        <DataSection
          title="나의 인증 사진"
          to="/mypage/certs"
          loading={loading}
          error={err}
          items={certs}
          emptyText="등록된 인증 사진이 없습니다."
          renderItem={(c) => <CertItem key={c.id} data={c} />}
        />
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
