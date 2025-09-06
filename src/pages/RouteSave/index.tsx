import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '@/styles/theme';
import Header from '@/components/Header';
import { reverseGeocode } from '@/utils/geocoding';
import { createCourse } from '@/lib/coursesApi';
import { useImageUpload } from '@/hooks/useImageUpload';
import useAuthStore from '@/store/auth';
import useDrawStore from '@/store/draw';
import { useRouteSaveStore } from '@/store/routeSave';
import type { RouteStackParamList } from '@/navigation/RouteStackNavigator';

type RouteSaveScreenNavigationProp = NativeStackNavigationProp<
  RouteStackParamList,
  'RouteSave'
>;

export default function RouteSave() {
  const navigation = useNavigation<RouteSaveScreenNavigationProp>();
  const routeData = useRouteSaveStore((s) => s.routeData);

  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('위치 정보를 가져오는 중...');
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(!!routeData?.imageURL);
  const [imageError, setImageError] = useState(false);

  const accessToken = useAuthStore((s) => s.accessToken);
  const clearAll = useDrawStore((s) => s.clearAll);
  const clearRouteData = useRouteSaveStore((s) => s.clearRouteData);
  const { uploadImage } = useImageUpload();

  useEffect(() => {
    if (!routeData) {
      navigation.goBack();
      return;
    }

    const fetchAddress = async () => {
      try {
        const result = await reverseGeocode(routeData.startLocation);
        setAddress(result.address);
      } catch (error) {
        setAddress('위치 정보를 가져올 수 없습니다');
      }
    };

    fetchAddress();
  }, [routeData, navigation]);

  const handleBackPress = () => {
    clearRouteData();
    navigation.goBack();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('오류', '경로 이름을 입력해주세요.');
      return;
    }

    if (!accessToken) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    if (!routeData) {
      Alert.alert('오류', '경로 데이터가 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      // 저장 시에만 이미지를 S3에 업로드
      let finalImageURL = '';
      if (routeData.imageURL && routeData.imageURL.startsWith('file://')) {
        finalImageURL = await uploadImage(routeData.imageURL, accessToken);
      } else {
        finalImageURL = routeData.imageURL;
      }

      const courseData = {
        title: title.trim(),
        imageURL: finalImageURL,
        path: routeData.path,
      };

      await createCourse(courseData, accessToken);

      Alert.alert('성공', '경로가 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            clearAll();
            clearRouteData();
            navigation.reset({
              index: 0,
              routes: [{ name: 'RouteMain' }],
            });
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('오류', '경로 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="경로 저장"
        leftIcon={ArrowLeft}
        onLeftPress={handleBackPress}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 시작 위치 */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>시작 위치</Text>
          <Text style={styles.addressText}>{address}</Text>
        </View>

        {/* 경로 이름 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>경로 이름</Text>
          <TextInput
            style={styles.textInput}
            placeholder="경로 이름을 입력하세요"
            value={title}
            onChangeText={setTitle}
            maxLength={50}
            autoFocus
          />
        </View>

        {/* 경로 이미지 */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>경로 미리보기</Text>
          <View style={styles.imageContainer}>
            {routeData?.imageURL &&
            routeData.imageURL.trim() !== '' &&
            !imageError ? (
              <>
                <Image
                  source={{ uri: routeData.imageURL }}
                  style={styles.routeImage}
                  resizeMode="cover"
                  onLoadStart={() => {
                    setImageLoading(true);
                    setImageError(false);
                  }}
                  onLoadEnd={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />
                {imageLoading && (
                  <View style={styles.imageLoadingOverlay}>
                    <ActivityIndicator color={theme.colors.primary[500]} />
                  </View>
                )}
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>
                  {imageError
                    ? '이미지 로딩 실패\n(권한 또는 네트워크 문제)'
                    : !routeData?.imageURL || routeData.imageURL.trim() === ''
                      ? '이미지가 없습니다'
                      : '이미지를 불러올 수 없습니다'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 저장 버튼 */}
      <View style={styles.buttonContainer}>
        <View
          style={[
            styles.saveButton,
            (!title.trim() || isSaving) && styles.saveButtonDisabled,
          ]}
          onTouchEnd={handleSave}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>저장하기</Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  inputSection: {
    marginBottom: 32,
  },
  imageSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray[900],
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.gray[900],
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    alignItems: 'center',
  },
  routeImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: theme.colors.gray[500],
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
  },
  saveButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
