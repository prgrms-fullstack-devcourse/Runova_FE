import styled from '@emotion/native';
import {
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Card from '@/components/Card';
import useRouteStore from '@/store/route';

export default function RouteGrid() {
  const {
    activeTab,
    courses,
    loading,
    error,
    refreshing,
    handleRouteCardPress,
    handleLoadMore,
    handleRetry,
    handleRefresh,
  } = useRouteStore();
  const renderRouteCard = ({ item }: { item: any }) => (
    <Card
      imageSource={{ uri: item.imageUrl }}
      content={{ hasStar: item.bookmarked }}
      mode="only-image"
      onPress={() => handleRouteCardPress(item)}
    />
  );

  const handleEndReached = () => {
    handleLoadMore();
  };

  if (error && courses.length === 0) {
    return (
      <ErrorContainer>
        <ErrorText>{error}</ErrorText>
        <RetryButton onPress={handleRetry}>
          <RetryButtonText>다시 시도</RetryButtonText>
        </RetryButton>
      </ErrorContainer>
    );
  }

  if (courses.length === 0 && !loading && !error) {
    const getEmptyMessage = () => {
      switch (activeTab) {
        case 'created':
          return '아직 생성한 경로가 없습니다.';
        case 'completed':
          return '아직 완주한 경로가 없습니다.';
        case 'liked':
          return '아직 좋아요한 경로가 없습니다.';
        default:
          return '경로가 없습니다.';
      }
    };

    return (
      <EmptyContainer>
        <Text>{getEmptyMessage()}</Text>
      </EmptyContainer>
    );
  }

  return (
    <FlatList
      data={courses}
      renderItem={renderRouteCard}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#007AFF"
          colors={['#007AFF']}
        />
      }
      ListFooterComponent={() => (
        <>
          {loading && (
            <LoadingContainer>
              <ActivityIndicator size="large" color="#007AFF" />
            </LoadingContainer>
          )}
          {error && courses.length > 0 && (
            <ErrorMessage>
              <ErrorText>{error}</ErrorText>
              <RetryButton onPress={handleRetry}>
                <RetryButtonText>다시 시도</RetryButtonText>
              </RetryButton>
            </ErrorMessage>
          )}
        </>
      )}
    />
  );
}

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 32,
});

const LoadingContainer = styled.View({
  padding: 16,
  alignItems: 'center',
  gap: 16,
});

const ErrorContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 32,
});

const ErrorMessage = styled.View({
  padding: 16,
  alignItems: 'center',
});

const ErrorText = styled.Text({
  fontSize: 14,
  color: '#dc2626',
  textAlign: 'center',
  marginBottom: 12,
});

const RetryButton = styled(TouchableOpacity)({
  backgroundColor: '#007AFF',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 8,
});

const RetryButtonText = styled.Text({
  color: '#ffffff',
  fontSize: 14,
  fontWeight: '600',
});
