import React, { useRef } from 'react';
import { View, TextInput, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FloatingLabelInputProps } from '@/types';

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  onFocus,
  onBlur,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  icon,
  rightIcon,
  onRightIconPress,
  focused = false,
  testID
}) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    onFocus?.();
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    onBlur?.();
    if (!value) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    position: 'absolute' as const,
    left: icon ? 45 : 16,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [20, -8],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(255,255,255,0.7)', focused ? '#fff' : 'rgba(255,255,255,0.9)'],
    }),
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', 'rgba(234, 88, 12, 0.8)'],
    }),
    paddingHorizontal: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 8],
    }),
    borderRadius: 4,
    zIndex: 1,
  };

  return (
    <View className="mb-6">
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <View className={`flex-row items-center bg-white/15 rounded-2xl px-4 border-2 min-h-[56px] ${
        focused ? 'bg-white/25 border-white/50' : 'border-transparent'
      }`}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? '#fff' : 'rgba(255,255,255,0.7)'}
            className="mr-3"
          />
        )}
        <TextInput
          className={`flex-1 text-white text-base py-4 ${icon ? 'pl-0' : 'pl-4'}`}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          placeholderTextColor="transparent"
          testID={testID}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            className="p-2"
            testID={testID ? `${testID}-right-icon` : undefined}
          >
            <Ionicons name={rightIcon} size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FloatingLabelInput;
