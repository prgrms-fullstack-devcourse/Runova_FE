import styled from '@emotion/styled';
import Header from './Header';
import { ReactNode } from 'react';

const Frame = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  min-height: 100vh;
`;

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.surface};
`;

const Main = styled.main`
  padding-top: 96px;
  padding-bottom: 24px;
`;

export default function AppLayout({
  title,
  tabs,
  children,
  topOffset = 56,
  onBack,
}: {
  title: string;
  tabs?: ReactNode;
  children: ReactNode;
  topOffset?: number;
  onBack?: () => void;
}) {
  return (
    <Frame>
      <Container>
        <Header title={title} tabs={tabs} onBack={onBack} />
        <Main style={{ paddingTop: topOffset }}>{children}</Main>
      </Container>
    </Frame>
  );
}
