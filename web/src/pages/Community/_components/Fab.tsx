import styled from '@emotion/styled';

type FabProps = {
  icon?: React.ReactNode; // 아이콘 (RemixIcon className이나 svg)
  label?: string; // 선택: 텍스트
  onClick?: () => void;
};

export default function Fab({ icon, label, onClick }: FabProps) {
  return (
    <Button onClick={onClick}>
      {icon}
      {label && <span>{label}</span>}
    </Button>
  );
}

const Button = styled.button`
  position: fixed;
  right: 16px;
  bottom: 80px;
  z-index: ${({ theme }) => theme.zIndex.fab};
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  transition: background ${({ theme }) => theme.transition.normal};
  font-size: 24px;

  &:hover {
    background: ${({ theme }) =>
      theme.colors.primaryHover ?? theme.colors.primary};
  }

  span {
    display: none; /* 아이콘만 기본 보이게 */
  }
`;
