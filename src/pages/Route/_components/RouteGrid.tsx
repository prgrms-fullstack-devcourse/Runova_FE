import styled from '@emotion/native';
import {
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  RefreshControl,
  View,
} from 'react-native';
import { useCallback } from 'react';
import { Play } from 'lucide-react-native';
import Card from '@/components/Card';
import useRouteStore from '@/store/route';
import {
  useRouteData,
  useBookmarkedCourses,
  useCompletedCourses,
} from '@/hooks/api/useRouteApi';
import {
  BookmarkedCourseItem,
  CompletedCourseItem,
  CourseSearchItem,
} from '@/types/courses.types';

interface RouteGridProps {
  onRouteCardPress: (courseId: number) => void;
  onStartRun: (courseId: number) => void;
}

export default function RouteGrid({
  onRouteCardPress,
  onStartRun,
}: RouteGridProps) {
  const {
    activeTab,
    courses,
    bookmarkedCourses,
    completedCourses,
    loading,
    error,
    refreshing,
  } = useRouteStore();

  const { handleLoadMore, handleRetry, handleRefresh } = useRouteData();
  const {
    handleLoadMore: handleBookmarkedLoadMore,
    handleRetry: handleBookmarkedRetry,
    handleRefresh: handleBookmarkedRefresh,
  } = useBookmarkedCourses();
  const {
    handleLoadMore: handleCompletedLoadMore,
    handleRetry: handleCompletedRetry,
    handleRefresh: handleCompletedRefresh,
  } = useCompletedCourses();

  const getCurrentData = () => {
    switch (activeTab) {
      case 'created':
        return courses;
      case 'liked':
        return bookmarkedCourses;
      case 'completed':
        return completedCourses;
      default:
        return courses;
    }
  };

  const getCurrentHandlers = () => {
    switch (activeTab) {
      case 'created':
        return { handleLoadMore, handleRetry, handleRefresh };
      case 'liked':
        return {
          handleLoadMore: handleBookmarkedLoadMore,
          handleRetry: handleBookmarkedRetry,
          handleRefresh: handleBookmarkedRefresh,
        };
      case 'completed':
        return {
          handleLoadMore: handleCompletedLoadMore,
          handleRetry: handleCompletedRetry,
          handleRefresh: handleCompletedRefresh,
        };
      default:
        return { handleLoadMore, handleRetry, handleRefresh };
    }
  };

  const renderRouteCard = useCallback(
    ({
      item,
    }: {
      item: CourseSearchItem | BookmarkedCourseItem | CompletedCourseItem;
    }) => {
      if (activeTab === 'completed') {
        const completedItem = item as CompletedCourseItem;
        return (
          <CardContainer>
            <Card
              imageSource={{ uri: completedItem.imageUrl }}
              content={{
                title: completedItem.title,
                subtitle: `${Math.round((completedItem.distance / 1000) * 10) / 10}km`,
                hasStar: completedItem.bookmarked,
              }}
              mode="only-image"
              onPress={() => onRouteCardPress(completedItem.id)}
            />
            <RunButton onPress={() => onStartRun(completedItem.id)}>
              <PlayIcon size={16} color="#ffffff" />
              <RunButtonText>러닝 시작</RunButtonText>
            </RunButton>
          </CardContainer>
        );
      } else if (activeTab === 'liked') {
        const bookmarkedItem = item as BookmarkedCourseItem;
        return (
          <CardContainer>
            <Card
              imageSource={{ uri: bookmarkedItem.imageUrl }}
              content={{ hasStar: bookmarkedItem.bookmarked }}
              mode="only-image"
              onPress={() => onRouteCardPress(bookmarkedItem.id)}
            />
            <RunButton onPress={() => onStartRun(bookmarkedItem.id)}>
              <PlayIcon size={16} color="#ffffff" />
              <RunButtonText>러닝 시작</RunButtonText>
            </RunButton>
          </CardContainer>
        );
      } else {
        const courseItem = item as CourseSearchItem;
        return (
          <CardContainer>
            <Card
              imageSource={{ uri: courseItem.imageUrl }}
              content={{ hasStar: courseItem.bookmarked }}
              mode="only-image"
              onPress={() => onRouteCardPress(courseItem.id)}
            />
            <RunButton onPress={() => onStartRun(courseItem.id)}>
              <PlayIcon size={16} color="#ffffff" />
              <RunButtonText>러닝 시작</RunButtonText>
            </RunButton>
          </CardContainer>
        );
      }
    },
    [activeTab, onRouteCardPress, onStartRun],
  );

  const currentData = getCurrentData();
  const currentHandlers = getCurrentHandlers();

  const handleEndReached = useCallback(() => {
    currentHandlers.handleLoadMore();
  }, [currentHandlers]);

  const keyExtractor = useCallback(
    (item: CourseSearchItem | BookmarkedCourseItem | CompletedCourseItem) =>
      `${activeTab}-${item.id}`,
    [activeTab],
  );

  if (error && currentData.length === 0) {
    return (
      <ErrorContainer>
        <ErrorText>{error}</ErrorText>
        <RetryButton onPress={currentHandlers.handleRetry}>
          <RetryButtonText>다시 시도</RetryButtonText>
        </RetryButton>
      </ErrorContainer>
    );
  }

  if (currentData.length === 0 && !loading && !error) {
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
      data={currentData}
      renderItem={renderRouteCard}
      keyExtractor={keyExtractor}
      numColumns={2}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 32,
      }}
      columnWrapperStyle={{
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 16,
      }}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={currentHandlers.handleRefresh}
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
          {error && currentData.length > 0 && (
            <ErrorMessage>
              <ErrorText>{error}</ErrorText>
              <RetryButton onPress={currentHandlers.handleRetry}>
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

const CardContainer = styled.View({
  flex: 1,
  marginBottom: 16,
});

const RunButton = styled.TouchableOpacity({
  backgroundColor: '#ff6b35',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  marginTop: 8,
});

const PlayIcon = styled(Play)({
  // styled component for Play icon
});

const RunButtonText = styled.Text({
  color: '#ffffff',
  fontSize: 12,
  fontWeight: '600',
});
