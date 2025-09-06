import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import styled from '@emotion/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const SAVE_BUTTON_BOTTOM_OFFSET = 20;

type RouteSaveScreenNavigationProp = NativeStackNavigationProp<
  RouteStackParamList,
  'RouteSave'
>;

export default function RouteSave() {
  const navigation = useNavigation<RouteSaveScreenNavigationProp>();
  const routeData = useRouteSaveStore((s) => s.routeData);
  const insets = useSafeAreaInsets();

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
    <StyledKeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="경로 저장"
        leftIcon={ArrowLeft}
        onLeftPress={handleBackPress}
      />

      <StyledScrollView showsVerticalScrollIndicator={false}>
        <StyledLocationSection>
          <StyledSectionTitle>시작 위치</StyledSectionTitle>
          <StyledAddressText>{address}</StyledAddressText>
        </StyledLocationSection>

        <StyledInputSection>
          <StyledSectionTitle>경로 이름</StyledSectionTitle>
          <StyledTextInput
            placeholder="경로 이름을 입력하세요"
            value={title}
            onChangeText={setTitle}
            maxLength={50}
            autoFocus
          />
        </StyledInputSection>

        <StyledImageSection>
          <StyledSectionTitle>경로 미리보기</StyledSectionTitle>
          <StyledImageContainer>
            {routeData?.imageURL &&
            routeData.imageURL.trim() !== '' &&
            !imageError ? (
              <>
                <StyledRouteImage
                  source={{ uri: routeData.imageURL }}
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
                  <StyledImageLoadingOverlay>
                    <ActivityIndicator color={theme.colors.primary[500]} />
                  </StyledImageLoadingOverlay>
                )}
              </>
            ) : (
              <StyledImagePlaceholder>
                <StyledPlaceholderText>
                  {imageError
                    ? '이미지 로딩 실패\n(권한 또는 네트워크 문제)'
                    : !routeData?.imageURL || routeData.imageURL.trim() === ''
                      ? '이미지가 없습니다'
                      : '이미지를 불러올 수 없습니다'}
                </StyledPlaceholderText>
              </StyledImagePlaceholder>
            )}
          </StyledImageContainer>
        </StyledImageSection>
      </StyledScrollView>

      <StyledButtonContainer
        style={{ paddingBottom: insets.bottom + SAVE_BUTTON_BOTTOM_OFFSET }}
      >
        <StyledSaveButton
          disabled={!title.trim() || isSaving}
          onTouchEnd={handleSave}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <StyledSaveButtonText>저장하기</StyledSaveButtonText>
          )}
        </StyledSaveButton>
      </StyledButtonContainer>
    </StyledKeyboardAvoidingView>
  );
}

const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: #ffffff;
`;

const StyledScrollView = styled(ScrollView)`
  flex: 1;
  padding-horizontal: 20px;
`;

const StyledLocationSection = styled(View)`
  margin-top: 24px;
  margin-bottom: 32px;
`;

const StyledInputSection = styled(View)`
  margin-bottom: 32px;
`;

const StyledImageSection = styled(View)`
  margin-bottom: 32px;
`;

const StyledSectionTitle = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin-bottom: 12px;
`;

const StyledAddressText = styled(Text)`
  font-size: 14px;
  color: ${theme.colors.gray[600]};
  line-height: 20px;
`;

const StyledTextInput = styled(TextInput)`
  border-width: 1px;
  border-color: ${theme.colors.gray[300]};
  border-radius: 8px;
  padding-horizontal: 16px;
  padding-vertical: 12px;
  font-size: 16px;
  color: ${theme.colors.gray[900]};
  background-color: #ffffff;
`;

const StyledImageContainer = styled(View)`
  align-items: center;
`;

const StyledRouteImage = styled(Image)`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
`;

const StyledImagePlaceholder = styled(View)`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  background-color: ${theme.colors.gray[100]};
  justify-content: center;
  align-items: center;
`;

const StyledPlaceholderText = styled(Text)`
  font-size: 14px;
  color: ${theme.colors.gray[500]};
`;

const StyledImageLoadingOverlay = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  justify-content: center;
  align-items: center;
  border-radius: 8px;
`;

const StyledButtonContainer = styled(View)`
  padding-horizontal: 20px;
  padding-top: 16px;
`;

const StyledSaveButton = styled(View)<{ disabled?: boolean }>`
  background-color: ${(props) =>
    props.disabled ? theme.colors.gray[300] : theme.colors.primary[500]};
  border-radius: 8px;
  padding-vertical: 16px;
  align-items: center;
  justify-content: center;
  min-height: 56px;
`;

const StyledSaveButtonText = styled(Text)`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
`;
