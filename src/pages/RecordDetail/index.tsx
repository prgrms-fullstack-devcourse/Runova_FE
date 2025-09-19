import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Home, Share2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from '@emotion/native';

import Header from '@/components/Header';
import { getRunningRecordDetail } from '@/services/running.service';
import useAuthStore from '@/store/auth';
import {
  formatDate,
  formatDistance,
  formatTime,
  formatPace,
} from '@/utils/formatters';
import { COLOR_TOKENS } from '@/constants/colors';
import type { RecordsStackParamList } from '@/navigation/RecordsStackNavigator';
import type { RunningRecordDetail } from '@/types/records.types';

type Props = NativeStackScreenProps<RecordsStackParamList, 'RecordDetail'>;

const { width: screenWidth } = Dimensions.get('window');

export default function RecordDetail({ route, navigation }: Props) {
  const { recordId } = route.params;
  const [recordDetail, setRecordDetail] = useState<RunningRecordDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { accessToken } = useAuthStore();
  const insets = useSafeAreaInsets();

  const availableImages = recordDetail
    ? [
        ...(recordDetail.artUrl
          ? [{ type: 'art', url: recordDetail.artUrl }]
          : []),
        ...(recordDetail.imageUrl
          ? [{ type: 'photo', url: recordDetail.imageUrl }]
          : []),
      ]
    : [];

  useEffect(() => {
    fetchRecordDetail();
  }, [recordId]);

  const fetchRecordDetail = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const data = await getRunningRecordDetail(recordId, accessToken);
      setRecordDetail(data);
    } catch (error) {
      console.error('런닝 기록 상세 조회 실패:', error);
      Alert.alert('오류', '런닝 기록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleHomePress = () => {
    navigation.navigate('RecordsMain');
  };

  const handleSharePress = () => {
    Alert.alert('공유', '런닝 기록을 공유합니다.');
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoading(false);
  };

  const formatDuration = (duration: number): string => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${seconds}초`;
    } else {
      return `${minutes}분 ${seconds}초`;
    }
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color={COLOR_TOKENS.primary[500]} />
        <LoadingText>기록을 불러오는 중...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!recordDetail) {
    return (
      <ErrorContainer>
        <ErrorText>기록을 찾을 수 없습니다.</ErrorText>
        <RetryButton onPress={handleBackPress}>
          <RetryButtonText>돌아가기</RetryButtonText>
        </RetryButton>
      </ErrorContainer>
    );
  }

  return (
    <Container paddingTop={insets.top}>
      <Header
        leftIcon={ArrowLeft}
        rightIcon={Share2}
        onLeftPress={handleBackPress}
        onRightPress={handleSharePress}
        title="런닝 기록"
      />

      <Content showsVerticalScrollIndicator={false}>
        {/* 이미지 영역 */}
        {availableImages.length > 0 && (
          <ImageContainer>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / screenWidth,
                );
                setCurrentImageIndex(newIndex);
              }}
            >
              {availableImages.map((image, index) => (
                <ImageWrapper key={index} isArt={image.type === 'art'}>
                  {imageLoading && index === currentImageIndex && (
                    <ImageLoadingContainer>
                      <ActivityIndicator
                        size="large"
                        color={COLOR_TOKENS.primary[500]}
                      />
                    </ImageLoadingContainer>
                  )}
                  {imageError && index === currentImageIndex ? (
                    <ImageErrorContainer>
                      <ImageErrorText>
                        이미지를 불러올 수 없습니다
                      </ImageErrorText>
                    </ImageErrorContainer>
                  ) : (
                    <StyledImage
                      source={{ uri: image.url }}
                      resizeMode="contain"
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                      onLoadStart={() => setImageLoading(true)}
                    />
                  )}
                  <ImageTypeIndicator>
                    <ImageTypeText>
                      {image.type === 'art' ? 'GPS 아트' : '경로 사진'}
                    </ImageTypeText>
                  </ImageTypeIndicator>
                </ImageWrapper>
              ))}
            </ScrollView>

            {/* 이미지 인디케이터 */}
            {availableImages.length > 1 && (
              <ImageIndicator>
                {availableImages.map((_, index) => (
                  <IndicatorDot
                    key={index}
                    isActive={currentImageIndex === index}
                  />
                ))}
              </ImageIndicator>
            )}
          </ImageContainer>
        )}

        {/* 통계 정보 */}
        <StatsContainer>
          <StatsTitle>런닝 통계</StatsTitle>

          <StatsGrid>
            <StatItem>
              <StatLabel>거리</StatLabel>
              <StatValue>{formatDistance(recordDetail.distance)}</StatValue>
            </StatItem>

            <StatItem>
              <StatLabel>시간</StatLabel>
              <StatValue>{formatDuration(recordDetail.duration)}</StatValue>
            </StatItem>

            <StatItem>
              <StatLabel>평균 페이스</StatLabel>
              <StatValue>{formatPace(recordDetail.pace)}</StatValue>
            </StatItem>

            <StatItem>
              <StatLabel>칼로리</StatLabel>
              <StatValue>{recordDetail.calories}kcal</StatValue>
            </StatItem>
          </StatsGrid>
        </StatsContainer>

        {/* 코스 정보 */}
        {recordDetail.course && (
          <CourseContainer>
            <CourseTitle>코스 정보</CourseTitle>
            <CourseInfo>
              <CourseName>{recordDetail.course.title}</CourseName>
            </CourseInfo>
          </CourseContainer>
        )}

        {/* 런닝 정보 */}
        <RunInfoContainer>
          <RunInfoTitle>런닝 정보</RunInfoTitle>

          <RunInfoItem>
            <RunInfoLabel>시작 시간</RunInfoLabel>
            <RunInfoValue>{formatDateTime(recordDetail.startAt)}</RunInfoValue>
          </RunInfoItem>

          <RunInfoItem>
            <RunInfoLabel>종료 시간</RunInfoLabel>
            <RunInfoValue>{formatDateTime(recordDetail.endAt)}</RunInfoValue>
          </RunInfoItem>
        </RunInfoContainer>
      </Content>

      {/* 하단 홈 버튼 */}
      <BottomContainer>
        <HomeButton onPress={handleHomePress} activeOpacity={0.8}>
          <HomeButtonGradient
            colors={['#1a1a1a', '#2d2d2d', '#404040']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <HomeButtonContent>
            <Home color="#ffffff" size={24} />
            <HomeButtonText>홈으로</HomeButtonText>
          </HomeButtonContent>
        </HomeButton>
      </BottomContainer>
    </Container>
  );
}

// Emotion Styled Components
const Container = styled.View<{ paddingTop: number }>(({ paddingTop }) => ({
  flex: 1,
  backgroundColor: '#ffffff',
  paddingTop,
}));

const LoadingContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#ffffff',
});

const LoadingText = styled.Text({
  marginTop: 16,
  fontSize: 16,
  color: COLOR_TOKENS.gray[600],
});

const ErrorContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#ffffff',
  padding: 20,
});

const ErrorText = styled.Text({
  fontSize: 18,
  color: COLOR_TOKENS.gray[600],
  textAlign: 'center',
  marginBottom: 20,
});

const RetryButton = styled.TouchableOpacity({
  backgroundColor: COLOR_TOKENS.primary[500],
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 8,
});

const RetryButtonText = styled.Text({
  color: '#ffffff',
  fontSize: 16,
  fontWeight: '600',
});

const Content = styled.ScrollView({
  flex: 1,
});

const ImageContainer = styled.View({
  height: 400,
  position: 'relative',
});

const ImageWrapper = styled.View<{ isArt: boolean }>(({ isArt }) => ({
  width: screenWidth,
  height: 400,
  position: 'relative',
  backgroundColor: isArt ? '#000000' : '#ffffff',
}));

const StyledImage = styled.Image({
  width: '100%',
  height: '100%',
});

const ImageLoadingContainer = styled.View({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: COLOR_TOKENS.gray[100],
});

const ImageErrorContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: COLOR_TOKENS.gray[100],
});

const ImageErrorText = styled.Text({
  fontSize: 16,
  color: COLOR_TOKENS.gray[500],
});

const ImageTypeIndicator = styled.View({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
});

const ImageTypeText = styled.Text({
  color: '#ffffff',
  fontSize: 12,
  fontWeight: '600',
});

const ImageIndicator = styled.View({
  position: 'absolute',
  bottom: 16,
  left: 0,
  right: 0,
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 8,
});

const IndicatorDot = styled.View<{ isActive: boolean }>(({ isActive }) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
}));

const StatsContainer = styled.View({
  padding: 20,
  backgroundColor: '#ffffff',
});

const StatsTitle = styled.Text({
  fontSize: 20,
  fontWeight: '700',
  color: COLOR_TOKENS.gray[900],
  marginBottom: 16,
});

const StatsGrid = styled.View({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 16,
});

const StatItem = styled.View({
  flex: 1,
  minWidth: '45%',
  backgroundColor: COLOR_TOKENS.gray[50],
  padding: 16,
  borderRadius: 12,
  alignItems: 'center',
});

const StatLabel = styled.Text({
  fontSize: 14,
  color: COLOR_TOKENS.gray[600],
  marginBottom: 4,
});

const StatValue = styled.Text({
  fontSize: 18,
  fontWeight: '700',
  color: COLOR_TOKENS.gray[900],
});

const CourseContainer = styled.View({
  padding: 20,
  backgroundColor: '#ffffff',
});

const CourseTitle = styled.Text({
  fontSize: 18,
  fontWeight: '700',
  color: COLOR_TOKENS.gray[900],
  marginBottom: 12,
});

const CourseInfo = styled.View({
  backgroundColor: COLOR_TOKENS.gray[50],
  padding: 16,
  borderRadius: 12,
});

const CourseName = styled.Text({
  fontSize: 16,
  fontWeight: '600',
  color: COLOR_TOKENS.gray[800],
});

const RunInfoContainer = styled.View({
  padding: 20,
  backgroundColor: '#ffffff',
});

const RunInfoTitle = styled.Text({
  fontSize: 18,
  fontWeight: '700',
  color: COLOR_TOKENS.gray[900],
  marginBottom: 16,
});

const RunInfoItem = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: COLOR_TOKENS.gray[100],
});

const RunInfoLabel = styled.Text({
  fontSize: 16,
  color: COLOR_TOKENS.gray[600],
});

const RunInfoValue = styled.Text({
  fontSize: 16,
  fontWeight: '600',
  color: COLOR_TOKENS.gray[900],
});

const BottomContainer = styled.View({
  padding: 20,
  backgroundColor: '#ffffff',
});

const HomeButton = styled.TouchableOpacity({
  height: 56,
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
});

const HomeButtonGradient = styled(LinearGradient)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 8,
});

const HomeButtonContent = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  zIndex: 1,
});

const HomeButtonText = styled.Text({
  color: '#ffffff',
  fontSize: 16,
  fontWeight: '600',
});
