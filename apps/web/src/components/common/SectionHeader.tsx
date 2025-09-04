import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

export default function SectionHeader({
  title,
  to,
}: {
  title: string;
  to?: string;
}) {
  return (
    <Row>
      <Title>{title}</Title>
      {to ? <More to={to}>더보기</More> : <span />}
    </Row>
  );
}

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const More = styled(Link)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;
