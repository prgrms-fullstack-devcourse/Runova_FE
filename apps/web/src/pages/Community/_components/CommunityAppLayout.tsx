import AppLayout from '@/components/layout/AppLayout';
import CommunityNavigator from '@/pages/Community/_components/CommunityNavigator';
import type { NavKey } from '@/types/community';
import styled from '@emotion/styled';

type BaseProps = React.ComponentProps<typeof AppLayout>;
type Props = BaseProps & { activeNav?: NavKey };

const DEFAULT_TAB_BAR_HEIGHT = 60;

export default function CommunityAppLayout({ children, ...rest }: Props) {
  return (
    <>
      <Container>
        <AppLayout {...rest}>{children}</AppLayout>
      </Container>
      <CommunityNavigator />
    </>
  );
}

const Container = styled.div`
  flex: 1;
  padding-bottom: ${DEFAULT_TAB_BAR_HEIGHT};
`;
