import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.restohub.app',
  appName: 'RestoHub',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#1e40af',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  android: {
    buildOptions: {
      keystorePath: 'release.keystore',
      keystorePassword: process.env.KEYSTORE_PASSWORD || 'default',
      keyAlias: process.env.KEY_ALIAS || 'restohub',
      keyPassword: process.env.KEY_PASSWORD || 'default',
    },
  },
};

export default config;
