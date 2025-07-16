export default () => ({
  name: "kibandaski",
  slug: "kibandaski",
  version: "1.0.0",
  scheme: "kibandaski",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000000"  // Changed to black to match your theme
  },
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    statusBarStyle: "auto",
    userInterfaceStyle: "automatic"
  },
  android: {
    icon: "./assets/icon.png",
    permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
    package: "com.kengakuru.kibandaski",
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY

      }
    },
    // Navigation bar configuration to fix white stripe
    navigationBar: {
      backgroundColor: "#000000",
      barStyle: "dark-content"
    },
    // Status bar configuration
    statusBar: {
      backgroundColor: "#000000",
      barStyle: "dark-content",
      translucent: false,
      hidden: false
    },
    // Additional Android-specific configurations
    softwareKeyboardLayoutMode: "pan",
    allowBackup: true,
    theme: "@style/AppTheme"
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro",
    output: "single"
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-web-browser", 
    [
      "expo-splash-screen",
      {
        backgroundColor: "#000000",
        image: "./assets/splash.png",
        imageWidth: 200,
        resizeMode: "contain",
        placement: "center"
      }
    ]
  ],
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true
  },
  extra: {
    router: {},
    eas: {
      projectId: "f90f33c2-8426-4f6a-8cfc-25c58e21e717"
    },
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  }
});