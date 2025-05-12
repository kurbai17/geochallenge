module.exports = {
  project: {
    android: {
      sourceDir: './android',
      appName: 'app',
      packageName: 'com.kurbai.geochallenge',
    },
  },
  assets: ['./assets/fonts'],
  dependencies: {
    'react-native-maps': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-maps/android',
        },
      },
    },
    'react-native-reanimated': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-reanimated/android',
        },
      },
    },
    'react-native-screens': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-screens/android',
        },
      },
    },
    'react-native-gesture-handler': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-gesture-handler/android',
        },
      },
    },
    'react-native-webview': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-webview/android',
        },
      },
    },
    'react-native-linear-gradient': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-linear-gradient/android',
        },
      },
    },
    'react-native-splash-screen': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-splash-screen/android',
        },
      },
    },
    'react-native-app-auth': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-app-auth/android',
        },
      },
    },
    'react-native-safe-area-context': {
      platforms: {
        android: {
          sourceDir: './node_modules/react-native-safe-area-context/android',
        },
      },
    },
  },
};
