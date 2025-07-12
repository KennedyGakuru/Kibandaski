import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, StyleProp, ViewStyle } from 'react-native';

interface LoaderProps {
  size?: number; // default = 48
  style?: StyleProp<ViewStyle>;
}

const Loader: React.FC<LoaderProps> = ({ size = 48, style }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    bounce.start();
    return () => bounce.stop();
  }, [bounceAnim]);

  const bounceHeight = size * 0.3; // 30% bounce
  const shadowSize = size * 0.5;

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -bounceHeight],
  });

  const shadowScale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={{ width: size, height: size * 2.2, position: 'relative' }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            bottom: size * 0.7,
            left: 0,
            borderRadius: size / 2,
            borderTopRightRadius: 0,
            borderWidth: size * 0.3,
            borderColor: '#f97316',
            backgroundColor: 'transparent',
            transform: [{ translateY }, { rotate: '135deg' }],
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            top: size * 1.8,
            left: size * 0.25,
            width: shadowSize,
            height: size * 0.125,
            borderRadius: shadowSize / 2,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            transform: [{ scaleX: shadowScale }, { scaleY: shadowScale }],
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Loader;
