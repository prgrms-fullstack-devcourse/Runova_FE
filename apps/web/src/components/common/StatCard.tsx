import styled from '@emotion/styled';
import BaseCard from './BaseCard';

type Props = {
  iconClass: string;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
};

export default function StatCard({
  iconClass,
  iconBg,
  iconColor,
  value,
  label,
}: Props) {
  return (
    <Wrap>
      <Icon bg={iconBg}>
        <i className={iconClass} style={{ color: iconColor }} />
      </Icon>
      <Val>{value}</Val>
      <Label>{label}</Label>
    </Wrap>
  );
}

const Wrap = styled(BaseCard)`
  min-width: 120px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
`;

const Icon = styled.div<{ bg: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  background: ${({ bg }) => bg};
`;

const Val = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Label = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtext};
`;
