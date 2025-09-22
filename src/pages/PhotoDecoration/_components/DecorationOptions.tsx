import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import styled from '@emotion/native';

import {
  PhotoDecorationState,
  ColorOption,
} from '@/types/photoDecoration.types';
import {
  getBackgroundColorOptions,
  getRouteColorOptions,
} from '@/utils/photoDecorationUtils';
import SizeControlButtons from './SizeControlButtons';

export interface DecorationOptionsProps {
  state: PhotoDecorationState;
  updateState: (updates: Partial<PhotoDecorationState>) => void;
  updateColors: (colorUpdates: Partial<PhotoDecorationState['colors']>) => void;
  updateVisibility: (
    visibilityUpdates: Partial<PhotoDecorationState['visibility']>,
  ) => void;
  updateScales: (scaleUpdates: Partial<PhotoDecorationState['scales']>) => void;
}

export default function DecorationOptions({
  state,
  updateState,
  updateColors,
  updateVisibility,
  updateScales,
}: DecorationOptionsProps) {
  const backgroundColors = getBackgroundColorOptions();
  const routeColors = getRouteColorOptions();

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 200 }}
      showsVerticalScrollIndicator={true}
    >
      <OptionsContainer>
        <OptionsTitle>편집 옵션</OptionsTitle>

        <OptionSection>
          <OptionLabel>배경</OptionLabel>
          <ToggleContainer>
            <ToggleButton
              active={state.backgroundType === 'photo'}
              onPress={() => updateState({ backgroundType: 'photo' })}
            >
              <ToggleText active={state.backgroundType === 'photo'}>
                사진
              </ToggleText>
            </ToggleButton>
            <ToggleButton
              active={state.backgroundType === 'solid'}
              onPress={() => updateState({ backgroundType: 'solid' })}
            >
              <ToggleText active={state.backgroundType === 'solid'}>
                단색
              </ToggleText>
            </ToggleButton>
          </ToggleContainer>
        </OptionSection>

        {state.backgroundType === 'solid' && (
          <OptionSection>
            <OptionLabel>배경색</OptionLabel>
            <ColorContainer>
              {backgroundColors.map((color) => (
                <ColorButton
                  key={color.id}
                  selected={state.backgroundColor === color.color}
                  onPress={() => updateState({ backgroundColor: color.color })}
                >
                  <ColorCircle color={color.color} />
                </ColorButton>
              ))}
            </ColorContainer>
          </OptionSection>
        )}

        <OptionSection>
          <OptionLabel>경로 색상</OptionLabel>
          <ColorContainer>
            {routeColors.map((color) => (
              <ColorButton
                key={color.id}
                selected={state.colors.route === color.color}
                onPress={() => updateColors({ route: color.color })}
              >
                <ColorCircle color={color.color} />
              </ColorButton>
            ))}
          </ColorContainer>
        </OptionSection>

        <OptionSection>
          <OptionLabel>통계 색상</OptionLabel>
          <ColorContainer>
            {routeColors.map((color) => (
              <ColorButton
                key={color.id}
                selected={state.colors.stats === color.color}
                onPress={() => updateColors({ stats: color.color })}
              >
                <ColorCircle color={color.color} />
              </ColorButton>
            ))}
          </ColorContainer>
        </OptionSection>

        <OptionSection>
          <OptionLabel>타임스탬프 색상</OptionLabel>
          <ColorContainer>
            {routeColors.map((color) => (
              <ColorButton
                key={color.id}
                selected={state.colors.timestamp === color.color}
                onPress={() => updateColors({ timestamp: color.color })}
              >
                <ColorCircle color={color.color} />
              </ColorButton>
            ))}
          </ColorContainer>
        </OptionSection>

        <OptionSection>
          <OptionLabel>런닝 통계</OptionLabel>
          <ToggleContainer>
            <ToggleButton
              active={state.visibility.time}
              onPress={() => updateVisibility({ time: !state.visibility.time })}
            >
              <ToggleText active={state.visibility.time}>시간</ToggleText>
            </ToggleButton>
            <ToggleButton
              active={state.visibility.distance}
              onPress={() =>
                updateVisibility({ distance: !state.visibility.distance })
              }
            >
              <ToggleText active={state.visibility.distance}>거리</ToggleText>
            </ToggleButton>
            <ToggleButton
              active={state.visibility.pace}
              onPress={() => updateVisibility({ pace: !state.visibility.pace })}
            >
              <ToggleText active={state.visibility.pace}>페이스</ToggleText>
            </ToggleButton>
            <ToggleButton
              active={state.visibility.calories}
              onPress={() =>
                updateVisibility({ calories: !state.visibility.calories })
              }
            >
              <ToggleText active={state.visibility.calories}>칼로리</ToggleText>
            </ToggleButton>
          </ToggleContainer>
        </OptionSection>

        <OptionSection>
          <OptionLabel>기타 요소</OptionLabel>
          <ToggleContainer>
            <ToggleButton
              active={state.visibility.route}
              onPress={() =>
                updateVisibility({ route: !state.visibility.route })
              }
            >
              <ToggleText active={state.visibility.route}>
                경로 이미지
              </ToggleText>
            </ToggleButton>
            <ToggleButton
              active={state.visibility.timestamp}
              onPress={() =>
                updateVisibility({ timestamp: !state.visibility.timestamp })
              }
            >
              <ToggleText active={state.visibility.timestamp}>
                타임스탬프
              </ToggleText>
            </ToggleButton>
          </ToggleContainer>
        </OptionSection>

        <OptionSection>
          <OptionLabel>크기 조절</OptionLabel>

          {state.visibility.route && (
            <SizeControlContainer>
              <SizeLabel>경로 이미지 크기</SizeLabel>
              <SizeSliderContainer>
                <SizeControlButtons
                  minimumValue={0.5}
                  maximumValue={2}
                  value={state.scales.route}
                  onValueChange={(value) => updateScales({ route: value })}
                />
              </SizeSliderContainer>
            </SizeControlContainer>
          )}

          <SizeControlContainer>
            <SizeLabel>통계 크기</SizeLabel>
            <SizeSliderContainer>
              <SizeControlButtons
                minimumValue={0.5}
                maximumValue={2}
                value={state.scales.stats}
                onValueChange={(value) => updateScales({ stats: value })}
              />
            </SizeSliderContainer>
          </SizeControlContainer>

          {state.visibility.timestamp && (
            <SizeControlContainer>
              <SizeLabel>타임스탬프 크기</SizeLabel>
              <SizeSliderContainer>
                <SizeControlButtons
                  minimumValue={0.5}
                  maximumValue={2}
                  value={state.scales.timestamp}
                  onValueChange={(value) => updateScales({ timestamp: value })}
                />
              </SizeSliderContainer>
            </SizeControlContainer>
          )}
        </OptionSection>
      </OptionsContainer>
    </ScrollView>
  );
}

const OptionsContainer = styled.View({
  paddingHorizontal: 20,
  paddingTop: 20,
});

const OptionsTitle = styled.Text({
  fontSize: 18,
  fontWeight: 'bold',
  color: '#000000',
  marginBottom: 20,
});

const OptionSection = styled.View({
  marginBottom: 24,
});

const OptionLabel = styled.Text({
  fontSize: 16,
  fontWeight: '600',
  color: '#333333',
  marginBottom: 12,
});

const ToggleContainer = styled.View({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
});

const ToggleButton = styled.TouchableOpacity<{ active: boolean }>(
  ({ active }) => ({
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: active ? '#2d2d2d' : '#f0f0f0',
    borderWidth: 1,
    borderColor: active ? '#2d2d2d' : '#e0e0e0',
  }),
);

const ToggleText = styled.Text<{ active?: boolean }>(({ active }) => ({
  fontSize: 14,
  color: active ? '#FFFFFF' : '#333333',
  fontWeight: '500',
}));

const ColorContainer = styled.View({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
});

const ColorButton = styled.TouchableOpacity<{ selected: boolean }>(
  ({ selected }) => ({
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: selected ? 3 : 1,
    borderColor: selected ? '#2d2d2d' : '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  }),
);

const ColorCircle = styled.View<{ color: string }>(({ color }) => ({
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: color,
  borderWidth: 1,
  borderColor: color === '#FFFFFF' ? '#e0e0e0' : 'transparent',
}));

const SizeControlContainer = styled.View({
  marginBottom: 16,
});

const SizeLabel = styled.Text({
  fontSize: 14,
  color: '#333333',
  marginBottom: 8,
  fontWeight: '500',
});

const SizeSliderContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
});
