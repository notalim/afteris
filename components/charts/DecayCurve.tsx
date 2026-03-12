import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/theme';

interface DecayCurveProps {
  halfLifeHours: number;
  width?: number;
  height?: number;
}

export function DecayCurve({ halfLifeHours, width = 64, height = 36 }: DecayCurveProps) {
  const totalHours = halfLifeHours * 4;
  const points: string[] = [];
  const steps = 20;

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * totalHours;
    const fraction = Math.pow(0.5, t / halfLifeHours);
    const x = (i / steps) * width;
    const y = height - fraction * height;
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }

  const pathD = points.join(' ');

  const fillPoints = [...points];
  fillPoints.push(`L${width},${height}`);
  fillPoints.push(`L0,${height}`);
  fillPoints.push('Z');
  const fillD = fillPoints.join(' ');

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Path d={fillD} fill={Colors.primaryLight} opacity={0.5} />
        <Path d={pathD} stroke={Colors.primary} strokeWidth={2} fill="none" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 8,
  } as ViewStyle,
});
