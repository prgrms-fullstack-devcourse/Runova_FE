import styled from '@emotion/styled';
import { ReactNode } from 'react';

const Bar = styled.header`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  z-index: ${({ theme }) => theme.zIndex.header};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
`;

const Side = styled.div`
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Center = styled.div`
  flex: 1;
  text-align: center;
`;

const H1 = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
  color: ${({ theme }) => theme.colors.text};
`;

export default function Header({
  title,
  onBack,
  tabs,
}: {
  title: string;
  onBack?: () => void;
  tabs?: ReactNode;
}) {
  return (
    <Bar>
      <Row>
        <Side>
          {onBack && (
            <button onClick={onBack}>
              <i className="ri-arrow-left-line" />
            </button>
          )}
        </Side>
        <Center>
          <H1>{title}</H1>
        </Center>
        <Side></Side>
      </Row>
      {tabs}
    </Bar>
  );
}
