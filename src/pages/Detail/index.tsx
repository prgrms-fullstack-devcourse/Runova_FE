import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Share, ArrowLeft, Edit3 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from '@emotion/native';

import Header from '@/components/Header';
import useAuthStore from '@/store/auth';
import useRunStore from '@/store/run';
import { useImageLoading } from '@/hooks/useImageLoading';
import { useLongPress } from '@/hooks/useLongPress';
import { useCourseData } from '@/hooks/useCourseData';
import { useShare } from '@/hooks/useShare';
import { formatDate, formatDistance, formatTime } from '@/utils/formatters';
import type { RouteStackParamList } from '@/navigation/RouteStackNavigator';
import type { TabParamList } from '@/types/navigation.types';
import type {
  BookmarkedCourseItem,
  CourseSearchItem,
  CompletedCourseItem,
} from '@/types/courses.types';

type Props = {
  route: any;
  navigation: any;
};

export default function Detail({ route, navigation }: Props) {
  const { courseId } = route.params;
  const { accessToken } = useAuthStore();
  const insets = useSafeAreaInsets();

  const { courseData, address, loading, error, loadCourseData } = useCourseData(
    {
      courseId,
      courseData: route.params?.courseData || undefined,
      accessToken,
    },
  );
  const {
    imageError,
    imageLoading,
    handleImageError,
    handleImageLoad,
    resetImageState,
  } = useImageLoading();

  const handleDrawPress = () => {
    if (courseData) {
      useRunStore.getState().setCurrentCourse(courseId, courseData);
    }

    // RunTabNavigator 내부의 Run 스크린으로 이동
    navigation.navigate('Run', { courseId });
  };

  const { isPressing, pressProgress, animatedValue, startPress, stopPress } =
    useLongPress({
      onComplete: handleDrawPress,
    });
  const { shareCourse } = useShare({ courseId, courseData });

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleEditPress = () => {
    // TODO: 편집 기능 구현
  };

  if (loading) {
    return (
      <Container>
        <Header
          leftIcon={ArrowLeft}
          rightIcon={Edit3}
          onLeftPress={handleBackPress}
          onRightPress={handleEditPress}
          title="경로 상세"
        />
        <LoadingContainer>
          <ActivityIndicator size="large" color="#007AFF" />
          <LoadingText>경로 정보를 불러오는 중...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (error || !courseData) {
    return (
      <Container>
        <Header
          leftIcon={ArrowLeft}
          rightIcon={Edit3}
          onLeftPress={handleBackPress}
          onRightPress={handleEditPress}
          title="경로 상세"
        />
        <ErrorContainer>
          <ErrorText>{error || '경로를 찾을 수 없습니다.'}</ErrorText>
          <RetryButton onPress={loadCourseData}>
            <RetryButtonText>다시 시도</RetryButtonText>
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  const imageUrl = (() => {
    if (courseData && 'imageUrl' in courseData && courseData.imageUrl) {
      return courseData.imageUrl as string;
    }
    if (courseData && 'artUrl' in courseData && courseData.artUrl) {
      return courseData.artUrl as string;
    }
    return null;
  })();

  const isCompletedCourse =
    courseData && 'id' in courseData && !('title' in courseData);

  return (
    <Container>
      <Header
        leftIcon={ArrowLeft}
        rightIcon={Edit3}
        onLeftPress={handleBackPress}
        onRightPress={handleEditPress}
        title="경로 상세"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageContainer>
          {imageUrl && !imageError && (
            <CourseImage
              source={{ uri: imageUrl }}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          )}
          {(imageError || !imageUrl) && (
            <FallbackContainer>
              <FallbackText>
                {isCompletedCourse && courseData && 'id' in courseData
                  ? `완주 기록 #${(courseData as any).id}`
                  : '이미지가 없습니다'}
              </FallbackText>
            </FallbackContainer>
          )}
          {imageLoading && imageUrl && !imageError && (
            <LoadingImageContainer>
              <ActivityIndicator size="large" color="#007AFF" />
            </LoadingImageContainer>
          )}
        </ImageContainer>

        <InfoContainer>
          <Title>
            {isCompletedCourse && courseData && 'id' in courseData
              ? `완주 기록 #${(courseData as any).id}`
              : courseData && 'title' in courseData
                ? (courseData as any).title || '경로 정보'
                : '경로 정보'}
          </Title>

          {address && (
            <InfoRow>
              <InfoLabel>출발지</InfoLabel>
              <InfoValue>{address}</InfoValue>
            </InfoRow>
          )}

          <InfoRow>
            <InfoLabel>거리</InfoLabel>
            <InfoValue>
              {formatDistance(
                'distance' in courseData
                  ? courseData.distance
                  : 'length' in courseData
                    ? courseData.length
                    : 0,
              )}
            </InfoValue>
          </InfoRow>

          {courseData && 'time' in courseData ? (
            <InfoRow>
              <InfoLabel>예상 시간</InfoLabel>
              <InfoValue>{formatTime((courseData as any).time)}</InfoValue>
            </InfoRow>
          ) : courseData &&
            'duration' in courseData &&
            (courseData as any).duration ? (
            <InfoRow>
              <InfoLabel>실제 시간</InfoLabel>
              <InfoValue>{formatTime((courseData as any).duration)}</InfoValue>
            </InfoRow>
          ) : null}

          {courseData && 'createdAt' in courseData ? (
            <InfoRow>
              <InfoLabel>생성일</InfoLabel>
              <InfoValue>{formatDate((courseData as any).createdAt)}</InfoValue>
            </InfoRow>
          ) : courseData &&
            'endAt' in courseData &&
            (courseData as any).endAt ? (
            <InfoRow>
              <InfoLabel>완주일</InfoLabel>
              <InfoValue>{formatDate((courseData as any).endAt)}</InfoValue>
            </InfoRow>
          ) : null}

          {courseData && 'author' in courseData ? (
            <InfoRow isLast>
              <InfoLabel>작성자</InfoLabel>
              <InfoValue>
                {typeof (courseData as any).author === 'string'
                  ? (courseData as any).author
                  : (courseData as any).author.nickname}
              </InfoValue>
            </InfoRow>
          ) : courseData &&
            'calories' in courseData &&
            (courseData as any).calories ? (
            <InfoRow isLast>
              <InfoLabel>칼로리</InfoLabel>
              <InfoValue>{(courseData as any).calories} kcal</InfoValue>
            </InfoRow>
          ) : null}
        </InfoContainer>
      </ScrollView>

      <BottomContainer paddingBottom={insets.bottom + 16}>
        <ShareButton onPress={shareCourse}>
          <Share size={24} color="#007AFF" />
        </ShareButton>

        <DrawButton
          onPressIn={startPress}
          onPressOut={stopPress}
          activeOpacity={0.8}
        >
          <DrawButtonProgress
            style={{
              width: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
          <DrawButtonText>
            {isPressing
              ? isCompletedCourse
                ? '인증하기...'
                : '그리기...'
              : isCompletedCourse
                ? '인증하기'
                : '그리기'}
          </DrawButtonText>
        </DrawButton>
      </BottomContainer>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
  backgroundColor: '#ffffff',
});

const LoadingContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const LoadingText = styled.Text({
  marginTop: 16,
  fontSize: 16,
  color: '#666666',
});

const ErrorContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 32,
});

const ErrorText = styled.Text({
  fontSize: 16,
  color: '#666666',
  textAlign: 'center',
  marginBottom: 24,
});

const RetryButton = styled(TouchableOpacity)({
  backgroundColor: '#007AFF',
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 8,
});

const RetryButtonText = styled.Text({
  color: '#ffffff',
  fontSize: 16,
  fontWeight: '600',
});

const ImageContainer = styled.View({
  aspectRatio: 1,
  backgroundColor: '#f5f5f5',
});

const CourseImage = styled(Image)({
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
});

const InfoContainer = styled.View({
  padding: 20,
});

const Title = styled.Text({
  fontSize: 24,
  fontWeight: 'bold',
  color: '#000000',
  marginBottom: 24,
});

const InfoRow = styled.View<{ isLast?: boolean }>(({ isLast }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
  borderBottomWidth: isLast ? 0 : 1,
  borderBottomColor: '#f0f0f0',
}));

const InfoLabel = styled.Text({
  fontSize: 16,
  color: '#666666',
  fontWeight: '500',
});

const InfoValue = styled.Text({
  fontSize: 16,
  color: '#000000',
  flex: 1,
  textAlign: 'right',
});

const BottomContainer = styled.View<{ paddingBottom: number }>(
  ({ paddingBottom }) => ({
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  }),
);

const ShareButton = styled(TouchableOpacity)({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#f8f9fa',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
});

const DrawButton = styled(TouchableOpacity)({
  flex: 1,
  height: 48,
  backgroundColor: '#f0f0f0',
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
});

const DrawButtonProgress = styled(Animated.View)({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  backgroundColor: '#007AFF',
  borderRadius: 8,
});

const DrawButtonText = styled(Text)({
  color: '#000000',
  fontSize: 16,
  fontWeight: '600',
  zIndex: 1,
});

const FallbackContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
});

const FallbackText = styled.Text({
  fontSize: 16,
  color: '#666666',
  textAlign: 'center',
});

const LoadingImageContainer = styled.View({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
});
