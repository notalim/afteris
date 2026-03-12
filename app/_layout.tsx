import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Lora_400Regular,
  Lora_700Bold,
} from '@expo-google-fonts/lora';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeDatabase } from '@/db/schema';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = 'hasCompletedOnboarding';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lora_400Regular,
    Lora_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [dbReady, setDbReady] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await initializeDatabase();
        setDbReady(true);

        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(value === 'true');
      } catch (e) {
        console.error('Initialization error:', e);
        setDbReady(true);
        setHasCompletedOnboarding(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && dbReady && hasCompletedOnboarding !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady, hasCompletedOnboarding]);

  if (!fontsLoaded || !dbReady || hasCompletedOnboarding === null) {
    return (
      <View style={loadingStyles.container}>
        <Text style={loadingStyles.text}>Afteris</Text>
      </View>
    );
  }

  return <RootLayoutNav hasCompletedOnboarding={hasCompletedOnboarding} />;
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

function RootLayoutNav({ hasCompletedOnboarding }: { hasCompletedOnboarding: boolean }) {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inOnboarding = segments[0] === '(onboarding)';

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/(onboarding)/step1-welcome');
    } else if (hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hasCompletedOnboarding, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
