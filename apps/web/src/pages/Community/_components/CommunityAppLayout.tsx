import AppLayout from '@/components/layout/AppLayout';
import CommunityNavigator from '@/pages/Community/_components/CommunityNavigator';
import styled from '@emotion/styled';

type BaseProps = React.ComponentProps<typeof AppLayout>;
type Props = BaseProps;

export default function CommunityAppLayout({ children, ...rest }: Props) {
  return (
    <ScrollContainer>
      <AppLayout {...rest}>
        <CommunityNavigator />
        <Content>{children}</Content>
      </AppLayout>
    </ScrollContainer>
  );
}

const ScrollContainer = styled.div`
  min-height: 100vh;
  -webkit-overflow-scrolling: touch;
`;

const Content = styled.div`
  overflow-y: auto;
  max-height: 100%;
`;
