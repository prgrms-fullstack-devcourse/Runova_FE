import styled from '@emotion/styled';
import type { Category } from '@/types/community';

type SelectableItem = {
  id: string;
  imageUrl: string;
  title: string;
  date: string;
};

export default function EditForm({
  category,
  title,
  content,
  items = [],
  selectedItemId,
  onSelectItem,
  onChange,
  onSubmit,
}: {
  category: Category;
  title: string;
  content: string;
  items?: SelectableItem[];
  selectedItemId?: string | null;
  onSelectItem?: (id: string) => void;
  onChange: (
    patch: Partial<{
      category: Category;
      title: string;
      content: string;
    }>,
  ) => void;
  onSubmit: () => void;
}) {
  const showPicker = category === 'share' || category === 'auth';

  return (
    <Body>
      <Field>
        <Label>카테고리</Label>
        <Select
          value={category}
          onChange={(e) => onChange({ category: e.target.value as Category })}
        >
          <option value="free">자유</option>
          <option value="auth">인증</option>
          <option value="share">공유</option>
          <option value="mate">메이트</option>
        </Select>
      </Field>

      {showPicker && (
        <Field>
          <Label>
            {category === 'auth' ? '인증샷 선택' : '공유할 항목 선택'}
          </Label>
          <Picker role="listbox" aria-label="선택 리스트">
            {items.length === 0 ? (
              <div>선택할 항목이 없습니다.</div>
            ) : (
              items.map((it) => {
                const active = selectedItemId === it.id;
                return (
                  <PickerItem
                    key={it.id}
                    role="option"
                    aria-selected={active}
                    $active={active}
                    onClick={() => onSelectItem?.(it.id)}
                  >
                    <Thumb>
                      <img src={it.imageUrl} alt={it.title} />
                    </Thumb>
                    <Meta>
                      <ItemTitle>{it.title}</ItemTitle>
                      <ItemDate>{it.date}</ItemDate>
                    </Meta>
                    {active && <i className="ri-check-line" aria-hidden />}
                  </PickerItem>
                );
              })
            )}
          </Picker>
        </Field>
      )}

      <Field>
        <Label>내용</Label>
        <Textarea
          value={content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="내용을 입력하세요"
        />
      </Field>

      <Submit onClick={onSubmit}>작성하기</Submit>
    </Body>
  );
}

const Body = styled.div`
  padding: 16px;
  display: grid;
  gap: 16px;
`;

const Field = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
`;

const Picker = styled.div`
  max-height: 240px; /* 스크롤 영역 높이 */
  overflow-y: auto; /* 세로 스크롤 */
  display: grid;
  gap: 8px;
  padding-right: 4px; /* 스크롤 여백 */
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surfaceAlt ?? theme.colors.surface};
  padding: 8px;
`;

const PickerItem = styled.button<{ $active?: boolean }>`
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 10px;
  align-items: center;
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.border : theme.colors.surface};
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;

  i {
    font-size: 18px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Thumb = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Meta = styled.div`
  display: grid;
  gap: 4px;
  text-align: left;
`;

const ItemTitle = styled.div`
  ${({ theme }) => theme.typography.body};
  color: ${({ theme }) => theme.colors.text};
`;

const ItemDate = styled.div`
  ${({ theme }) => theme.typography.small};
  color: ${({ theme }) => theme.colors.subtext};
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  resize: none;
  min-height: 180px;
`;

const Submit = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  font-weight: 700;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
