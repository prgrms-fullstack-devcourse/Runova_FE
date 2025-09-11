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
import { useNativeBridgeStore } from '@/stores/nativeBridgeStore'; // ✅ 토큰 구독
import { postToNative } from '@/lib/nativeBridge';

export default function MyPage() {
  const token = useNativeBridgeStore((s) => s.token); // ✅ 브릿지 토큰
  const [profile, setProfile] = useState<UserProfileRes | null>(null);
  const [routes, setRoutes] = useState<RoutePreview[]>([]);
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [certs, setCerts] = useState<CertPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

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
        if (!mounted) return;
        setErr(getReadableUserError(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  const handleMoreRoutes = () => {
    if (window.ReactNativeWebView) {
      postToNative({
        type: 'NAVIGATE',
        payload: { screen: 'ROUTE_LIST', params: { initialTab: 'ALL' } },
      });
    }
  };

  return (
    <Wrap>
      <Header title="마이페이지" />
      <Main>
        {!token && <Hint>로그인 정보를 수신 중…</Hint>}

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
          onMoreClick={handleMoreRoutes}
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

const Hint = styled.div`
  ${({ theme }) => theme.typography.small};
  color: ${({ theme }) => theme.colors.subtext};
  padding: 8px 16px 0;
`;
