import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'hasCompletedOnboarding';

interface OnboardingContextType {
  hasCompletedOnboarding: boolean | null;
  completeOnboarding: () => Promise<void>;
  skipToApp: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType>({
  hasCompletedOnboarding: null,
  completeOnboarding: async () => {},
  skipToApp: async () => {},
});

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(value === 'true');
      } catch {
        setHasCompletedOnboarding(false);
      }
    }
    load();
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasCompletedOnboarding(true);
  }, []);

  const skipToApp = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasCompletedOnboarding(true);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{ hasCompletedOnboarding, completeOnboarding, skipToApp }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
