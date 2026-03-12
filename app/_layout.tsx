import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { initializeDatabase } from '@/db/schema';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { useState } from 'react';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await initializeDatabase();
      } catch (e) {
        console.error('DB init error:', e);
      }
      setDbReady(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  if (!fontsLoaded || !dbReady) {
    return (
      <View style={loadingStyles.container}>
        <Text style={loadingStyles.text}>Afteris</Text>
      </View>
    );
  }

  return (
    <OnboardingProvider>
      <RootLayoutNav />
    </OnboardingProvider>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A2E',
  },
});

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { hasCompletedOnboarding } = useOnboarding();

  useEffect(() => {
    if (hasCompletedOnboarding === null) return;

    const inOnboarding = segments[0] === '(onboarding)';

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/(onboarding)/step1-welcome');
    } else if (hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hasCompletedOnboarding, segments, router]);

  useEffect(() => {
    if (hasCompletedOnboarding !== null) {
      SplashScreen.hideAsync();
    }
  }, [hasCompletedOnboarding]);

  if (hasCompletedOnboarding === null) {
    return (
      <View style={loadingStyles.container}>
        <Text style={loadingStyles.text}>Afteris</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
