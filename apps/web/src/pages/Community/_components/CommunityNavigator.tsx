import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useCommunityStore } from '@/stores/communityStore';

export default function CommunityNavigator() {
  const navigate = useNavigate();
  const active = useCommunityStore((s) => s.activeNav);
  const setActiveNav = useCommunityStore((s) => s.setActiveNav);

  const go = (key: Parameters<typeof setActiveNav>[0], path: string) => () => {
    if (active !== key) setActiveNav(key);
    navigate(path);
  };

  return (
    <Container>
      <NavItem
        active={active === 'home'}
        aria-current={active === 'home' ? 'page' : undefined}
        onClick={go('home', '/community')}
      >
        <i className="ri-home-4-fill" />
        <span>홈</span>
      </NavItem>

      <NavItem
        active={active === 'photo'}
        aria-current={active === 'photo' ? 'page' : undefined}
        onClick={go('photo', '/community/feed/photo')}
      >
        <i className="ri-camera-2-fill" />
        <span>인증샷</span>
      </NavItem>

      <NavItem
        active={active === 'route'}
        aria-current={active === 'route' ? 'page' : undefined}
        onClick={go('route', '/community/feed/route')}
      >
        <i className="ri-route-line" />
        <span>경로</span>
      </NavItem>

      <NavItem
        active={active === 'run'}
        aria-current={active === 'run' ? 'page' : undefined}
        onClick={go('run', '/community/feed/run')}
      >
        <i className="ri-run-fill" />
        <span>메이트</span>
      </NavItem>
    </Container>
  );
}

const Container = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 6px 0;
  z-index: ${({ theme }) => theme.zIndex.header};
`;

const NavItem = styled.button<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  ${({ theme }) => theme.typography.small};
  color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.subtext};

  i {
    font-size: 20px;
    line-height: 1;
  }
`;
