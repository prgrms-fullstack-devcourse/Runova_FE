import styled from '@emotion/native';
import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import type { TimeRange } from '@/types/records.types';
import { theme } from '@/styles/theme';

interface TimeRangeSelectorProps {
  activeRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  displayText: string;
  onDropdownPress: () => void;
  showDropdown: boolean;
  onDetailSelection: (value: number) => void;
  selectedWeek: number;
  selectedMonth: number;
  selectedYear: number;
}

const timeRangeTabs: { id: TimeRange; title: string }[] = [
  { id: 'week', title: '주' },
  { id: 'month', title: '월' },
  { id: 'year', title: '년' },
  { id: 'all', title: '전체' },
];

export default function TimeRangeSelector({
  activeRange,
  onRangeChange,
  displayText,
  onDropdownPress,
  showDropdown,
  onDetailSelection,
  selectedWeek,
  selectedMonth,
  selectedYear,
}: TimeRangeSelectorProps) {
  return (
    <Container>
      <TabContainer>
        {timeRangeTabs.map((tab) => (
          <TabButton
            key={tab.id}
            isActive={activeRange === tab.id}
            onPress={() => onRangeChange(tab.id)}
          >
            <TabText isActive={activeRange === tab.id}>{tab.title}</TabText>
          </TabButton>
        ))}
      </TabContainer>

      <PeriodContainer onPress={onDropdownPress}>
        <PeriodText>{displayText}</PeriodText>
        <ChevronDown
          size={16}
          color="#666666"
          style={{ transform: [{ rotate: showDropdown ? '180deg' : '0deg' }] }}
        />
      </PeriodContainer>

      {showDropdown && (
        <DropdownContainer>
          {activeRange === 'week' && (
            <>
              {Array.from({ length: 4 }, (_, i) => i + 1).map((week) => (
                <DropdownItem
                  key={week}
                  onPress={() => onDetailSelection(week)}
                >
                  <DropdownText isActive={selectedWeek === week}>
                    {week}째 주
                  </DropdownText>
                </DropdownItem>
              ))}
            </>
          )}
          {activeRange === 'month' && (
            <>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <DropdownItem
                  key={month}
                  onPress={() => onDetailSelection(month)}
                >
                  <DropdownText isActive={selectedMonth === month}>
                    {month}월
                  </DropdownText>
                </DropdownItem>
              ))}
            </>
          )}
          {activeRange === 'year' && (
            <>
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - 2 + i,
              ).map((year) => (
                <DropdownItem
                  key={year}
                  onPress={() => onDetailSelection(year)}
                >
                  <DropdownText isActive={selectedYear === year}>
                    {year}년
                  </DropdownText>
                </DropdownItem>
              ))}
            </>
          )}
          {activeRange === 'all' && (
            <DropdownItem onPress={() => onRangeChange('all')}>
              <DropdownText isActive={true}>전체</DropdownText>
            </DropdownItem>
          )}
        </DropdownContainer>
      )}
    </Container>
  );
}

const Container = styled.View({
  position: 'relative',
  paddingHorizontal: 16,
  paddingVertical: 12,
});

const TabContainer = styled.View({
  flexDirection: 'row',
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: '#e5e7eb',
  borderRadius: 8,
  padding: 4,
  marginBottom: 12,
});

const TabButton = styled.TouchableOpacity<{
  isActive: boolean;
}>(({ isActive }) => ({
  flex: 1,
  alignItems: 'center',
  paddingVertical: 8,
  borderRadius: 6,
  backgroundColor: isActive ? `${theme.colors.gray[900]}` : 'transparent',
}));

const TabText = styled.Text<{
  isActive: boolean;
}>(({ isActive }) => ({
  fontSize: 14,
  fontWeight: isActive ? '600' : '400',
  color: isActive ? '#ffffff' : '#666666',
}));

const PeriodContainer = styled.TouchableOpacity({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 8,
});

const PeriodText = styled.Text({
  fontSize: 16,
  fontWeight: '500',
  color: '#2d2d2d',
});

const DropdownContainer = styled.View({
  position: 'absolute',
  top: '100%',
  left: 16,
  right: 16,
  backgroundColor: '#ffffff',
  borderRadius: 8,
  marginTop: 8,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 10,
  zIndex: 1000,
});

const DropdownItem = styled.TouchableOpacity({
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
});

const DropdownText = styled.Text<{
  isActive: boolean;
}>(({ isActive }) => ({
  fontSize: 14,
  fontWeight: isActive ? '600' : '400',
  color: isActive ? '#2d2d2d' : '#666666',
}));
