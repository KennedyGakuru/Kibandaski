import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {Inter_400Regular,Inter_500Medium,Inter_700Bold} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Loader from '@/components/Loader'; 
import '../global.css';

// Prevent auto-hiding the splash
SplashScreen.preventAutoHideAsync();

function InnerLayout() {
  const { user, loading } = useAuth();
  
  // Don't hide splash screen here - let RootLayout handle it
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  const insets = useSafeAreaInsets();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });

  const [isReady, setIsReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Track when fonts are ready
  useEffect(() => {
    if (fontsLoaded || fontError) {
      setIsReady(true);
    }
  }, [fontsLoaded, fontError]);

  // Only hide splash when BOTH fonts and auth are ready
  useEffect(() => {
    if (isReady && authReady) {
      // Add a small delay to ensure everything is rendered
      setTimeout(() => {
        SplashScreen.hideAsync().catch(console.warn);
      }, 100);
    }
  }, [isReady, authReady]);

  if (!isReady) {
    return (
      <View 
        className="flex-1 bg-white dark:bg-black justify-center items-center"
        style={{ paddingBottom: insets.bottom }}
      >
        <Loader size={64} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <View 
            className="flex-1 bg-white dark:bg-black"
            style={{ paddingBottom: insets.bottom }}
          >
            <AuthReadyWrapper onReady={() => setAuthReady(true)} />
            <StatusBar style="auto" />
          </View>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// Wrapper to track auth readiness
type AuthReadyWrapperProps = {
  onReady: () => void;
};

function AuthReadyWrapper({ onReady }: AuthReadyWrapperProps) {
  const { loading } = useAuth();
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    if (!loading) {
      onReady();
    }
  }, [loading, onReady]);

  if (loading) {
    return (
      <View 
        className="flex-1 bg-white dark:bg-black justify-center items-center"
        style={{ paddingBottom: insets.bottom }}
      >
        <Loader size={64} />
      </View>
    );
  }

  return <InnerLayout />;
}