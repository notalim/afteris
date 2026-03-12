import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors, BorderRadius } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  style?: ViewStyle;
}

export function ProgressBar({ progress, style }: ProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 400 });
  }, [progress, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={[styles.track, style]}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.pill,
    overflow: 'hidden',
  } as ViewStyle,
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
  } as ViewStyle,
});
