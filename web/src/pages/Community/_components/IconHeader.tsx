import styled from '@emotion/styled';

type IconHeaderProps = {
  icon: React.ReactNode;
  title: string;
  onMoreClick?: () => void;
};

export default function IconHeader({
  icon,
  title,
  onMoreClick,
}: IconHeaderProps) {
  return (
    <Container>
      <IconAndTitle>
        {icon}
        <span>{title}</span>
      </IconAndTitle>
      {onMoreClick && <MoreLink onClick={onMoreClick}>더 보기</MoreLink>}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 12px;
`;

const IconAndTitle = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  ${({ theme }) => theme.typography.heading};
  align-items: center;
`;

const MoreLink = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.subtext};
  font-weight: 600;
  cursor: pointer;
`;
