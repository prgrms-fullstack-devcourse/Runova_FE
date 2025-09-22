import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import styled from '@emotion/native';

import { SizeControlProps } from '@/types/photoDecoration.types';

export default function SizeControlButtons({
  value,
  onValueChange,
  minimumValue = 0.5,
  maximumValue = 2,
  step = 0.1,
}: SizeControlProps) {
  const handleDecrease = () => {
    const newValue = Math.max(minimumValue, value - step);
    onValueChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(maximumValue, value + step);
    onValueChange(newValue);
  };

  return (
    <SizeButtonContainer>
      <SizeButton onPress={handleDecrease} disabled={value <= minimumValue}>
        <SizeButtonText>-</SizeButtonText>
      </SizeButton>
      <SizeValue>{Math.round(value * 100)}%</SizeValue>
      <SizeButton onPress={handleIncrease} disabled={value >= maximumValue}>
        <SizeButtonText>+</SizeButtonText>
      </SizeButton>
    </SizeButtonContainer>
  );
}

const SizeButtonContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
});

const SizeButton = styled.TouchableOpacity<{ disabled?: boolean }>(
  ({ disabled }) => ({
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: disabled ? '#e0e0e0' : '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
  }),
);

const SizeButtonText = styled.Text({
  fontSize: 18,
  color: '#ffffff',
  fontWeight: 'bold',
});

const SizeValue = styled.Text({
  fontSize: 14,
  color: '#666666',
  fontWeight: '500',
  minWidth: 40,
  textAlign: 'center',
});
