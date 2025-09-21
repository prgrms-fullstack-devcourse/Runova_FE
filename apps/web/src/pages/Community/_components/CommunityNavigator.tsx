import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useCommunityStore } from '@/stores/communityStore';

const PATH_BY_KEY = {
  route: '/community/feed/share',
  run: '/community/feed/mate',
  photo: '/community/feed/proof',
  all: '/community',
} as const;

export type NavKey = keyof typeof PATH_BY_KEY;

export default function CommunityNavigator() {
  const navigate = useNavigate();
  const active = useCommunityStore((s) => s.activeNav);
  const setActiveNav = useCommunityStore((s) => s.setActiveNav);

  const go = (key: NavKey) => () => {
    if (active !== key) setActiveNav(key);
    navigate(PATH_BY_KEY[key]);
  };

  return (
    <Container role="tablist" aria-label="커뮤니티 내비게이션">
      <TabButton
        role="tab"
        aria-selected={active === 'route'}
        active={active === 'route'}
        onClick={go('route')}
      >
        경로
      </TabButton>
      <TabButton
        role="tab"
        aria-selected={active === 'run'}
        active={active === 'run'}
        onClick={go('run')}
      >
        메이트
      </TabButton>
      <TabButton
        role="tab"
        aria-selected={active === 'photo'}
        active={active === 'photo'}
        onClick={go('photo')}
      >
        인증샷
      </TabButton>
      <TabButton
        role="tab"
        aria-selected={active === 'all'}
        active={active === 'all'}
        onClick={go('all')}
      >
        전체보기
      </TabButton>
    </Container>
  );
}

/** 상단 고정(헤더 바로 아래) */
const Container = styled.nav`
  position: sticky;
  top: 0; /* AppLayout 헤더가 fixed이면 필요에 따라 간격 조절 */
  z-index: ${({ theme }) => theme.zIndex.header};
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  gap: 0;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TabButton = styled.button<{ active?: boolean }>`
  ${({ theme }) => theme.typography.small};
  height: 36px;
  background: ${({ theme, active }) =>
    active ? theme.colors.surfaceAlt : 'transparent'};
  color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.subtext};
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;
