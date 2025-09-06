import type { RefObject } from 'react';
import * as MediaLibrary from 'expo-media-library';
import type Mapbox from '@rnmapbox/maps';
import Toast from 'react-native-toast-message';

export function useMapCapture(mapRef: RefObject<Mapbox.MapView | null>) {
  const captureMap = async () => {
    if (!mapRef.current) {
      Toast.show({
        type: 'error',
        text1: '캡처에 실패했습니다.',
        text2: '맵이 준비되지 않았습니다.',
      });
      return;
    }

    try {
      const uri = await mapRef.current.takeSnap(true);
      if (uri) {
        await saveImage(uri);
      }
    } catch (error) {
      console.error('Failed to capture map', error);
      Toast.show({
        type: 'error',
        text1: '캡처에 실패했습니다.',
        text2: '오류가 발생했습니다.',
      });
    }
  };

  const saveImage = async (uri: string) => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: '저장 권한이 필요합니다.',
        text2: '설정에서 권한을 허용해주세요.',
      });
      return;
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      let album = await MediaLibrary.getAlbumAsync('Runova');
      if (album === null) {
        album = await MediaLibrary.createAlbumAsync('Runova', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      Toast.show({
        type: 'success',
        text1: '성공적으로 캡처했습니다.',
        text2: '갤러리에 이미지를 저장했습니다.',
      });
    } catch (error) {
      console.error('Failed to save image', error);
      Toast.show({
        type: 'error',
        text1: '이미지 저장에 실패했습니다.',
      });
    }
  };

  return { captureMap };
}
