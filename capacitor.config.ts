import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.atikanaliz.app',
  appName: 'AtikAnaliz',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
    backgroundColor: '#0b0e17',
    allowMixedContent: true,
  },
  plugins: {
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#111520',
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0b0e17',
      showSpinner: false,
    },
  },
};

export default config;
