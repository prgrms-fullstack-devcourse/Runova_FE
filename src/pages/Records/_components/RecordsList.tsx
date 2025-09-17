import styled from '@emotion/native';
import {
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useCallback } from 'react';
import type { RunningRecord } from '@/types/records.types';

interface RecordsListProps {
  records: RunningRecord[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onRecordPress?: (record: RunningRecord) => void;
}

export default function RecordsList({
  records,
  loading,
  error,
  hasMore,
  onLoadMore,
  onRefresh,
  onRecordPress,
}: RecordsListProps) {
  const renderRecord = useCallback(
    ({ item }: { item: RunningRecord }) => (
      <RecordItem onPress={() => onRecordPress?.(item)}>
        <RecordImage source={{ uri: item.artUrl || item.imageUrl }} />
      </RecordItem>
    ),
    [onRecordPress],
  );

  const keyExtractor = useCallback(
    (item: RunningRecord, index: number) => `${item.id}-${index}`,
    [],
  );

  const handleEndReached = useCallback(() => {
    console.log('📊 [RecordsList] handleEndReached 호출:', {
      hasMore,
      loading,
    });
    if (hasMore && !loading) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  const renderFooter = useCallback(() => {
    if (!loading || records.length === 0) return null;

    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#2d2d2d" />
      </LoadingContainer>
    );
  }, [loading, records.length]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;

    return (
      <EmptyContainer>
        <EmptyText>런닝 기록이 없습니다</EmptyText>
        <EmptySubText>첫 번째 런닝을 시작해보세요!</EmptySubText>
      </EmptyContainer>
    );
  }, [loading]);

  return (
    <Container>
      <SectionTitle>런닝 기록</SectionTitle>
      <FlatList
        data={records}
        renderItem={renderRecord}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexGrow: 1,
        }}
        ItemSeparatorComponent={() => <Separator />}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor="#2d2d2d"
            colors={['#2d2d2d']}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </Container>
  );
}

const Container = styled.View({
  marginTop: 20,
});

const SectionTitle = styled.Text({
  fontSize: 18,
  fontWeight: '600',
  color: '#2d2d2d',
  paddingHorizontal: 16,
  marginBottom: 12,
});

const RecordItem = styled(TouchableOpacity)({
  width: 360, // 120 * 3 = 360
  height: 360, // 120 * 3 = 360
  borderRadius: 12,
  overflow: 'hidden',
  marginBottom: 120,
});

const RecordImage = styled.Image({
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
});

const Separator = styled.View({
  width: 12,
});

const LoadingContainer = styled.View({
  padding: 20,
  alignItems: 'center',
});

const EmptyContainer = styled.View({
  padding: 40,
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 200,
});

const EmptyText = styled.Text({
  fontSize: 16,
  fontWeight: '500',
  color: '#666666',
  marginBottom: 8,
});

const EmptySubText = styled.Text({
  fontSize: 14,
  color: '#999999',
});
