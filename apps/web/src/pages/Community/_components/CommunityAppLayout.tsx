import AppLayout from '@/components/layout/AppLayout';
import CommunityNavigator from '@/pages/Community/_components/CommunityNavigator';
import type { NavKey } from '@/types/community';
import styled from '@emotion/styled';

type BaseProps = React.ComponentProps<typeof AppLayout>;
type Props = BaseProps & { activeNav?: NavKey };

const TAB_BAR_HEIGHT = 60;

export default function CommunityAppLayout({ children, ...rest }: Props) {
  return (
    <>
      <ScrollContainer>
        <InnerScroll paddingBottom={TAB_BAR_HEIGHT}>
          <AppLayout {...rest}>{children}</AppLayout>
        </InnerScroll>
      </ScrollContainer>
      <FixedNav>
        <CommunityNavigator />
      </FixedNav>
    </>
  );
}

const ScrollContainer = styled.div`
  min-height: 100vh;
  /* iOS 부드러운 스크롤 */
  -webkit-overflow-scrolling: touch;
`;

const InnerScroll = styled.div<{ paddingBottom: number }>`
  overflow-y: auto;
  /* AppLayout이 내부에서 height를 쓰더라도 여기가 스크롤을 맡습니다 */
  max-height: 100vh;
  padding-bottom: ${({ paddingBottom }) => `${paddingBottom}px`};
`;

const FixedNav = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50; /* 컨텐츠 위에 오도록 */
`;
