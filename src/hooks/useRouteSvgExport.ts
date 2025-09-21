import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Toast from 'react-native-toast-message';
import type { Feature, LineString } from 'geojson';
import { convertRoutesToSvg } from '@/utils/svgExport';

export function useRouteSvgExport() {
  const exportRouteAsSvg = async (
    routes: Feature<LineString>[],
    fileName: string,
  ) => {
    if (routes.length === 0) {
      Toast.show({
        type: 'info',
        text1: '경로가 없습니다.',
        text2: 'SVG로 저장할 경로가 없습니다.',
      });
      return;
    }

    const svgString = convertRoutesToSvg(routes, { width: 500, height: 500 });
    const fileUri = `${FileSystem.cacheDirectory}${fileName}.svg`;

    try {
      await FileSystem.writeAsStringAsync(fileUri, svgString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: '저장 권한이 필요합니다.',
          text2: '설정에서 권한을 허용해주세요.',
        });
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      let album = await MediaLibrary.getAlbumAsync('Runova');
      if (album === null) {
        album = await MediaLibrary.createAlbumAsync('Runova', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      Toast.show({
        type: 'success',
        text1: 'SVG 경로 저장 성공',
        text2: '갤러리에 경로 SVG 파일을 저장했습니다.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'SVG 저장 실패',
        text2: '오류가 발생했습니다.',
      });
    }
  };

  return { exportRouteAsSvg };
}
