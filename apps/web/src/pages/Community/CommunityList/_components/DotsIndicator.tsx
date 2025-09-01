import styled from '@emotion/styled';

type DotsIndicatorProps = {
  count: number;
  activeIndex: number;
  onDotClick?: (i: number) => void;
};

export default function DotsIndicator({
  count,
  activeIndex,
  onDotClick,
}: DotsIndicatorProps) {
  return (
    <DotsWrap>
      {Array.from({ length: count }).map((_, i) => (
        <Dot
          key={i}
          aria-current={i === activeIndex}
          onClick={() => onDotClick?.(i)}
        />
      ))}
    </DotsWrap>
  );
}

const DotsWrap = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  padding: 8px 0 0;
`;

const Dot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  border: none;
  padding: 0;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.subtext};

  &[aria-current='true'] {
    background: ${({ theme }) => theme.colors.primary};
  }
`;
