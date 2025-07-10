import { useEffect, useRef } from 'react';
import { ViewStyle, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SkeletonLoaderProps {
  width: number | `${number}%` | 'auto';
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width,
  height,
  borderRadius = 4,
  style,
}: SkeletonLoaderProps) {
  const { isDark } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: isDark
      ? ['#374151', '#4b5563'] // dark shimmer
      : ['#e5e7eb', '#f3f4f6'], // light shimmer
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}
