import { useState } from 'react';
import styled from '@emotion/styled';
import IconHeader from '../../_components/IconHeader';
import Carousel from './Carousel';
import DotsIndicator from './DotsIndicator';

type SectionCarouselProps = {
  icon: React.ReactNode;
  title: string;
  items: React.ReactNode[];
  onMoreClick?: () => void;
};

export default function SectionCarousel({
  icon,
  title,
  items,
  onMoreClick,
}: SectionCarouselProps) {
  const [index, setIndex] = useState(0);

  return (
    <Section>
      <IconHeader icon={icon} title={title} onMoreClick={onMoreClick} />
      <Carousel index={index} onChange={setIndex}>
        {items}
      </Carousel>
      <DotsIndicator
        count={items.length}
        activeIndex={index}
        onDotClick={setIndex}
      />
    </Section>
  );
}

const Section = styled.section`
  width: 100%;
`;
