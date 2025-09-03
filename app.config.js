const credentials = require('./credentials');
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
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.chris13404.runova',
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
          RNMapboxMapsDownloadToken: credentials.MAPBOX_SK_TOKEN,
          RNMapboxMapsAccessToken: credentials.MAPBOX_PK_TOKEN,
        },
      ],
    ],
    extra: {
      MAPBOX_PK_TOKEN: credentials.MAPBOX_PK_TOKEN,
      eas: {
        projectId: '283351db-1496-4db2-b305-7bdc74af3aa5',
      },
    },
  },
};
