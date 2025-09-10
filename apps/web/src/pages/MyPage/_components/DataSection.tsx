import styled from '@emotion/styled';
import Section from '@/components/common/Section';
import SectionHeader from '@/components/common/SectionHeader';
import { ReactNode } from 'react';

type DataSectionProps<T> = {
  title: string;
  to?: string;
  loading?: boolean;
  error?: string | null;
  items: T[];
  emptyText: string;
  renderItem: (item: T, index: number) => ReactNode;
};

export default function DataSection<T>({
  title,
  to,
  loading = false,
  error,
  items,
  emptyText,
  renderItem,
}: DataSectionProps<T>) {
  return (
    <Section>
      <SectionHeader title={title} to={to} />

      {loading && <Hint>불러오는 중…</Hint>}
      {error && <ErrorText>{error}</ErrorText>}

      <ImageArea>
        {items.length === 0 && !loading ? (
          <Empty>{emptyText}</Empty>
        ) : (
          items.map((item, i) => renderItem(item, i))
        )}
      </ImageArea>
    </Section>
  );
}

const Hint = styled.div`
  ${({ theme }) => theme.typography.small};
  color: ${({ theme }) => theme.colors.subtext};
  padding: 6px 0 0 0;
`;
const ErrorText = styled.div`
  ${({ theme }) => theme.typography.small};
  color: ${({ theme }) => theme.colors.danger};
  padding: 6px 0 0 0;
`;
const Empty = styled.div`
  ${({ theme }) => theme.typography.small};
  color: ${({ theme }) => theme.colors.subtext};
  padding: 6px 0;
`;
const ImageArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
