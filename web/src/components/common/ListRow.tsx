import styled from '@emotion/styled';
import BaseCard from './BaseCard';

export default function ListRow({
  thumbnail,
  title,
  meta,
  sub,
  onClick,
  rightIconClass = 'ri-arrow-right-s-line',
}: Props) {
  return (
    <Row onClick={onClick}>
      {thumbnail && (
        <Thumb>
          <img src={thumbnail} alt="" />
        </Thumb>
      )}
      <div style={{ flex: 1 }}>
        <Title>{title}</Title>
        {meta && <Line>{meta}</Line>}
        {sub && <Small>{sub}</Small>}
      </div>
      <RightIcon className={rightIconClass} />
    </Row>
  );
}

const Row = styled(BaseCard)`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const Thumb = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  background: #e5e7eb;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }
`;

const Title = styled.h4`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Line = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const Small = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const RightIcon = styled.i`
  color: #9ca3af;
`;

type Props = {
  thumbnail?: string;
  title: string;
  meta?: string;
  sub?: string;
  onClick?: () => void;
  rightIconClass?: string;
};
