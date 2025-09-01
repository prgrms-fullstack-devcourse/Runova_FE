import styled from '@emotion/styled';
import AppLayout from '@/components/layout/AppLayout';
import CommunityNavigator from '@/pages/Community/_components/CommunityNavigator';
import type { NavKey } from '@/types/community';

type BaseProps = React.ComponentProps<typeof AppLayout>;
type Props = BaseProps & { activeNav?: NavKey };

export default function CommunityAppLayout({ children, ...rest }: Props) {
  return (
    <>
      <AppLayout {...rest}>
        {children}
        <BottomSpacer />
      </AppLayout>
      <CommunityNavigator />
    </>
  );
}

const BottomSpacer = styled.div`
  height: calc(
    56px + env(safe-area-inset-bottom, 0px)
  ); /* 내비 높이만큼 여백 */
`;
