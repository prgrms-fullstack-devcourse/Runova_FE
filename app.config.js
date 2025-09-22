export default {
  expo: {
    name: 'Runova_FE',
    slug: 'Runova_FE',
    owner: 'monicx',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      bundleIdentifier: 'com.chris13404.runova',
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          '인증사진 촬영을 위해 카메라 접근이 필요합니다.',
        NSMicrophoneUsageDescription:
          '비디오 촬영을 위해 마이크 접근이 필요합니다.',
        NSPhotoLibraryUsageDescription:
          '인증사진을 갤러리에 저장하기 위해 사진 라이브러리 접근이 필요합니다.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: false,
      package: 'com.chris13404.runova',
      permissions: [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.READ_MEDIA_VIDEO',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme:
            'com.googleusercontent.apps.1002214636409-e1ofh8ju0ku0jkps7mc5i7l2hiehk6uj',
        },
      ],
      [
        '@rnmapbox/maps',
        {
          RNMapboxMapsDownloadToken:
            process.env.MAPBOX_DOWNLOADS_TOKEN ||
            process.env.EXPO_PUBLIC_MAPBOX_DOWNLOADS_TOKEN,
          RNMapboxMapsAccessToken:
            process.env.MAPBOX_ACCESS_TOKEN ||
            process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
        },
      ],
      [
        'react-native-vision-camera',
        {
          cameraPermissionText:
            '인증사진 촬영을 위해 카메라 접근이 필요합니다.',
          enableMicrophonePermission: true,
          microphonePermissionText:
            '비디오 촬영을 위해 마이크 접근이 필요합니다.',
        },
      ],
    ],
    extra: {
      MAPBOX_ACCESS_TOKEN:
        process.env.MAPBOX_ACCESS_TOKEN ||
        process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
      eas: {
        projectId: '283351db-1496-4db2-b305-7bdc74af3aa5',
      },
    },
  },
};
