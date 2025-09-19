import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Home, Share2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLOR_TOKENS.primary[500]} />
        <Text style={styles.loadingText}>기록을 불러오는 중...</Text>
      </View>
    );
  }

  if (!recordDetail) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>기록을 찾을 수 없습니다.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleBackPress}>
          <Text style={styles.retryButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        leftIcon={ArrowLeft}
        rightIcon={Share2}
        onLeftPress={handleBackPress}
        onRightPress={handleSharePress}
        title="런닝 기록"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 이미지 영역 */}
        {availableImages.length > 0 && (
          <View style={styles.imageContainer}>
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
                <View key={index} style={styles.imageWrapper}>
                  {imageLoading && index === currentImageIndex && (
                    <View style={styles.imageLoadingContainer}>
                      <ActivityIndicator
                        size="large"
                        color={COLOR_TOKENS.primary[500]}
                      />
                    </View>
                  )}
                  {imageError && index === currentImageIndex ? (
                    <View style={styles.imageErrorContainer}>
                      <Text style={styles.imageErrorText}>
                        이미지를 불러올 수 없습니다
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: image.url }}
                      style={styles.image}
                      resizeMode="cover"
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                      onLoadStart={() => setImageLoading(true)}
                    />
                  )}
                  <View style={styles.imageTypeIndicator}>
                    <Text style={styles.imageTypeText}>
                      {image.type === 'art' ? 'GPS 아트' : '인증사진'}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* 이미지 인디케이터 */}
            {availableImages.length > 1 && (
              <View style={styles.imageIndicator}>
                {availableImages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicatorDot,
                      currentImageIndex === index && styles.indicatorDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* 통계 정보 */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>런닝 통계</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>거리</Text>
              <Text style={styles.statValue}>
                {formatDistance(recordDetail.distance)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>시간</Text>
              <Text style={styles.statValue}>
                {formatDuration(recordDetail.duration)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>평균 페이스</Text>
              <Text style={styles.statValue}>
                {formatPace(recordDetail.pace)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>칼로리</Text>
              <Text style={styles.statValue}>{recordDetail.calories}kcal</Text>
            </View>
          </View>
        </View>

        {/* 코스 정보 */}
        {recordDetail.course && (
          <View style={styles.courseContainer}>
            <Text style={styles.courseTitle}>코스 정보</Text>
            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>{recordDetail.course.title}</Text>
            </View>
          </View>
        )}

        {/* 런닝 정보 */}
        <View style={styles.runInfoContainer}>
          <Text style={styles.runInfoTitle}>런닝 정보</Text>

          <View style={styles.runInfoItem}>
            <Text style={styles.runInfoLabel}>시작 시간</Text>
            <Text style={styles.runInfoValue}>
              {formatDate(recordDetail.startAt)}
            </Text>
          </View>

          <View style={styles.runInfoItem}>
            <Text style={styles.runInfoLabel}>종료 시간</Text>
            <Text style={styles.runInfoValue}>
              {formatDate(recordDetail.endAt)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 하단 홈 버튼 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleHomePress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLOR_TOKENS.primary[400], COLOR_TOKENS.primary[600]]}
            style={styles.homeButtonGradient}
          >
            <Home color="#ffffff" size={24} />
            <Text style={styles.homeButtonText}>홈으로</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLOR_TOKENS.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLOR_TOKENS.gray[600],
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLOR_TOKENS.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    height: 400,
    position: 'relative',
  },
  imageWrapper: {
    width: screenWidth,
    height: 400,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR_TOKENS.gray[100],
  },
  imageErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR_TOKENS.gray[100],
  },
  imageErrorText: {
    fontSize: 16,
    color: COLOR_TOKENS.gray[500],
  },
  imageTypeIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageTypeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorDotActive: {
    backgroundColor: '#ffffff',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLOR_TOKENS.gray[900],
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLOR_TOKENS.gray[50],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: COLOR_TOKENS.gray[600],
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR_TOKENS.gray[900],
  },
  courseContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: COLOR_TOKENS.gray[200],
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR_TOKENS.gray[900],
    marginBottom: 12,
  },
  courseInfo: {
    backgroundColor: COLOR_TOKENS.gray[50],
    padding: 16,
    borderRadius: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLOR_TOKENS.gray[800],
  },
  runInfoContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: COLOR_TOKENS.gray[200],
  },
  runInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR_TOKENS.gray[900],
    marginBottom: 16,
  },
  runInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_TOKENS.gray[100],
  },
  runInfoLabel: {
    fontSize: 16,
    color: COLOR_TOKENS.gray[600],
  },
  runInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLOR_TOKENS.gray[900],
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: COLOR_TOKENS.gray[200],
  },
  homeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  homeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
