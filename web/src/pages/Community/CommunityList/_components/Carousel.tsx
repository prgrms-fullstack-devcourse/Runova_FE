import { useRef, useState } from 'react';
import styled from '@emotion/styled';

type CarouselProps = {
  children: React.ReactNode[];
  index: number;
  onChange: (next: number) => void;
  height?: string;
};

export default function Carousel({
  children,
  index,
  onChange,
  height,
}: CarouselProps) {
  const slideCount = children.length;
  const containerRef = useRef<HTMLDivElement>(null);

  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragDeltaX, setDragDeltaX] = useState(0);

  const clamp = (v: number) => Math.max(0, Math.min(slideCount - 1, v));

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragStartX(e.clientX);
    setDragDeltaX(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX == null) return;
    setDragDeltaX(e.clientX - dragStartX);
  };

  const handlePointerUp = () => {
    if (dragStartX == null) return;
    const width = containerRef.current?.clientWidth ?? 1;
    const threshold = width * 0.15;
    let next = index;

    if (dragDeltaX <= -threshold) next = clamp(index + 1);
    if (dragDeltaX >= threshold) next = clamp(index - 1);

    onChange(next);
    setDragStartX(null);
    setDragDeltaX(0);
  };

  const translatePct =
    -(index * 100) +
    (dragStartX != null
      ? (dragDeltaX / (containerRef.current?.clientWidth ?? 1)) * 100
      : 0);

  return (
    <Viewport
      ref={containerRef}
      style={height ? { height } : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <Track style={{ transform: `translateX(${translatePct}%)` }}>
        {children.map((child, i) => (
          <Slide key={i}>{child}</Slide>
        ))}
      </Track>
    </Viewport>
  );
}

const Viewport = styled.div`
  width: 100%;
  overflow: hidden;
  touch-action: pan-y;
  position: relative;
`;

const Track = styled.div`
  display: flex;
  width: 100%;
  transition: transform 220ms ease;
  will-change: transform;
`;

const Slide = styled.div`
  flex: 0 0 100%;
  min-width: 100%;
`;
