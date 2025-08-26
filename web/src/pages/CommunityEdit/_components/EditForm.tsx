import styled from '@emotion/styled';
import type { Category } from '@/types/community';

export default function EditForm({
  category,
  title,
  content,
  onChange,
  onSubmit,
}: {
  category: Category;
  title: string;
  content: string;
  onChange: (
    patch: Partial<{
      category: Category;
      title: string;
      content: string;
    }>,
  ) => void;
  onSubmit: () => void;
}) {
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

      <Field>
        <Label>제목</Label>
        <Input
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="제목을 입력하세요"
        />
      </Field>

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
const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
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
