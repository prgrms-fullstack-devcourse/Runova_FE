import styled from '@emotion/styled';
import type { Category } from '@/types/community';

const Tabs = styled.div`
  display: flex;
  background: #fff;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 8px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.subtext};
  border-bottom: 2px solid
    ${({ active, theme }) => (active ? theme.colors.primary : 'transparent')};
  transition: color ${({ theme }) => theme.transition.fast};
`;

const items: { key: Category; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'free', label: '자유' },
  { key: 'auth', label: '인증' },
  { key: 'share', label: '공유' },
  { key: 'mate', label: '메이트' },
];

export default function CategoryTabs({
  value,
  onChange,
}: {
  value: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <Tabs>
      {items.map((i) => (
        <Tab
          key={i.key}
          active={i.key === value}
          onClick={() => onChange(i.key)}
        >
          {i.label}
        </Tab>
      ))}
    </Tabs>
  );
}
