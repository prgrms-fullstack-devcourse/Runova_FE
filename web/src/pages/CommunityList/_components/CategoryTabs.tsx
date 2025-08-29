import styled from '@emotion/styled';
import type { Category } from '../../../types/community';

export default function CategoryTabs({
  value,
  onChange,
}: {
  value: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <Tabs
      style={{
        position: 'fixed',
        top: 48,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 390,
      }}
    >
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

const Tabs = styled.div`
  display: flex;
  background: #fff;
  border-bottom: 1px solid #eee;
`;
const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  color: ${({ active, theme }) => (active ? theme.colors.primary : '#6b7280')};
  border-bottom: 2px solid
    ${({ active, theme }) => (active ? theme.colors.primary : 'transparent')};
  background: transparent;
`;

const items: { key: Category; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'free', label: '자유' },
  { key: 'auth', label: '인증' },
  { key: 'share', label: '공유' },
  { key: 'mate', label: '메이트' },
];
