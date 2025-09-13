import styled from '@emotion/native';
import { FileText } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { ScrollView } from 'react-native';
import Header from '@/components/Header';
import TimeRangeSelector from './_components/TimeRangeSelector';
import StatsDisplay from './_components/StatsDisplay';
import RecordsList from './_components/RecordsList';
import { LoadingOverlay, ErrorOverlay } from '@/components/Overlay';
import {
  useRunningRecords,
  useRunningDashboard,
  getTimeRangeParams,
  getTimeRangeDisplayText,
} from '@/hooks/api/useRecordsApi';
import type { TimeRange } from '@/types/records.types';

export default function Records() {
  const [activeRange, setActiveRange] = useState<TimeRange>('month');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  const timeRangeParams = getTimeRangeParams(
    activeRange,
    selectedWeek,
    selectedMonth,
    selectedYear,
  );
  const displayText = getTimeRangeDisplayText(
    activeRange,
    selectedWeek,
    selectedMonth,
    selectedYear,
  );

  const {
    records,
    loading: recordsLoading,
    error: recordsError,
    hasMore,
    loadRecords,
    handleLoadMore,
    handleRefresh,
  } = useRunningRecords();

  const {
    dashboard,
    loading: dashboardLoading,
    error: dashboardError,
    loadDashboard,
  } = useRunningDashboard();

  // 초기 데이터 로드
  useEffect(() => {
    console.log('📊 [Records] useEffect 실행:', {
      activeRange,
      selectedWeek,
      selectedMonth,
      selectedYear,
      timeRangeParams,
    });
    loadDashboard(timeRangeParams);
    loadRecords(timeRangeParams, true);
  }, [activeRange, selectedWeek, selectedMonth, selectedYear]);

  // 기간 변경 시 데이터 새로고침
  const handleRangeChange = useCallback((range: TimeRange) => {
    setActiveRange(range);
    setShowDropdown(false);
  }, []);

  const handleDropdownPress = useCallback(() => {
    setShowDropdown(!showDropdown);
  }, [showDropdown]);

  const handleRecordPress = useCallback((record: any) => {
    // TODO: 기록 상세 페이지로 이동
    console.log('Record pressed:', record);
  }, []);

  const handleDetailSelection = useCallback(
    (value: number) => {
      switch (activeRange) {
        case 'week':
          setSelectedWeek(value);
          break;
        case 'month':
          setSelectedMonth(value);
          break;
        case 'year':
          setSelectedYear(value);
          break;
      }
      setShowDropdown(false);
    },
    [activeRange],
  );

  const isLoading = recordsLoading || dashboardLoading;
  const hasError = recordsError || dashboardError;

  // 초기 로딩 상태 (데이터가 없고 로딩 중일 때만)
  const isInitialLoading = isLoading && !dashboard && records.length === 0;

  // 새로고침 상태 (데이터가 있을 때만)
  const isRefreshing = isLoading && (dashboard || records.length > 0);

  return (
    <Screen>
      <Header title="기록" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <TimeRangeSelector
          activeRange={activeRange}
          onRangeChange={handleRangeChange}
          displayText={displayText}
          onDropdownPress={handleDropdownPress}
          showDropdown={showDropdown}
          onDetailSelection={handleDetailSelection}
          selectedWeek={selectedWeek}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />

        {dashboard && <StatsDisplay dashboard={dashboard} />}

        <RecordsList
          records={records}
          loading={!!isRefreshing}
          error={recordsError}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onRefresh={handleRefresh}
          onRecordPress={handleRecordPress}
        />
      </ScrollView>

      {isInitialLoading && <LoadingOverlay message="데이터를 불러오는 중..." />}
      {hasError && (
        <ErrorOverlay
          message={hasError}
          onRetry={() => {
            loadDashboard(timeRangeParams);
            loadRecords(timeRangeParams, true);
          }}
        />
      )}
    </Screen>
  );
}

const Screen = styled.View({
  flex: 1,
  backgroundColor: '#ffffff',
});
