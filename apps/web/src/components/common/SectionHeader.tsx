import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

type Props = {
  title: string;
  to?: string;
  onMoreClick?: () => void;
  moreText?: string;
};

export default function SectionHeader({
  title,
  to,
  onMoreClick,
  moreText = '더보기',
}: Props) {
  return (
    <Row>
      <Title>{title}</Title>

      {onMoreClick ? (
        <MoreButton
          type="button"
          onClick={onMoreClick}
          aria-label={`${title} ${moreText}`}
        >
          {moreText}
        </MoreButton>
      ) : to ? (
        <MoreLink to={to}>{moreText}</MoreLink>
      ) : (
        <span />
      )}
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

const MoreLink = styled(Link)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;

const MoreButton = styled.button`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
`;
