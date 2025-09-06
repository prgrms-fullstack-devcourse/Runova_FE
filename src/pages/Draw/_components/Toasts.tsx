import Toast from 'react-native-toast-message';

export const showMapCaptureSuccess = () => {
  Toast.show({
    type: 'success',
    text1: '맵 캡처 성공',
    text2: '이미지가 캡처되었습니다.',
  });
};

export const showImageUploadSuccess = () => {
  Toast.show({
    type: 'success',
    text1: '이미지 업로드 성공',
    text2: '경로 이미지가 업로드되었습니다.',
  });
};

export const showImageProcessingError = (errorMessage: string) => {
  Toast.show({
    type: 'error',
    text1: '이미지 처리 실패',
    text2: errorMessage,
  });
};

export const showCourseSaveSuccess = () => {
  Toast.show({
    type: 'success',
    text1: '경로 저장 성공',
    text2: '경로가 성공적으로 저장되었습니다.',
  });
};

export const showCourseSaveError = (errorMessage: string) => {
  Toast.show({
    type: 'error',
    text1: '경로 저장 실패',
    text2: errorMessage,
  });
};
